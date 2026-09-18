import express from "express";
import { router as wsRouter } from "./ws.js";

const router = express.Router();

router.use("/", wsRouter);

export { router };