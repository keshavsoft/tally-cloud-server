# tally-cloud-server

Cloud relay server connecting HTTP REST endpoints to WebSocket clients for Tally integration.

## Features

- **Express HTTP Server** on port `3000`
- **WebSocket Server** on port `8080` for bidirectional communication with client nodes
- In-memory request tracking store

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
node server.js
```

## Project Structure

- `server.js` - Main Express server entry point
- `ws.js` & `ws/` - WebSocket server configuration and connection handlers
- `routes/` - Express route handlers (`/last`, etc.)
- `store/` - In-memory data store for tracking active requests
