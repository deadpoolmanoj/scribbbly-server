import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Room } from "./shared/room";
import { Player } from "./shared/player";
import { EventEmitterAsyncResource } from "events";
import { generateBrainrotName } from "./lib/text/all-texts";
import { CONNECTION, DISCONNECT, JOIN_ROOM, ROOM_UPDATED, START_GAME, TIMER_TICK } from "./shared/socket-names";
import { TIMER_UNIT } from "./lib/constants/all-conts";
import { REPL_MODE_SLOPPY } from "repl";

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
    wordOptions: []
  }

  res.json({ roomId });
});

io.on(CONNECTION, (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on(JOIN_ROOM, (roomId: string, player: Player) => {

    if (!rooms[roomId]) return

    socket.join(roomId)

    socket.data.roomId = roomId

    const room: Room = rooms[roomId]

    if (!room) return

    if (!room.players) {
      room.players = []
    }

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

    room.phase = "waiting"

    if (!room.turnOrder) {
      room.turnOrder = []
    }

    room.turnOrder?.push(newPlayer.id)

    io.to(roomId).emit(ROOM_UPDATED, room)
  })

  socket.on(START_GAME, ({ roomId }) => {
    const room = rooms[roomId]

    room.curRound = 0

    room.maxRounds = 3

    room.currentDrawerIndex = 0 // set this later imp 

    room.messages = []

    startSelectingWord(room)

  })

  function startSelectingWord(room: Room) {
    room.phase = 'selecting-word'
    room.timer = 10
    room.wordOptions = ['cat', 'pig', 'watch']
    room.currentWord = ''

    io.to(room.id).emit(ROOM_UPDATED, room)

    room.interval = setInterval(() => {

      room.timer--
      io.to(room.id).emit(TIMER_TICK, room.timer)

      if (room.timer <= 0) {
        clearInterval(room.interval)
        room.currentWord = (room.wordOptions ?? [])[0]
        startDrawing(room)
      }

    }, TIMER_UNIT);

  }

  function startDrawing(room: Room) {
    room.phase = 'drawing'
    room.timer = 20

    io.to(room.id).emit(ROOM_UPDATED, room)

    if (room.interval) {
      clearInterval(room.interval)
    }

    room.interval = setInterval(() => {

      room.timer--
      io.to(room.id).emit(TIMER_TICK, room.timer)

      if (room.timer <= 0) {
        clearInterval(room.interval)
        showTurnPoints(room)
      }

    }, TIMER_UNIT);
  }

  function showTurnPoints(room: Room) {
    room.phase = 'turn-result'
    room.timer = 5
    io.to(room.id).emit(ROOM_UPDATED, room)

    if (room.interval) {
      clearInterval(room.interval)
    }

    room.interval = setInterval(() => {

      room.timer--
      io.to(room.id).emit(TIMER_TICK, room.timer)

      if (room.timer <= 0) {
        // change turn 
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

        clearInterval(room.interval)
      }

    }, TIMER_UNIT);

  }

  function startNextRound(room: Room) {
    if (room.interval) clearInterval(room.interval)

    room.curRound++
    room.phase = 'next-round'
    room.timer = 3
    room.currentDrawerIndex = 0

    io.to(room.id).emit(ROOM_UPDATED, room)

    room.interval = setInterval(() => {
      room.timer--
      // io.to(room.id).emit(TIMER_TICK, room.ticker)
      if (room.timer <= 0) {
        clearInterval(room.interval)
        startSelectingWord(room)
      }
    }, TIMER_UNIT);

  }

  function showLeaderBoard(room: Room) {
    if(room.interval) clearInterval(room.interval)

    room.phase = 'leaderboard'
    room.timer = 0

    
  }

  socket.on(DISCONNECT, () => {

    const roomId = socket.data.roomId
    if (!roomId) return

    const room = rooms[roomId]

    if (!room) return

    room.players.filter(player => player.id !== socket.id)

    room.turnOrder.filter(id => id !== socket.id)

    io.to(roomId).emit(ROOM_UPDATED, room)

    //  / still lot to do here assigning new host and 

  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

function getSafeRoom(room: Room) {
  return {
    id: room.id,
    curRound: room.curRound,
    maxRounds: room.maxRounds,
    phase: room.phase,
    players: room.players,
    turnOrder: room.turnOrder,
    currentDrawerIndex: room.currentDrawerIndex,
    currentWord: room.currentWord,
    wordOptions: room.wordOptions,
    timer: room.timer,
    messages: room.messages
  }
}