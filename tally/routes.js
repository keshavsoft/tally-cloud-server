import express from "express";
import { router as routerFromV1 } from "./v1/routes.js";

const router = express.Router();

router.use("/v1", routerFromV1);

export { router };
export default router;