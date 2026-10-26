import express from "express";
import { router as routerFromV1 } from "./v1/routes.js";
import { router as routerFromV2 } from "./v2/routes.js";

const router = express.Router();

router.use("/v1", routerFromV1);
router.use("/v2", routerFromV2);

export { router };
export default router;