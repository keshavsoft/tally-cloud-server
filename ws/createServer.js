import { WebSocketServer } from "ws";
import { handleConnection } from "./handleConnection.js";

export const createWebSocketServer = () => {

    const wss = new WebSocketServer({
        port: 8080
    });

    console.log("WebSocket server running on ws://localhost:8080");

    wss.on("connection", handleConnection);

    return wss;
};