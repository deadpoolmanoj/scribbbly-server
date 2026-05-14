import { NamedTupleMember } from "typescript";

export type Player = {
    id:string
    name?:string
    score?: number
    isHost?: boolean
    avatarColor?:  "blue" | "cyan" | "gray" | "green" | "orange" | "pink" | "purple" | "red" | "white" | "yellow"
}