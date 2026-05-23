import { Socket, Server } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { updateRoom, updateMessages } from "../../rooms/roomUtils";
import { generateBrainrotName } from "../../lib/text/all-texts";
import { Player } from "../../shared/player";
import { JOIN_ROOM } from "../../shared/socket-names";
import { LanguageType } from "../../shared/language";

export function registerJoinRoom(socket: Socket, io: Server): void {
  socket.on(JOIN_ROOM, (roomId: string, selectedLanguage: string, player: Player) => {
    const room = rooms[roomId];
    if (!room) return;

    socket.join(roomId);
    socket.data.roomId = roomId;

    if (!room.players) room.players = [];
    if (room.players.length === room.setting?.maxPlayers) return;

    const alreadyInRoom = room.players.some((p) => p.id === socket.id);
    if (alreadyInRoom) return;

    const newPlayer: Player = {
      id: socket.id,
      name: player.name ? player.name : generateBrainrotName(),
      avatarColor: player.avatarColor,
      isHost: room.players.length === 0,
      score: 0,
    };

    if (newPlayer.isHost && room.setting) {
      room.setting.language = selectedLanguage as LanguageType;
    }

    room.players.push(newPlayer);
    room.messages?.push({
      playerId: socket.id,
      text: newPlayer.isHost
        ? `${newPlayer.name} CREATED THE ROOM`
        : `${newPlayer.name} JOINED`,
      type: "system",
    });

    room.phase = "waiting";
    if (!room.turnOrder) room.turnOrder = [];
    room.turnOrder.push(newPlayer.id);

    updateRoom(io, room);
    updateMessages(io, room);
  });
}