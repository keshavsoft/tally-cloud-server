import express from "express";
import { sendToClient } from "./server.js";

const app = express();

app.use(express.json());

const sendCommand = (command, res) => {
    try {
        sendToClient(command);

        res.json({
            success: true,
            message: "Command sent to Windows client",
            command
        });

    } catch (error) {

        res.status(503).json({
            success: false,
            message: error.message
        });
    }
};

app.get("/ledger-names", (req, res) => {
    sendCommand({
        action: "GET_LEDGER_NAMES"
    }, res);
});

app.get("/last", (req, res) => {
    sendCommand("last", res);
});

app.listen(3000, () => {
    console.log("HTTP server running on http://localhost:3000");
});