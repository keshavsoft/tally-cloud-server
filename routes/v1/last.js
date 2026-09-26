import { Router } from "express";
import crypto from "crypto";

import { requests } from "../../store/requests.js";
import { sendToClient } from "../../ws/sendToClient.js";

export const lastRouter = Router();

lastRouter.get("/", (req, res) => {

    const requestId = crypto.randomUUID();

    const command = {
        requestId,
        action: "LAST"
    };

    requests.set(requestId, {
        endpoint: "last",
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