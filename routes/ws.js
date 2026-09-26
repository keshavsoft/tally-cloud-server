import { Router } from "express";
import { dispatchCommand } from "./dispatchCommand.js";

export const router = Router();

router.get("/:command", (req, res) => {
    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: req.params.command
    });
});

router.post("/:command", (req, res) => {
    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: req.params.command
    });
});

export default router;