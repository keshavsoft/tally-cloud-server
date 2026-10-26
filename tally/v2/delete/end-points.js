import { Router } from "express";
import { dispatchCommand } from "../../../routes/dispatchCommand.js";

export const router = Router();

router.get("/", (req, res) => {
    const localQuery = req.query;
    const localName = localQuery?.Name;

    console.log("localQuery : ", localQuery);
    console.log("localName : ", localName);

    dispatchCommand({
        inReq: req,
        inRes: res,
        inAction: `import.masters.delete.${localName}`
    });
});

export default router;