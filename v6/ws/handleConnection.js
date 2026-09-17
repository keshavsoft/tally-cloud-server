import { handleMessage } from "./handleMessage.js";
import { setClient } from "./sendToClient.js";

export const handleConnection = (ws) => {

    console.log("Windows client connected");

    setClient(ws);

    ws.on("message", handleMessage);

    ws.on("close", () => {
        console.log("Windows client disconnected");
    });
};