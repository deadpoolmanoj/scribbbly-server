import { Socket, Server } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { clearRoomInterval, newSystemMessage, updateMessages, updateRoom } from "../../rooms/roomUtils";
import { showTurnPoints } from "../../game/gamePhases";
import { getGuessPoints, DRAWER_POINTS } from "../../game/scoring";
import { GUESS } from "../../shared/socket-names";

export function registerGuess(socket: Socket, io: Server): void {
  socket.on(GUESS, ({ guess, roomId }: { guess: string; roomId: string }) => {
    const room = rooms[roomId];
    if (!room || !guess) return;

    if (!room.messages) room.messages = [];
    if (!room.correctGuesses) room.correctGuesses = [];

    const curPlayer = room.players.find((p) => p.id === socket.id);
    if (!curPlayer) return;

    if (room.correctGuesses.includes(socket.id)) return;

    const drawerId = room.turnOrder[room.currentDrawerIndex];
    if (socket.id === drawerId) return;

    const isCorrectGuess =
      guess.toLowerCase().trim() === room.currentWord.toLowerCase().trim();

    if (isCorrectGuess && room.phase === "drawing") {
      room.correctGuesses.push(socket.id);

      const points = getGuessPoints(room.correctGuesses.length);
      curPlayer.score = (curPlayer.score ?? 0) + points;

      room.messages.push({
        playerId: socket.id,
        type: "correct",
        text: `${curPlayer.name} GUESSED CORRECT +${points}`,
        player: curPlayer.name,
        points: points.toString(),
      });

      const nonDrawers = room.players.filter((p) => p.id !== drawerId);
      const allGuessed = nonDrawers.every((p) =>
        room.correctGuesses!.includes(p.id)
      );

      if (allGuessed) {
        clearRoomInterval(room);
        updateMessages(io, room);
        updateRoom(io, room);
        showTurnPoints(io, room);
        return;
      }

    } else if (room.phase === "drawing") {
      room.messages.push({
        playerId: socket.id,
        type: "",
        text: guess,
        player: curPlayer.name,
      });
    }

    updateMessages(io, room);
    updateRoom(io, room); 
  });
}