import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Room } from "./shared/room";
import { Player } from "./shared/player";
import { EventEmitterAsyncResource } from "events";
import { generateBrainrotName } from "./lib/text/all-texts";
import { CONNECTION, DISCONNECT, JOIN_ROOM, ROOM_UPDATED } from "./shared/socket-names";

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

  socket.on(DISCONNECT, () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});