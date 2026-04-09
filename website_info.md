# 🌿 GreenOps — SaveEnergy Platform

## Project Overview

**GreenOps (SaveEnergy)** is a production-grade, cloud-native SaaS platform engineered to monitor AWS infrastructure, optimize operational costs, and measurably reduce carbon emissions. It delivers real-time telemetry dashboards, AI-driven optimization recommendations, and compliance-ready sustainability audit reports — all through a premium, enterprise-quality web interface.

The platform is designed as a full-stack application: a **React (Vite)** single-page application on the frontend communicates with a **FastAPI (Python)** REST + WebSocket backend, persisting data in **PostgreSQL**. Authentication is handled via dual-path support (AWS Cognito + local DB), currently running in open-access mode for rapid demonstration.

---

## Key Features & Functionality

### 1. Eco Dashboard (Home)
- **Real-time metrics**: Live hourly cost, carbon intensity (kg CO₂e), active resources, and idle detections
- **WebSocket telemetry**: Pushes live metric updates every few seconds via `/ws/live`
- **AI Status indicator**: Simulated SageMaker provisioning → optimizing → online lifecycle
- **Multi-service health portfolio**: Cost breakdown per AWS service (EC2, RDS, S3, Lambda)
- **Optimization Center**: Summary of potential monthly savings and CO₂ reduction with CTA to recommendations

### 2. Cloud Inventory (Resources)
- **Full resource table**: Name, type, instance class, region, CPU usage, status, and cost per hour
- **Real-time CPU telemetry**: WebSocket-driven live CPU bars with color-coded thresholds
- **Action controls**: Start/stop resources with confirmation modal; permanent delete with confirmation
- **Search & filter**: Client-side filtering by name, ID, and AWS service type (EC2, RDS, S3, Lambda)
- **Sync trigger**: Manual re-sync of AWS inventory via the `/actions/sync` endpoint

### 3. Carbon Footprint (Environmental Impact)
- **Historical chart**: Time-series area chart of carbon emissions (kg CO₂e) over 24 hours
- **Live emission rate**: Giant metric display showing current hourly CO₂e output
- **Trend indicators**: Percent change for the day

### 4. Cost Management
- **Spend forecast chart**: 30-day cost trend visualization
- **Metric cards**: Hourly cost, forecasted monthly spend, anomaly count
- **Breakdown by service**: Per-service cost distribution (EC2, RDS, etc.)
- **Anomaly detection**: Cost spikes and unusual spend increases, displayed in a dedicated panel
- **CSV export**: Client-side generation of cost report with breakdown and history data

### 5. AI Optimization Center (Recommendations)
- **AI-generated recommendations**: Stop, resize, or optimize idle/underutilized resources
- **Impact metrics**: Per-recommendation cost savings (USD) and CO₂ offset (kg)
- **Execute actions**: One-click apply that stops/resizes resources and removes recommendation
- **Aggregate stats**: Efficiency score, total carbon saved, total potential savings

### 6. Compliance & Analytics (Reports)
- **PDF report generation**: Backend generates sustainability audit PDFs using FPDF
- **Report list**: Historical reports with download links
- **Verified artifacts**: Each report marked as a "Verified Sustainability Artifact"

### 7. Settings
- **AWS Account Manager**: Multi-account IAM integration — add/remove AWS accounts with encrypted credentials
- **Profile, Notifications, Compliance, Billing**: Placeholder modules for future integration
- **Section navigation**: Sidebar-style navigation within settings

---

## Tech Stack

### Frontend
| Layer       | Technology                              |
|-------------|------------------------------------------|
| Framework   | React 18 (JSX) with Vite 6 build tool   |
| Routing     | React Router DOM v6                      |
| Styling     | Tailwind CSS v3.4 with custom `eco-*` palette |
| Animations  | Framer Motion v11                        |
| Charts      | Recharts (AreaChart, ResponsiveContainer) |
| Icons       | Lucide React                             |
| HTTP Client | Axios with interceptors (JWT auto-inject) |
| Real-time   | Native WebSocket API                     |
| Auth SDK    | AWS Amplify v5 (disabled / open-access mode) |
| Font        | Inter (Google Fonts)                     |

### Backend
| Layer       | Technology                              |
|-------------|------------------------------------------|
| Framework   | FastAPI (Python 3.9+)                    |
| ORM         | SQLAlchemy                               |
| Auth        | JWT (python-jose), AWS Cognito (optional) |
| Cloud SDK   | Boto3 (AWS SDK)                          |
| Scheduling  | APScheduler (background metric collection) |
| WebSocket   | FastAPI WebSocket with connection manager |
| Report Gen  | FPDF (PDF generation)                    |
| Security    | AES-256 encryption for stored AWS keys   |

### Infrastructure
| Layer       | Technology                              |
|-------------|------------------------------------------|
| Database    | PostgreSQL (time-series metric storage)  |
| Container   | Docker + Docker Compose (multi-stage)    |
| Hosting     | AWS App Runner (backend), S3/CloudFront (frontend) |
| IaC         | Terraform (aws_migration directory)      |

---

## Design System & UI/UX Vision

