import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Room } from "./shared/room";
import { Player } from "./shared/player";
import { EventEmitterAsyncResource } from "events";
import { generateBrainrotName, getRandomWords } from "./lib/text/all-texts";
import { CONNECTION, DISCONNECT, DRAW_LINE, DRAWING_UPDATED, GUESS, JOIN_ROOM, MESSAGES_UPDATED, ROOM_UPDATED, START_GAME, TIMER_TICK, WORD_SELECTED } from "./shared/socket-names";
import { DRAWING_TIME, ROUND_CHANGING_TIME, ROUNDS, SELECTING_WORD_TIME, TIMER_UNIT, TURN_RESULT_TIME } from "./lib/constants/all-conts";

type SafeRoom = Omit<Room, 'interval'>

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms: Record<string, Room> = {};

app.get("/", (req, res) => {
  res.json({ message: "hello manoj" });
});

app.post("/create-room", (req, res) => {
  console.log('reached-here');

  const roomId = `room_${Date.now()}`;

  rooms[roomId] = {
    id: roomId,
    curRound: 0,
    maxRounds: 3, // change this ti a global variable next 
    phase: 'waiting',
    players: [],
    turnOrder: [],
    currentDrawerIndex: 0,
    timer: 0,
    currentWord: '',
    wordOptions: [],
    messages: [],
    drawingData: [],
    correctGuesses: []
  }

  res.json({ roomId });
});

