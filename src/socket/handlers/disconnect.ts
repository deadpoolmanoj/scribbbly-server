import { Socket, Server } from "socket.io";
import { rooms, deleteRoom } from "../../rooms/roomStore";
import { clearRoomInterval, updateRoom } from "../../rooms/roomUtils";
import { DISCONNECT } from "../../shared/socket-names";

export function registerDisconnect(socket: Socket, io: Server): void {
  socket.on(DISCONNECT, () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== socket.id);
    room.turnOrder = room.turnOrder.filter((id) => id !== socket.id);

    if (room.players.length === 0) {
      clearRoomInterval(room);
      deleteRoom(roomId);
      return;
    }

    updateRoom(io, room);
  });
}