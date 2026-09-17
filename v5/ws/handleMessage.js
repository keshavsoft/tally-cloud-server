import { requests } from "../store/requests.js";

export const handleMessage = (data) => {

    const text = data.toString();

    let message;

    try {
        message = JSON.parse(text);
    } catch {
        message = text;
    }

    console.log("Received from Windows:", message);

    if (typeof message !== "object") {
        return;
    }

    const request = requests.get(message.requestId);

    if (!request) {
        console.log("Unknown request:", message.requestId);
        return;
    }

    console.log("Matching request:", request);
};