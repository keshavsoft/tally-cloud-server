import express from "express";
import { startWebSocketServer } from "./ws.js";

import { lastRouter } from "./routes/last.js";
import { router as companyRouter } from "./routes/company.js";
import { router as commandRouter } from "./routes/routes.js";

const app = express();

// Serve static files from the 'public' folder
app.use(express.static("public"));

app.use(express.json());

// Canonical routes
app.use("/company", companyRouter);
app.use("/last", lastRouter);
app.use("/v2/ws", commandRouter);
app.use("/api", commandRouter);
app.use("/ws", commandRouter);

startWebSocketServer();

app.listen(9011, () => {
    console.log("HTTP server running on http://localhost:9011");
});