let client = null;

export const setClient = (ws) => {
    client = ws;
};

export const sendToClient = (message) => {

    if (!client) {
        throw new Error("No Windows client connected");
    }

    const data =
        typeof message === "string"
            ? message
            : JSON.stringify(message);

    client.send(data);

    console.log("Sent to Windows:", message);
};