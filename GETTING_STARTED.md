# Getting Started: API Engine

This guide will help you get the system up and running quickly.

## 1. Initial Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended for Database)

### Step-by-Step Launch
1. **Start the Database**:
   From the project root, run:
   ```bash
   docker-compose up -d postgres
   ```
2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run dev
   ```
3. **Setup UI**:
   In a new terminal:
   ```bash
   cd ui
   npm install
   npm run dev
   ```

---

## 2. Using the Web UI

Access the dashboard at: **http://localhost:5173**

### Dashboard Breakdown
1. **Endpoints Tab**: This is your main control panel.
   - **New Endpoint**: Click the white button at the top right.
   - **Method**: Choose the HTTP method (GET, POST, etc.).
   - **Path**: Set the local path (e.g., `/my-api`).
   - **Target URL**: Where the request should be sent (e.g., `https://api.external.com`).
2. **Registry & Keys Tab**: Manage global settings and API keys used by the engine.

### How it Works
Once you save an endpoint (e.g., `GET /test`), you can call it via the main engine port (default **4000**):
`http://localhost:4000/test` -> forwarded to your **Target URL**.

---

## 3. Connecting Features
- **No Login Required**: The UI is currently configured for local use with no authentication.
- **Port 4000**: The port where the "Engine" lives.
- **Port 5173**: The port where the "Management UI" lives.
