import express from "express";
import { router as routerFromTally } from "../tally/routes.js";

const router = express.Router();

router.use("/tally", routerFromTally);

export { router };
export default router;