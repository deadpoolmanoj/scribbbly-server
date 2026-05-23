import { Socket } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { DRAW_LINE, DRAWING_UPDATED } from "../../shared/socket-names";

export function registerDrawLine(socket: Socket): void {
  socket.on(DRAW_LINE, (data) => {
    const room = rooms[data.roomId];
    if (!room) return;

    if (!room.drawingData) room.drawingData = [];

    const line = {
      x1: data.x1, y1: data.y1,
      x2: data.x2, y2: data.y2,
      color: data.color,
      size: data.size,
    };

    room.drawingData.push(line);
    socket.broadcast.to(room.id).emit(DRAWING_UPDATED, line);
  });
}