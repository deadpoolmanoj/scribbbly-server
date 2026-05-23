import { Socket, Server } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { clearRoomInterval, newSystemMessage, updateRoom } from "../../rooms/roomUtils";
import { startSelectingWord } from "../../game/gamePhases";
import { ROUND_CHANGING_TIME, TIMER_UNIT } from "../../lib/constants/all-conts";
import { START_GAME } from "../../shared/socket-names";

export function registerStartGame(socket: Socket, io: Server): void {
  socket.on(START_GAME, ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.players.length <= 1) {
      newSystemMessage(io, room, "ATLEAST 2 PLAYERS REQUIRED");
      return;
    }

    room.curRound = 1;
    room.currentDrawerIndex = 0;
    room.phase = "next-round";
    room.timer = ROUND_CHANGING_TIME;

    newSystemMessage(io, room, "GAME STARTED!");
    updateRoom(io, room);
    clearRoomInterval(room);

    room.interval = setInterval(() => {
      room.timer--;
      if (room.timer <= 0) {
        clearRoomInterval(room);
        startSelectingWord(io, room);
      }
    }, TIMER_UNIT);
  });
}