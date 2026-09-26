import crypto from "crypto";
import { requests } from "../store/requests.js";
import { sendToClient } from "../ws/sendToClient.js";

export const dispatchCommand = ({ inReq, inRes, inAction, inTimeoutMs = 30000 }) => {
    const localReq = inReq;
    const localRes = inRes;
    const localAction = inAction;
    const localTimeoutMs = inTimeoutMs;

    const requestId = crypto.randomUUID();

    const context = {
        ...(localReq.query || {}),
        ...(localReq.body || {})
    };

    const command = {
        requestId,
        action: localAction,
        company: context.company || "mani9",
        ...context
    };

    const timeoutId = setTimeout(() => {
        if (requests.has(requestId)) {
            requests.delete(requestId);
            localRes.status(504).json({
                success: false,
                message: `Gateway Timeout: Local Windows server did not respond within ${localTimeoutMs / 1000}s`
            });
        }
    }, localTimeoutMs);

    requests.set(requestId, {
        endpoint: localAction,
        createdAt: new Date(),
        timeoutId,
        res: localRes
    });

    try {
        sendToClient(command);
    } catch (error) {
        clearTimeout(timeoutId);
        requests.delete(requestId);
        localRes.status(503).json({
            success: false,
            message: error.message
        });
    }
};

export default dispatchCommand;
