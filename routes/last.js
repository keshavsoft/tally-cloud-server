import { Router } from "express";
import { requests } from "../store/requests.js";
import { sendToClient } from "../ws/sendToClient.js";

export const lastRouter = Router();

lastRouter.get("/", (req, res) => {

    const requestId = crypto.randomUUID();

    const command = {
        requestId,
        action: "LAST"
    };

    requests.set(requestId, {
        endpoint: "last",
        createdAt: new Date()
    });

    console.log("HTTP request:", command);

    try {

        sendToClient(command);

        res.json({
            success: true,
            requestId
        });

    } catch (error) {

        requests.delete(requestId);

        res.status(503).json({
            success: false,
            message: error.message
        });

    }

});