import express from "express";
import { router as routerFromImport } from "./import/end-points.js";

const router = express.Router();

router.use("/import", routerFromImport);

export { router };
export default router;