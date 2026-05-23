import { Room } from "../shared/room";
import { DRAWING_TIME, MAX_PLAYERS, ROUNDS } from "../lib/constants/all-conts";

export const rooms: Record<string, Room> = {};

export function createRoom(roomId: string): Room {
  const room: Room = {
    id: roomId,
    curRound: 0,
    maxRounds: 3,
    phase: "waiting",
    players: [],
    turnOrder: [],
    currentDrawerIndex: 0,
    timer: 0,
    currentWord: "",
    wordOptions: [],
    messages: [],
    drawingData: [],
    correctGuesses: [],
    setting: {
      drawTime: DRAWING_TIME,
      language: "ENGLISH",
      maxPlayers: MAX_PLAYERS,
      maxRounds: ROUNDS,
    },
  };
  rooms[roomId] = room;
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms[roomId];
}

export function deleteRoom(roomId: string): void {
  delete rooms[roomId];
}