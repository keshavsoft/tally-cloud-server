import express from "express";
import { startWebSocketServer } from "./ws.js";

// v1 routes (legacy untouched)
import { lastRouter as lastRouterV1 } from "./routes/v1/last.js";
import { router as companyRouterV1 } from "./routes/v1/company.js";
import { router as wsRouterV1 } from "./routes/v1/routes.js";

// v2 routes (Guideline B context forwarding + Guideline C timeout safety)
import { lastRouter as lastRouterV2 } from "./routes/v2/last.js";
import { router as companyRouterV2 } from "./routes/v2/company.js";
import { router as wsRouterV2 } from "./routes/v2/routes.js";

const app = express();

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.use(express.json());

// Versioned routes
app.use("/v1/last", lastRouterV1);
app.use("/v1/company", companyRouterV1);
app.use("/v1/ws", wsRouterV1);

app.use("/v2/last", lastRouterV2);
app.use("/v2/company", companyRouterV2);
app.use("/v2/ws", wsRouterV2);

// Default active routes (v2)
app.use("/last", lastRouterV2);
app.use("/company", companyRouterV2);
app.use("/ws", wsRouterV2);

startWebSocketServer();

app.listen(9011, () => {
    console.log("HTTP server running on http://localhost:9011");
});