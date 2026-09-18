import express from "express";
import { lastRouter } from "./routes/last.js";
import { startWebSocketServer } from "./ws.js";

const app = express();

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.use(express.json());

app.use("/last", lastRouter);

startWebSocketServer();

app.listen(9011, () => {
    console.log("HTTP server running on http://localhost:9011");
});