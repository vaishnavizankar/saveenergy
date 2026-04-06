# 🌿 GreenOps: Sustainable Cloud Excellence

GreenOps is a production-grade SaaS platform designed to monitor cloud infrastructure, optimize costs, and drastically reduce carbon emissions. Built with a high-performance **FastAPI** backend and a premium **React (Vite)** frontend, it provides real-time visibility into infrastructure health, environmental impact, and actionable AI optimizations.

## 🚀 Key Features

*   **Live Monitoring**: Real-time CPU and cost tracking via WebSockets and CloudWatch telemetry.
*   **Carbon Footprint Tracking**: Automatic CO2 calculations based on regional grid intensity and instance power usage.
*   **Idle Resource Detection**: Intelligent triggers for identifying waste in EC2 and RDS assets.
*   **AI Optimizations**: Proactive recommendations for stopping resources or rightsizing instances.
*   **Sustainability Audits**: Professional PDF reports for compliance and environmental disclosure.
*   **Actionable Control**: Secure starting/stopping of resources with multi-stage confirmation.
*   **Time-Aware Architecture**: Full UTC-based processing with local timezone conversion for end-users.

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide.
*   **Backend**: FastAPI (Python 3.9+), Boto3, APScheduler, SQLAlchemy, Jose (JWT).
*   **Data Tier**: PostgreSQL (Time-series metrics storage).
*   **DevOps**: Docker, Docker Compose, Multi-stage builds.

## ⚙️ Quick Start (Docker)

Ensure you have **Docker** and **Docker Compose** installed.

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd saveenergy
    ```

2.  **Environment Setup**:
    Configure your `.env` files if using real AWS keys:
    *   `backend/.env`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (Leave empty for Mock Mode).

3.  **Launch the Platform**:
    ```bash
    docker-compose up --build
    ```

4.  **Access the Dashboard**:
    *   Frontend: `http://localhost:3000`
    *   API Docs: `http://localhost:8000/docs`
    *   **Login**: `admin@greenops.com` / `admin123`

## 🧠 Data Architecture

GreenOps scales for production using:
- **WebSockets** for pushing live metrics directly from the background workers to dashboards.
- **APScheduler** for running continuous monitoring loops without blocking API performance.
- **Time-Aware Schema**: Every metric and action stores high-precision UTC timestamps.

---

Built for a sustainable future. 🌎
© 2026 GreenOps Core Infrastructure.
