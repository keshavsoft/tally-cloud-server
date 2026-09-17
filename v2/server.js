import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 8080
});

let client = null;

console.log("WebSocket server running on ws://localhost:8080");

wss.on("connection", (ws) => {

    console.log("Windows client connected");

    client = ws;

    ws.on("message", (data) => {

        const message = JSON.parse(data.toString());

        console.log("Response from Windows client:", message);

    });

    ws.on("close", () => {

        console.log("Windows client disconnected");

        if (client === ws) {
            client = null;
        }

    });
});

export const sendToClient = (message) => {

    if (!client) {
        throw new Error("Windows client is not connected");
    }

    client.send(JSON.stringify(message));
};