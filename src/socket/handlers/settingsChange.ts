import { Socket, Server } from "socket.io";
import { rooms } from "../../rooms/roomStore";
import { updateRoom } from "../../rooms/roomUtils";
import { Setting } from "../../shared/setting";
import { SETTINGS_CHANGE } from "../../shared/socket-names";

export function registerSettingsChange(socket: Socket, io: Server): void {
  socket.on(SETTINGS_CHANGE, (roomId: string, roomProp: keyof Setting, value: string) => {
    const room = rooms[roomId];
    if (!room) return;

    if (!room.setting) room.setting = {};
    (room.setting as any)[roomProp] = roomProp === "language" ? value : Number(value);

    updateRoom(io, room);
  });
}