io.on(CONNECTION, (socket: Socket) => {

  socket.on(JOIN_ROOM, (roomId: string, player: Player) => {

    if (!rooms[roomId]) return

    socket.join(roomId)

    socket.data.roomId = roomId

    const room: Room = rooms[roomId]

    if (!room) return

    if (!room.players) {
      room.players = []
    }

    // if (room.phase !== 'waiting') return

    const alreadyInRoom = room.players.some(p => p.id === socket.id)
    if (alreadyInRoom) return

    const newPlayer: Player = {
      id: socket.id,
      name: player.name ? player.name : generateBrainrotName(),
      avatarColor: player.avatarColor,
      isHost: room.players.length === 0 ? true : false,
      score: 0
    }

    room.players.push(newPlayer)

    const joinMessage = newPlayer.isHost
      ? `${newPlayer.name} CREATED THE ROOM`
      : `${newPlayer.name} JOINED`


    room.messages?.push({
      playerId: socket.id,
      text: joinMessage,
      type: 'system'
    })

    room.phase = "waiting"

    if (!room.turnOrder) {
      room.turnOrder = []
    }

    room.turnOrder?.push(newPlayer.id)

    updateRoom(room)
    updateMessages(room)
  })

  socket.on(START_GAME, ({ roomId }) => {
    const room = rooms[roomId]

    // if (room.players.length <= 1) {
    //   newSystemMessage(room, 'ATLEST 2 PLAYERS REQUIRED')
    //   return
    // }

    room.curRound = 1

    room.maxRounds = ROUNDS

    room.currentDrawerIndex = 0

    room.phase = 'next-round'

    room.timer = ROUND_CHANGING_TIME

    newSystemMessage(room, 'GAME STARTED!')

    updateRoom(room)

    clearRoomInterval(room)

    room.interval = setInterval(() => {
      room.timer--

      if (room.timer <= 0) {
        clearRoomInterval(room)
        startSelectingWord(room)
      }
    }, TIMER_UNIT);
  })

  socket.on(WORD_SELECTED, ({ word, roomId }) => {
    const room = rooms[roomId]

    clearRoomInterval(room)

    room.currentWord = word ?? room.wordOptions[Math.floor(Math.random() * 3)]

    startDrawing(room)
  })

  socket.on(GUESS, ({ guess, roomId }) => {
    const room = rooms[roomId]
    if (!room || !guess) return

    if (!room.messages) room.messages = []
    if (!room.correctGuesses) room.correctGuesses = []

    const curPlayer = room.players.find(player => player.id === socket.id)
    if (!curPlayer) return

    // prevent guessing if already guessed correctly
    if (room.correctGuesses.includes(socket.id)) return

    // prevent drawer from guessing
    const drawerIndex = room.currentDrawerIndex
    const drawerId = room.turnOrder[drawerIndex]
    if (socket.id === drawerId) return

    const isCorrectGuess = guess.toLowerCase().trim() === room.currentWord.toLowerCase().trim()

    // const curPlayer = room.players.find(player => player.id === socket.id)

    if (!curPlayer) return

    if (isCorrectGuess) {
      room.correctGuesses.push(socket.id)

      // points based on guess order
      const guessPosition = room.correctGuesses.length
      const points = guessPosition === 1 ? 7 : guessPosition === 2 ? 5 : guessPosition === 3 ? 3 : 1

      curPlayer.score = (curPlayer.score ?? 0) + points

      room.messages.push({
        playerId: socket.id,
        type: 'correct',
        text: `${curPlayer.name} GUESSED CORRECT +${points}`,
        player: curPlayer.name,
        points: points.toString()
      })

      updateMessages(room)
      updateRoom(room) // update scores

      // check if all non-drawers guessed correctly
      const nonDrawers = room.players.filter(p => p.id !== drawerId)
      const allGuessed = nonDrawers.every(p => room.correctGuesses!.includes(p.id))

      if (allGuessed) {
        // give drawer points since at least one guessed
        const drawer = room.players.find(p => p.id === drawerId)
        if (drawer) drawer.score = (drawer.score ?? 0) + 5

        clearRoomInterval(room)
        showTurnPoints(room)
      }
    } else {
      room.messages.push({
        playerId: socket.id,
        type: '',
        text: guess,
        player: curPlayer.name,
      })
    }

    updateMessages(room)

  })

  socket.on(DRAW_LINE, (data) => {

    const room = rooms[data.roomId]

    if (!room) return

    if (!room.drawingData) {
      room.drawingData = []
    }

    const line = {
      x1: data.x1,
      y1: data.y1,
      x2: data.x2,
      y2: data.y2,
      color: data.color,
      size: data.size
    }

    room.drawingData.push(line)

    socket.broadcast.to(room.id).emit(DRAWING_UPDATED, line)
  })

  function startSelectingWord(room: Room) {
    clearRoomInterval(room)
    room.phase = 'selecting-word'
    room.timer = SELECTING_WORD_TIME
    room.wordOptions = getRandomWords()
    room.currentWord = ''
    room.correctGuesses = []

    updateRoom(room)

    room.interval = setInterval(() => {
      room.timer--

      io.to(room.id).emit(TIMER_TICK, room.timer)

      if (room.timer <= 0) {
        clearRoomInterval(room)
        room.currentWord = room.wordOptions[Math.floor(Math.random() * 3)]
        startDrawing(room)
      }
    }, TIMER_UNIT);

  }

  function newSystemMessage(room: Room, text: string) {
    room.messages?.push({
      type: 'system',
      text
    })
    updateMessages(room)
  }

  function startDrawing(room: Room) {
    clearRoomInterval(room)
    room.phase = 'drawing'
    room.timer = DRAWING_TIME

    updateRoom(room)

    room.interval = setInterval(() => {

      room.timer--
      io.to(room.id).emit(TIMER_TICK, room.timer)

      if (room.timer <= 0) {
        clearRoomInterval(room)
        showTurnPoints(room)
      }

    }, TIMER_UNIT);
  }

  function showTurnPoints(room: Room) {
    clearRoomInterval(room)

     const correctGuessesSnapshot = [...(room.correctGuesses ?? [])]

    if ((room.correctGuesses?.length ?? 0) > 0) {
      const drawerId = room.turnOrder[room.currentDrawerIndex]
      const drawer = room.players.find(p => p.id === drawerId)
      if (drawer) {
        drawer.score = (drawer.score ?? 0) + 5
        newSystemMessage(room, `${drawer.name} GOT +5 FOR DRAWING`)
      }
    }

    room.phase = 'turn-result'
    room.timer = TURN_RESULT_TIME
    room.drawingData = []
    room.correctGuesses= correctGuessesSnapshot
   
    updateRoom(room)

    room.interval = setInterval(() => {
      room.timer--
      if (room.timer <= 0) {
        clearRoomInterval(room)

        room.correctGuesses = []

        const isLastDrawer = room.currentDrawerIndex === room.players.length - 1

        if (isLastDrawer) {
          const isLastRound = room.curRound === room.maxRounds

          if (isLastRound) {
            showLeaderBoard(room)
          } else {
            startNextRound(room)
          }

        } else {
          room.currentDrawerIndex++
          startSelectingWord(room)
        }
      }
    }, TIMER_UNIT);
  }

  function startNextRound(room: Room) {
    clearRoomInterval(room)

    room.curRound++
    room.phase = 'next-round'
    room.timer = ROUND_CHANGING_TIME
    room.currentDrawerIndex = 0

    newSystemMessage(room, `ROUND > ${room.curRound}`)
    updateRoom(room)

    room.interval = setInterval(() => {
      room.timer--
      if (room.timer <= 0) {
        clearRoomInterval(room)
        startSelectingWord(room)
      }
    }, TIMER_UNIT);

  }

  function showLeaderBoard(room: Room) {
    console.log('reached here in l');

    clearRoomInterval(room)

    room.phase = 'leaderboard'
    room.timer = 0

    // updateRoom(room)
    updateRoom(room)
    // leave this like this onyl

  }

  socket.on(DISCONNECT, () => {

    const roomId = socket.data.roomId
    if (!roomId) return

    const room = rooms[roomId]

    if (!room) return

    room.players = room.players.filter(player => player.id !== socket.id)

    room.turnOrder = room.turnOrder.filter(id => id !== socket.id)

    if (room.players.length === 0) {
      clearRoomInterval(room)
      delete rooms[roomId]
      return
    }

    updateRoom(room)

  });

  function updateRoom(room: Room) {
    io.to(room.id).emit(ROOM_UPDATED, getSafeRoom(room))
  }

  function updateMessages(room: Room) {
    io.to(room.id).emit(MESSAGES_UPDATED, room.messages)
  }

  function clearRoomInterval(room: Room) {
    if (room.interval) {
      clearInterval(room.interval)
      room.interval = undefined
    }
  }

});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});



function getSafeRoom(room: Room): SafeRoom {
  const { interval, ...safeRoom } = room
  return safeRoom
}