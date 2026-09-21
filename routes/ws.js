import { Router } from "express";
import crypto from "crypto";

import { requests } from "../store/requests.js";
import { sendToClient } from "../ws/sendToClient.js";

export const router = Router();

router.get("/:command", (req, res) => {
    console.log("aaaaaa : ", req.params.command);

    const commandToSend = req.params.command;

    const requestId = crypto.randomUUID();

    const command = {
        requestId,
        action: commandToSend
    };

    requests.set(requestId, {
        endpoint: commandToSend,
        createdAt: new Date(),
        res
    });

    try {

        sendToClient(command);

    } catch (error) {

        requests.delete(requestId);

        res.status(503).json({
            success: false,
            message: error.message
        });

    }

});