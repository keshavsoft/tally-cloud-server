import { Router } from "express";
import crypto from "crypto";

import { requests } from "../store/requests.js";
import { sendToClient } from "../ws/sendToClient.js";

export const router = Router();

router.get("/", (req, res) => {
    const commandToSend = "company";

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