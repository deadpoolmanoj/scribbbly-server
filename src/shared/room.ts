
import { Phase } from "./phase";
import { Player } from "./player";

export type Room = {
  id: string

  players: Player[]

  phase: Phase

  curRound: number

  maxRounds: number

  currentDrawerIndex?: number

  currentWord?: string
  
  wordOptions?: string[]

  timer?: number

  interval?: NodeJS.Timeout
}