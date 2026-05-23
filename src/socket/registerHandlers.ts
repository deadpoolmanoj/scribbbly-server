import { Socket, Server } from "socket.io";
import { registerJoinRoom } from "./handlers/joinRoom";
import { registerStartGame } from "./handlers/startGame";
import { registerWordSelected } from "./handlers/wordSelected";
import { registerGuess } from "./handlers/guess";
import { registerDrawLine } from "./handlers/drawLine";
import { registerSettingsChange } from "./handlers/settingsChange";
import { registerDisconnect } from "./handlers/disconnect";

export function registerHandlers(socket: Socket, io: Server): void {
  registerJoinRoom(socket, io);
  registerStartGame(socket, io);
  registerWordSelected(socket, io);
  registerGuess(socket, io);
  registerDrawLine(socket);
  registerSettingsChange(socket, io);
  registerDisconnect(socket, io);
}