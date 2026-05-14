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
  }

  res.json({ roomId });
});

io.on(CONNECTION, (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on(JOIN_ROOM, (roomId: string, player: Player) => {
    console.log('reached join JOIN_ROOM');

    if (!rooms[roomId]) return

    socket.join(roomId)

    const room: Room = rooms[roomId]

    if (!room) return

    if (!room.players) {
      room.players = []
    }

    const alreadyInRoom = room.players.some(p => p.id === socket.id)
    if (alreadyInRoom) return

    const newPlayer: Player = {
      id: socket.id,
      name: player.name ?? generateBrainrotName(),
      avatarColor: player.avatarColor,
      isHost: room.players.length === 0 ? true : false,
      score: 0
    }

    room.players.push(newPlayer)

    room.phase = "waiting"

    console.log('emitted rooom updated');

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
      if (room.timer !== undefined) {
        room.timer--
        io.to(room.id).emit(TIMER_TICK, room.timer)

        if (room.timer <= 0) {
          clearInterval(room.interval)
          room.currentWord = (room.wordOptions ?? [])[0]
          // start drawing function
        }
      }
    }, TIMER_UNIT);

  }

  socket.on(DISCONNECT, () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});