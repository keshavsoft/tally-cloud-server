import { WebSocketServer } from "ws";
import { requests } from "./store/requests.js";

let client = null;

export const startWebSocketServer = () => {

    const wss = new WebSocketServer({
        port: 8080
    });

    console.log("WebSocket server running on ws://localhost:8080");

    wss.on("connection", (ws) => {

        console.log("Windows client connected");

        client = ws;

        ws.on("message", (data) => {

            const text = data.toString();

            let message;

            try {
                message = JSON.parse(text);
            } catch {
                message = text;
            }

            console.log("Received from Windows:", message);

            // JSON request
            if (typeof message === "object") {

                const request = requests.get(message.requestId);

                if (!request) {
                    console.log(
                        "Unknown request:",
                        message.requestId
                    );
                    return;
                }

                console.log("Matching request:", request);

                return;
            }

            // String request
            if (typeof message === "string") {

                console.log("Received string:", message);

            }

        });

        ws.on("close", () => {

            console.log("Windows client disconnected");

            if (client === ws) {
                client = null;
            }

        });

    });

};

export const sendToClient = (message) => {

    if (!client) {
        throw new Error("No Windows client connected");
    }

    if (client.readyState !== 1) {
        throw new Error("Windows client is not connected");
    }

    const data =
        typeof message === "string"
            ? message
            : JSON.stringify(message);

    client.send(data);

    console.log("Sent to Windows:", message);
};