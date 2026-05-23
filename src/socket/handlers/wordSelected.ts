import { Socket, Server } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { clearRoomInterval } from "../../rooms/roomUtils";
import { startDrawing } from "../../game/gamePhases";
import { WORD_SELECTED } from "../../shared/socket-names";

export function registerWordSelected(socket: Socket, io: Server): void {
  socket.on(WORD_SELECTED, ({ word, roomId }: { word: string; roomId: string }) => {
    const room = rooms[roomId];
    if (!room) return;

    clearRoomInterval(room);
    room.currentWord = word ?? room.wordOptions[Math.floor(Math.random() * 3)];
    startDrawing(io, room);
  });
}