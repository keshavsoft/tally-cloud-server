import express from "express";
import { router as routerFromCreate } from "./create/end-points.js";
import { router as routerFromDelete } from "./delete/end-points.js";

const router = express.Router();

router.use("/create", routerFromCreate);
router.use("/delete", routerFromDelete);

export { router };
export default router;