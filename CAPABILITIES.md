# API Engine: Capabilities & Features

The **API Engine** is a high-performance, configurable API Gateway and Reverse Proxy designed for local development and production-ready deployments.

## 🚀 Core Engine (Routing)
- **Dynamic Proxying**: Route incoming HTTP traffic (GET, POST, PUT, DELETE, etc.) to any target URL in real-time.
- **Wildcard Path Matching**: Use `*` to match entire sub-path trees (e.g., `/api/*` matches `/api/users`, `/api/orders`, etc.).
- **Smart Priority**: Automatically prioritizes exact path matches over wildcard patterns.
- **Path Resolution**: When using wildcards, sub-paths are correctly propagated to the target service.
- **Performance Caching**: High-speed in-memory resolution using `node-cache`. Repeat requests are handled at $O(1)$ speed without database lookups.
- **Health Checks**: Built-in `/healthz` endpoint for monitoring engine status.

## 🛠️ Management Dashboard (Admin UI)
- **Modern Dark UI**: A professional-grade, React-based dashboard with a Zinc/Slate aesthetic.
- **Real-time Config**: Create, edit, and delete endpoints live. Changes take effect instantly across the engine.
- **React Query State**: Powered by `@tanstack/react-query` for high-performance data management, automatic background syncing, and optimistic updates.
- **Global Registry**: Manage shared system variables and API keys from a central interface.
- **Clean Error Feedback**: Visual loading states and clear error reporting for failed configurations.

## 🛡️ Stability & Reliability
- **Structured Error Handling**: Returns clean `502 Bad Gateway` JSON when target services are unreachable, preventing engine hangs.
- **Cache Auto-Invalidation**: The engine automatically flushes relevant cache entries when routing rules are modified via the UI.
- **Persistence**: All configurations are durably stored in a PostgreSQL database using Prisma ORM.

## 📦 Deployment & DevOps
- **Docker Ready**: Fully containerized backend and UI with `docker-compose` support for "one-click" local setup.
- **Cloud Infrastructure**: Optimized for AWS Free Tier (EC2) with provided guides for security group and network configuration.
- **CI/CD Integrated**: Pre-configured GitHub Actions workflows for automated building and quality checks.

---

### Connectivity Summary
| Component | Default Port | Primary Function |
| :--- | :--- | :--- |
| **Engine** | `4000` | Traffic Ingress & Proxying |
| **Management UI** | `5173` | UI for controlling the engine |
| **Admin API** | `4000/api/config` | Internal REST API for configuration |
