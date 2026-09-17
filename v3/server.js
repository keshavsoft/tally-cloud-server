import express from "express";

const app = express();

app.use(express.json());

const requests = new Map();

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Server is running"
    });

});

app.get("/last", (req, res) => {

    const requestId = crypto.randomUUID();

    requests.set(requestId, {
        endpoint: "last",
        createdAt: new Date()
    });

    console.log("Request added:", requestId);

    res.json({
        success: true,
        requestId
    });

});

app.get("/requests", (req, res) => {

    res.json({
        success: true,
        requests: [...requests.entries()]
    });

});

app.listen(3000, () => {

    console.log(
        "HTTP server running on http://localhost:3000"
    );

});