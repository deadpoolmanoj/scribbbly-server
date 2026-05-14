
import { Message } from "./messages";
import { Phase } from "./phase";
import { Player } from "./player";

export type Room = {
  id: string

  players: Player[]

  phase: Phase
  

  // set these on start game
  curRound: number

  maxRounds: number

  currentDrawerIndex?: number

  currentWord?: string
  
  wordOptions?: string[]

  timer?: number

  interval?: NodeJS.Timeout

  messages? : Message[]
}