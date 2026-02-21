# Project Summary: API Engine

The **API Engine** is a modular, high-performance middleware stack designed to act as a configurable API gateway. It allows users to dynamically define routing rules via a web UI without needing to restart the server or modify code.

## 1. Backend Architecture (The Engine)
- **Dynamic Router**: A catch-all Express route (`/src/routes/dynamic.js`) that intercepts incoming traffic. It queries a PostgreSQL database in real-time to find a matching path/method and proxies the request using `http-proxy-middleware`.
- **Persistence Layer**: Built with **Prisma ORM** and **PostgreSQL**.
  - `Endpoint` Model: Stores HTTP method, path, target URL, and rate limiting settings.
  - `Config` Model: A key-value store for global variables and API keys.
- **Configuration API**: Internal REST endpoints (`/api/config/*`) for management by the Web UI.
- **Security**: "Local First" approach; UI authentication is disabled for ease of use in local environments.

## 2. Frontend Architecture (The Dashboard)
- **Stack**: **React** (Vite) + **Tailwind CSS**.
- **UI/UX**: Modern dark-themed dashboard optimized for productivity.
- **Features**:
  - **Endpoint Management**: Full CRUD interface for proxied routes.
  - **Live Feedback**: Visual confirmation of configuration changes.
  - **Registry**: Centralized management for environmental keys and global configuration.

## 3. DevOps & Deployment
- **Containerization**: Backend and UI are fully Dockerized.
- **Orchestration**: `docker-compose.yml` provided for single-command stack launch.
- **Cloud Ready**: Verified for **AWS Free Tier (EC2)** with provided deployment guides and CI/CD pipelines.

## Current Project Status
The system is **fully operational** for local development and ready for production deployment.

### Key Connection Points:
- **Engine Port**: 4000
- **Management UI Port**: 5173
- **Primary Configuration**: Managed via the Web UI or `.env` file.
