
import { Message } from "./messages";
import { Phase } from "./phase";
import { Player } from "./player";
import { Stroke } from "./stroke";

export type Room = {
  id: string

  players: Player[]

  phase: Phase

  turnOrder: string[]

  // set these on start game
  curRound: number

  maxRounds: number

  currentDrawerIndex: number

  timer: number

  currentWord: string

  wordOptions: string[]


  interval?: NodeJS.Timeout

  messages?: Message[]

  drawingData?: Stroke[]

  correctGuesses?: string[]
}