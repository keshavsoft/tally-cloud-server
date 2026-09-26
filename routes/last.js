import { Router } from "express";
import { dispatchCommand } from "./dispatchCommand.js";

export const lastRouter = Router();

lastRouter.get("/", (req, res) => {
    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: "LAST"
    });
});

export default lastRouter;