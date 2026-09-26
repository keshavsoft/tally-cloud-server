import { requests } from "../store/requests.js";

export const handleMessage = (data) => {
    const message = JSON.parse(data.toString());

    console.log("Received from Windows:", message);

    const request = requests.get(message.requestId);

    if (!request) {
        console.log("Unknown request:", message.requestId);
        return;
    }

    request.res.json({
        success: message.success,
        data: message.data
    });

    requests.delete(message.requestId);
};