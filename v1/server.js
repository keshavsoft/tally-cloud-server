import { WebSocketServer } from "ws";

const PORT = 8080;

const wss = new WebSocketServer({
    port: PORT
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send(JSON.stringify({
        type: "CONNECTED",
        message: "Hello from server"
    }));

    ws.on("message", (data) => {
        const text = data.toString();

        let message;

        try {
            message = JSON.parse(text);
        } catch {
            message = text;
        };

        if (message === "last") {
            console.log("Last request from client");
        } else {

            console.log("Received from client:", message);

            ws.send(JSON.stringify({
                type: "RESPONSE",
                message: "Server received your message",
                received: message
            }));

        };
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});