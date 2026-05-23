import { Server } from "socket.io";
import { Room } from "../shared/room";
import { MESSAGES_UPDATED, ROOM_UPDATED, TIMER_TICK } from "../shared/socket-names";

type SafeRoom = Omit<Room, "interval">;

export function getSafeRoom(room: Room): SafeRoom {
  const { interval, ...safeRoom } = room;
  return safeRoom;
}

export function updateRoom(io: Server, room: Room): void {
  io.to(room.id).emit(ROOM_UPDATED, getSafeRoom(room));
}

export function updateMessages(io: Server, room: Room): void {
  io.to(room.id).emit(MESSAGES_UPDATED, room.messages);
}

export function emitTimerTick(io: Server, room: Room): void {
  io.to(room.id).emit(TIMER_TICK, room.timer);
}

export function clearRoomInterval(room: Room): void {
  if (room.interval) {
    clearInterval(room.interval);
    room.interval = undefined;
  }
}

export function newSystemMessage(io: Server, room: Room, text: string): void {
  room.messages?.push({ type: "system", text });
  updateMessages(io, room);
}