### Color Palette
- **Primary Green (eco-*)**: A nature-inspired green palette ranging from `#f0fdf4` (50) to `#052e16` (950) — establishes the sustainability brand identity
- **Neutral Grays**: Slate/gray scale for backgrounds, text, borders
- **Accent Colors**: Amber for warnings/anomalies, blue for informational, red for danger/cost alerts, emerald for positive trends

### Typography
- **Font Family**: Inter (via Google Fonts) — clean, modern, highly legible
- **Scale**: Headlines use `text-3xl`/`text-4xl` with `font-extrabold`/`font-black`; body uses `text-sm`/`text-xs`; micro-labels use `text-[10px]` uppercase tracking-widest

### Component Patterns
- **Glass Cards**: Semi-transparent backgrounds with backdrop-blur (`.glass` utility)
- **Rounded Containers**: Large border-radius (`rounded-3xl`, `rounded-[2.5rem]`) for a soft, premium feel
- **Metric Cards**: Hover-lift animations via Framer Motion `whileHover`
- **Tables**: Clean bordered with hover-row effects, icon badges per service type
- **Modals**: Centered overlay with scale-in animation and backdrop blur

### Animations
- **Page transitions**: `fadeIn` CSS keyframe on route change
- **Card entrance**: Framer Motion `initial/animate` with staggered delays
- **Hover states**: Scale transforms, shadow elevations, color transitions
- **Real-time indicators**: Pulsing dots (`.animate-pulse`), spinning refresh icons
- **Chart animations**: Recharts built-in 800ms area fill animation

### Layout
- **Sidebar**: Fixed 256px (w-64) left sidebar with green gradient, hidden on mobile with overlay
- **Navbar**: Sticky top bar with search, clock, notifications, user profile
- **Content Area**: Offset by sidebar width on desktop (`lg:ml-64`), full-width on mobile
- **Responsive**: Grid layouts adapt between 1-4 columns based on breakpoints

---

## File Structure

```
saveenergy/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Routes (all wrapped in Layout)
│   │   ├── main.jsx                 # Entry point (Amplify disabled)
│   │   ├── index.css                # Tailwind directives, glass utility, animations
│   │   ├── App.css                  # Legacy Vite boilerplate styles
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx       # Sidebar + Navbar wrapper
│   │   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   │   └── Navbar.jsx       # Top bar with search/clock/profile
│   │   │   ├── Dashboard/
│   │   │   │   ├── MetricCard.jsx   # Reusable KPI card
│   │   │   │   └── ConfirmationModal.jsx  # Action confirmation dialog
│   │   │   ├── Charts/
│   │   │   │   └── LiveLineChart.jsx  # Recharts area chart wrapper
│   │   │   └── Settings/
│   │   │       └── AWSAccountManager.jsx  # Multi-account management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main analytics dashboard
│   │   │   ├── Resources.jsx        # Cloud inventory table
│   │   │   ├── Carbon.jsx           # Environmental impact tracking
│   │   │   ├── Cost.jsx             # Cost management & anomalies
│   │   │   ├── Recommendations.jsx  # AI optimization center
│   │   │   ├── Reports.jsx          # Compliance & report generation
│   │   │   ├── Settings.jsx         # Account settings hub
│   │   │   ├── Login.jsx            # Auth bypass (redirects to dashboard)
│   │   │   └── ForgotPassword.jsx   # Password reset flow
│   │   └── services/
│   │       ├── api.js               # Axios instance + service modules
│   │       ├── awsAuthService.js    # AWS Cognito auth helpers
│   │       └── awsEvents.js         # AWS event utilities
│   ├── tailwind.config.js           # Custom eco color palette
│   ├── vite.config.js               # Dev server on port 3000
│   └── package.json                 # Dependencies
├── backend/
│   └── app/
│       ├── main.py                  # FastAPI app + WebSocket + startup
│       ├── api/api.py               # All REST endpoints
│       ├── models/                  # SQLAlchemy models
│       ├── services/                # AWS service integrations
│       ├── workers/                 # APScheduler background jobs
│       ├── websocket/               # WebSocket connection manager
│       └── utils/                   # PDF generation, helpers
├── docker-compose.yml               # Frontend container config
├── deploy.ps1 / turn-on.ps1 / turn-off.ps1  # Deployment scripts
└── README.md                        # Project documentation
```

---

## Important Observations

1. **Open-Access Mode**: Authentication is fully bypassed — all routes redirect to dashboard, backend always returns admin user
2. **Dual Auth Path**: Backend supports both AWS Cognito and local DB authentication, but frontend bypasses both
3. **Multi-Account Architecture**: Users can connect multiple AWS accounts; metrics are scoped per-account
4. **WebSocket Architecture**: Dashboard and Resources page both maintain live WebSocket connections for real-time data
5. **Background Workers**: APScheduler runs continuous inventory syncs and metric collection loops
6. **Encrypted Credentials**: AWS secret keys are AES-256 encrypted before database storage
7. **Report System**: Generates real PDF files on the backend, downloadable through the API

---

© 2026 GreenOps Core Infrastructure — Built for a sustainable future. 🌎
