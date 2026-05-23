import { Server } from "socket.io";
import { Room } from "../shared/room";
import { getRandomWords } from "../lib/text/all-texts";
import {
  DRAWING_TIME,
  ROUND_CHANGING_TIME,
  SELECTING_WORD_TIME,
  TIMER_UNIT,
  TURN_RESULT_TIME,
} from "../lib/constants/all-conts";
import {
  clearRoomInterval,
  emitTimerTick,
  newSystemMessage,
  updateRoom,
} from "../rooms/roomUtils";
import { DRAWER_POINTS } from "./scoring";

export function startSelectingWord(io: Server, room: Room): void {
  clearRoomInterval(room);
  room.phase = "selecting-word";
  room.timer = SELECTING_WORD_TIME;
  room.wordOptions = getRandomWords(room.setting?.language ?? "ENGLISH");
  room.currentWord = "";
  room.correctGuesses = [];

  updateRoom(io, room);

  room.interval = setInterval(() => {
    room.timer--;
    emitTimerTick(io, room);

    if (room.timer <= 0) {
      clearRoomInterval(room);
      room.currentWord = room.wordOptions[Math.floor(Math.random() * 3)];
      startDrawing(io, room);
    }
  }, TIMER_UNIT);
}

export function startDrawing(io: Server, room: Room): void {
  clearRoomInterval(room);
  room.phase = "drawing";
  room.timer = room.setting?.drawTime ?? DRAWING_TIME;

  updateRoom(io, room);

  room.interval = setInterval(() => {
    room.timer--;
    emitTimerTick(io, room);

    if (room.timer <= 0) {
      clearRoomInterval(room);
      showTurnPoints(io, room);
    }
  }, TIMER_UNIT);
}

export function showTurnPoints(io: Server, room: Room): void {
  clearRoomInterval(room);

  const correctGuessesSnapshot = [...(room.correctGuesses ?? [])];

  if ((room.correctGuesses?.length ?? 0) > 0) {
    const drawerId = room.turnOrder[room.currentDrawerIndex];
    const drawer = room.players.find((p) => p.id === drawerId);
    if (drawer) {
      drawer.score = (drawer.score ?? 0) + DRAWER_POINTS;
      newSystemMessage(io, room, `${drawer.name} GOT +${DRAWER_POINTS} FOR DRAWING`);
    }
  }

  room.phase = "turn-result";
  room.timer = TURN_RESULT_TIME;
  room.drawingData = [];
  room.correctGuesses = correctGuessesSnapshot;

  updateRoom(io, room);

  room.interval = setInterval(() => {
    room.timer--;

    if (room.timer <= 0) {
      clearRoomInterval(room);
      room.correctGuesses = [];

      const isLastDrawer =
        room.currentDrawerIndex === room.players.length - 1;

      if (isLastDrawer) {
        const isLastRound = room.curRound === room.setting?.maxRounds;
        if (isLastRound) {
          showLeaderBoard(io, room);
        } else {
          startNextRound(io, room);
        }
      } else {
        room.currentDrawerIndex++;
        startSelectingWord(io, room);
      }
    }
  }, TIMER_UNIT);
}

export function startNextRound(io: Server, room: Room): void {
  clearRoomInterval(room);

  room.curRound++;
  room.phase = "next-round";
  room.timer = ROUND_CHANGING_TIME;
  room.currentDrawerIndex = 0;

  newSystemMessage(io, room, `ROUND > ${room.curRound}`);
  updateRoom(io, room);

  room.interval = setInterval(() => {
    room.timer--;
    if (room.timer <= 0) {
      clearRoomInterval(room);
      startSelectingWord(io, room);
    }
  }, TIMER_UNIT);
}

export function showLeaderBoard(io: Server, room: Room): void {
  clearRoomInterval(room);
  room.phase = "leaderboard";
  room.timer = 0;
  updateRoom(io, room);
}