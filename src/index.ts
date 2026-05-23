import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerHandlers } from "./socket/registerHandlers";
import { createRoom } from "./rooms/roomStore";
import { CONNECTION } from "./shared/socket-names";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.post("/create-room", async (_req, res) => {
  const roomId = `room_${Date.now()}`;
  createRoom(roomId);
  res.json({ roomId });
});

io.on(CONNECTION, (socket) => {
  registerHandlers(socket, io);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});