import { LanguageType } from "./language";

export type Setting = {
    maxPlayers? : number
    drawTime? : number
    maxRounds?: number
    language? : LanguageType
}