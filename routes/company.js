import { Router } from "express";
import { dispatchCommand } from "./dispatchCommand.js";

export const router = Router();

router.get("/", (req, res) => {
    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: "company"
    });
});

router.post("/", (req, res) => {
    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: "company"
    });
});

export default router;