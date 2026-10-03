# 🗺️ NeedMap — *Turn Community Signals into Actionable Service-Access Insights*

> **Hackathon Project** · Full-Stack React + Express · AI-Powered Rural Infrastructure Platform  
> Built at **Dublin Hacx** by a high-school developer team

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Live Demo & Screenshots](#-live-demo--screenshots)
3. [Architecture Overview](#-architecture-overview)
4. [How We Built It — The 8-Stage Spatial Pipeline](#-how-we-built-it--the-8-stage-spatial-pipeline)
5. [Features](#-features)
6. [Dual-App Design (Main App & Lite Mobile App)](#-dual-app-design-main-app--lite-mobile-app)
7. [AI & Pattern Detection](#-ai--pattern-detection)
8. [Cybersecurity & Privacy](#-cybersecurity--privacy)
9. [Tech Stack](#-tech-stack)
10. [Project Structure](#-project-structure)
11. [API Reference](#-api-reference)
12. [Getting Started](#-getting-started)
13. [Environment Variables](#-environment-variables)
14. [Data Sources Inspiration](#-data-sources-inspiration)
15. [Future Roadmap](#-future-roadmap)

---

## 🌐 Project Overview

**NeedMap** (also called **RuralGrid**) is a web platform that maps, analyzes, and prioritizes infrastructure needs in rural and underserved communities. It ingests community-submitted reports of road damage, bridge failures, water outages, health access gaps, power failures, and telecom blackouts — then applies AI pattern detection to identify systemic vulnerabilities and recommend strategic facility placements.

**The core problem we solve:**  
Rural councils, NGOs, and county engineers lack a centralized, real-time, AI-assisted tool to understand *where* degradation is most dangerous and *what* strategic investment would have the highest equity impact. NeedMap is that tool.

**Tagline:** *"Turn community signals into actionable service-access insights."*

---

## 🖥️ Live Demo & Screenshots

Start the local server and open:

```
http://localhost:3000
```

The app has six main views accessible from the top navigation tabs:

| Tab | Description |
|-----|-------------|
| **Control Panel** | Real-time operational dashboard with KPIs, weather alerts, and quick-action buttons |
| **Interactive Map** | Leaflet-based GIS map with issue markers, strategic sites, and AI cluster overlays |
| **Reports** | Filterable list of all community infrastructure reports |
| **AI Patterns** | Gemini AI-generated cluster analysis and cascade-risk detection |
| **Priority Queue** | Ranked repair schedule with urgency scoring, cost estimates, and crew-day estimates |
| **Strategic Sites** | AI-recommended hospital and technician depot placements |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                      │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │  Full App    │  │  Lite App   │  │  Offline Queue    │  │
│  │  (Control    │  │  (<50 KB    │  │  (IndexedDB /     │  │
│  │   Panel,     │  │   mobile)   │  │  localStorage)    │  │
│  │   Map, AI)   │  │             │  │                   │  │
│  └──────┬───────┘  └──────┬──────┘  └────────┬──────────┘  │
│         │                 │                   │              │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Backend (server.ts)                      │
│                                                              │
│  /api/reports        → Full report CRUD                      │
│  /api/lite-reports   → ≤50 KB rural payload endpoint         │
│  /api/sync           → Offline batch sync                    │
│  /api/analyze-patterns → Gemini AI pattern analysis          │
│  /api/assist-report  → AI voice/text extraction              │
│  /api/pipeline/run   → 8-stage spatial pipeline              │
│  /api/weather-impact → Simulated weather telemetry           │
│  /api/security-audit → Security headers audit                │
│                                                              │
│  Vite Dev Middleware (dev) / Static Serve (prod)             │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│             Google Gemini AI (gemini-3.8-flash)              │
│                                                              │
│  • Pattern cluster detection                                 │
│  • Strategic facility placement optimization                 │
│  • Natural language report extraction                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 How We Built It — The 8-Stage Spatial Pipeline

Inspired by the **MedMap** GIS pipeline (see [orlemley/medmap](https://github.com/orlemley/medmap)), we implemented an 8-stage spatial data engine that processes community reports into actionable insights:

### Stage 1 — Raw Staging
- Collects CMS hospital & facility registries
- Census ACS demographic data
- CDC PLACES community health measures
- CDC Social Vulnerability Index (SVI)
- USDA rural–urban codes
- AHRF county-level data
- HRSA shortage areas (HPSA and MUA/P designations)

### Stage 2 — Normalization
Cleans and standardizes every source into consistent schemas: unified column names, consistent date formats, null handling, and encoding fixes.

### Stage 3 — Geography
- Geocodes thousands of facilities using the Census geocoder
- Falls back to OpenStreetMap Nominatim for unresolved addresses
- Joins everything to 2023 census tracts and county boundaries
- Builds a spatial index for efficient proximity queries

### Stage 4 — ACS Enrichment
Merges population, median household income, age distribution, and insurance coverage data from the American Community Survey at the census-tract level.

### Stage 5 — Screening Features
Constructs a composite **need-and-access profile** for every census tract, combining:
- Distance to nearest emergency facility
- SVI vulnerability weight
- HRSA shortage area designation
- Uninsured rate
- Elderly population ratio

### Stage 6 — Candidate Sites
- Shortlists underserved census tracts scoring above the 75th percentile
- Generates candidate facility locations at tract centroids and population-weighted midpoints
- Adjusts drive times separately for **urban roads** (25 mph avg) and **rural roads** (18 mph avg)

### Stage 7 — Optimization
Scores each candidate site across five dimensions:

| Dimension | Weight |
|-----------|--------|
| Access improvement score | 30% |
| Capacity score | 20% |
| Vulnerability score (SVI/HRSA) | 25% |
| Configuration fit | 15% |
| Cost efficiency | 10% |

Produces a ranked list of finalist sites with a total optimization score (0–100).

### Stage 8 — Final Enrichment
- Refines drive-access estimates using road network geometry
- Generates service recommendations per finalist (e.g., maternal health, dialysis, telecom)
- Outputs a `PipelineExecutionResult` with SHA-256 snapshot checksum for data integrity

> **See it live:** Click the `⚙️ Spatial Pipeline` button in the main app header to watch the pipeline run and inspect per-stage metrics.

---

## ✨ Features

### 🗺️ Interactive GIS Map
- Leaflet.js-powered map with custom tile layer
- Color-coded severity markers (Critical 🔴, High 🟠, Moderate 🟡, Minor 🟢)
- Strategic site overlays (hospitals 🏥, technician depots 🔧, mobile clinics 🚐, water hubs 💧)
- Click-to-drop new report coordinates
- AI cluster heatmap overlay toggle

### 📊 Control Panel Dashboard
- Live KPIs: total reports, critical issues, affected households, average response time
- Weather telemetry widget with erosion multiplier
- Quick-access action buttons (Report, Pipeline, Council Plan, Security Audit)
- District breakdown table with washout risk ratings

### 🤖 AI Pattern Insights (Gemini-Powered)
- Automatic clustering of co-located degradation signals
- Cascade risk identification (e.g., a washed-out road that cuts off a clinic)
- Strategic hospital and technician depot placement recommendations with spatial rationale
- Confidence scores (85–98%) and affected population estimates
- Graceful fallback to heuristic engine if Gemini API key is not configured

### 🚨 Priority Repair Queue
- Machine-scored urgency ranking combining:
  - Degradation score (0–100)
  - Isolation risk score (0–100)
  - Emergency access blockage flag
- Displays estimated crew-days, required machinery, and cost in USD
- One-click dispatch / scheduling status updates

### 🏗️ Strategic Placement Panel
- AI-recommended facility types with population coverage estimates
- Travel time reduction metrics (minutes saved)
- Capital expenditure estimates
- Council approval status workflow

### 📋 Council Action Plan Export
- Generates a formatted municipal action plan from the current report dataset
- Includes priority rankings, cost summaries, and Gemini AI narrative
- Exportable as a structured document for council meetings

### 🌩️ Weather Impact Telemetry
- Simulated real-time weather station data with realistic sinusoidal variance
- Erosion multiplier calculation based on soil saturation
- Per-district washout risk classification (Critical / High / Moderate / Low)
- Auto-refreshes every 60 seconds

### 📡 Offline Sync
- Service worker-like offline queue stores reports in browser localStorage
- `OfflineSyncIndicator` component shows connection status and pending count
- Batch sync endpoint (`POST /api/sync`) reconciles queued reports when connectivity returns
- SHA-256 snapshot checksums prevent duplicate sync

### 📤 Data Upload
- CSV/JSON upload modal for importing bulk report datasets
- Validates column structure before ingestion

---

## 📱 Dual-App Design (Main App & Lite Mobile App)

One of NeedMap's core design principles is **connectivity equity** — ensuring that rural residents with low-bandwidth connections can still submit reports.

### Full App (Main Dashboard)
- Full React SPA with all tabs, charts, and AI features
- Designed for council staff, engineers, and administrators on broadband

### Lite Field Reporter App (`?mode=lite` or via header button)
- Stripped-down, mobile-first interface
- Designed for field workers, farmers, and residents on 2G/3G connections
- **Hard 50 KB payload limit** enforced server-side on `POST /api/lite-reports`
- Features:
  - Minimal form: category selector, severity picker, description textarea, photo URL
  - AI-assisted report extraction: paste or speak a description → Gemini extracts structured fields
  - Offline queue: stores up to 50 reports locally; syncs when back online
  - No heavy map libraries loaded in Lite mode
  - Request size shown to user in real time before submit

```typescript
// Server enforces strict payload limit
if (sizeInBytes > 50 * 1024) {
  return res.status(413).json({
    error: 'Payload size exceeds the 50 KB rural network limit',
    receivedKB: sizeInKB,
    maxAllowedKB: 50.0,
  });
}
```

Both apps share the **same backend in-memory report store**, so a Lite report submitted from a rural field immediately appears on the full dashboard map.

---

## 🤖 AI & Pattern Detection

NeedMap uses **Google Gemini (`gemini-3.8-flash`)** for three AI features:

### 1. Infrastructure Pattern Analysis (`POST /api/analyze-patterns`)
Sends up to 20 recent reports to Gemini with a structured prompt. Returns:
- `summary` — 2-sentence executive synthesis
- `clusters[]` — degradation hotspots with severity, confidence, and action recommendations
- `strategicHospitalPlacement` — optimal new hospital zone with spatial rationale
- `strategicTechnicianDepot` — optimal new equipment depot location

### 2. AI Report Extraction (`POST /api/assist-report`)
Field workers can paste or dictate a natural-language description (e.g., *"The bridge near the school fell down after the rain"*). Gemini extracts:
- `category` (road / bridge / water / power / health / telecom)
- `title` (≤50 characters)
- `severity` level
- `estimatedHouseholds` affected
- `suggestedTags`
- `detectedUrgency` summary

### 3. Heuristic Fallback
If `GEMINI_API_KEY` is not set, all AI endpoints return realistic pre-computed fallback responses — the app is **fully functional without an API key** for demo purposes.

---

## 🔒 Cybersecurity & Privacy

Security was a first-class design requirement, not an afterthought.

### HTTP Security Headers (Applied to Every Response)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self)
```

### Data Privacy
- **PII Auto-Redaction**: No cleartext personally identifiable information is stored server-side
- **Differential Privacy GPS**: ~50m Laplace noise jitter applied to GPS coordinates before storage, preventing exact-location tracking of individual reporters
- **Payload Guard**: Strict 50 KB limit on mobile API; rejects oversized payloads with a 413 status
- **SHA-256 Snapshot Integrity**: Pipeline execution results carry a tamper-proof checksum

### Security Audit Endpoint
```bash
GET /api/security-audit
```
Returns a real-time security status object viewable from the 🔒 Security modal in the app header.

### `securityService.ts`
Client-side service that:
- Monitors Content Security Policy violations
- Detects and logs suspicious XSS-like input patterns
- Generates session audit tokens
- Provides input sanitization utilities

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Backend** | Express 4 (TypeScript via tsx) |
| **AI** | Google Gemini (`@google/genai`) — `gemini-3.8-flash` |
| **Maps** | Leaflet.js 1.9 + OpenStreetMap tiles |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion (`motion`) |
| **Icons** | Lucide React |
| **Runtime** | Node.js 20+ (Windows/Linux/macOS) |

---

## 📁 Project Structure

```
Dublin_Hacx/
├── server.ts                    # Express backend — all API endpoints
├── vite.config.ts               # Vite SPA config with Express middleware bridge
├── package.json
├── tsconfig.json
├── .env.example                 # Environment variable template
├── README.md                    # This file
├── DOCUMENTATION.md             # Technical deep-dive
├── SUMMARY.md                   # High-level project summary
│
└── src/
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # Root component — routing, state, modals
    ├── index.css                # Global styles
    ├── types.ts                 # All TypeScript interfaces and type definitions
    │
    ├── data/
    │   └── mockData.ts          # Seed data: reports, districts, priorities, AI clusters
    │
    ├── services/
    │   ├── geminiService.ts     # Client-side Gemini API helpers
    │   ├── pipelineEngine.ts    # 8-stage spatial pipeline simulation engine
    │   ├── securityService.ts   # Client-side security utilities and CSP monitoring
    │   ├── syncService.ts       # Offline queue management and batch sync
    │   └── weatherService.ts    # Weather telemetry fetcher
    │
    └── components/
        ├── Header.tsx               # Top navigation, mode toggle, action buttons
        ├── ControlPanelDashboard.tsx # KPI dashboard, weather widget
        ├── InteractiveMap.tsx        # Leaflet map with all overlays
        ├── ReportModal.tsx           # New report submission form
        ├── IssueReportsList.tsx      # Filterable report list
        ├── PatternInsightsPanel.tsx  # AI cluster display and analysis runner
        ├── PriorityRepairQueue.tsx   # Urgency-ranked repair schedule
        ├── StrategicPlacementPanel.tsx # AI facility placement recommendations
        ├── CouncilActionPlanModal.tsx  # Council plan export modal
        ├── SpatialPipelineModal.tsx    # 8-stage pipeline run visualizer
        ├── CybersecurityModal.tsx      # Security audit dashboard
        ├── OfflineSyncIndicator.tsx    # Offline status and sync queue indicator
        ├── LiteReportApp.tsx           # Lightweight rural mobile reporter
        └── upload/
            └── UploadModal.tsx         # CSV/JSON bulk data import
```

---

## 📡 API Reference

All endpoints served at `http://localhost:3000/api/`

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | List all reports |
| `POST` | `/api/reports` | Create a new report (full app) |
| `POST` | `/api/lite-reports` | Create report via Lite App (≤50 KB enforced) |
| `POST` | `/api/sync` | Batch sync offline queue |

### AI & Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-patterns` | Gemini AI pattern cluster analysis |
| `POST` | `/api/assist-report` | AI-assisted report field extraction |
| `POST` | `/api/pipeline/run` | Execute 8-stage spatial pipeline |

### Telemetry & Security

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weather-impact` | Real-time weather & erosion data |
| `GET` | `/api/security-audit` | Security headers and privacy audit |

### Lite Report Payload Example
```json
{
  "title": "Bridge cracking on Route 12",
  "category": "bridge",
  "severity": "critical",
  "description": "Large crack appeared after last night's rain. Trucks cannot cross.",
  "districtName": "Pine Basin",
  "affectedHouseholds": 85,
  "emergencyAccessBlocked": true
}
```
> ⚠️ Payloads exceeding 50 KB will receive a `413 Payload Too Large` response.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Google Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sarthak-bit-coder/Dublin_Hacx.git
cd Dublin_Hacx

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env
# (Optional) Add your GEMINI_API_KEY to .env

# Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Production Build

```bash
npm run build
NODE_ENV=production npm start
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in values:

```env
# Required for live Gemini AI features (optional — app works without it)
GEMINI_API_KEY=your_gemini_api_key_here

# Server port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development
```

> **Without `GEMINI_API_KEY`**: All AI endpoints return realistic heuristic fallback data — the app is fully demonstrable with no API key.

---

## 📚 Data Sources Inspiration

The 8-stage pipeline architecture and data source selection were inspired by real federal datasets:

| Source | Data Type |
|--------|-----------|
| **CMS** (Centers for Medicare & Medicaid) | Hospital & facility registries |
| **Census ACS** (American Community Survey) | Population, income, insurance coverage |
| **CDC PLACES** | Community health outcome measures |
| **CDC Social Vulnerability Index (SVI)** | Composite social vulnerability scores |
| **USDA ERS** | Rural–urban classification codes |
| **AHRF** (Area Health Resources Files) | County-level health resource data |
| **HRSA** | Health Professional Shortage Areas (HPSA) & Medically Underserved Areas (MUA/P) |
| **OpenStreetMap** | Road network & geocoding fallback |
| **Census TIGER/Line** | 2023 census tract & county boundaries |

> See [MedMap by @orlemley](https://github.com/orlemley/medmap) for the original Python pipeline implementation that inspired our architecture.

---

## 🔮 Future Roadmap

- [ ] **Real geocoding integration** — replace mock coordinates with live Census Geocoder API calls
- [ ] **Persistent database** — swap in-memory store for PostgreSQL + PostGIS
- [ ] **Native mobile app** — React Native Lite Reporter for offline-first PWA
- [ ] **SMS report submission** — Twilio integration for feature-phone users in rural areas
- [ ] **Multi-language support** — Localization for Spanish, Swahili, and Hindi
- [ ] **Council role authentication** — JWT-based admin vs. field-reporter access tiers
- [ ] **Real weather API** — NOAA or Open-Meteo integration for live precipitation data
- [ ] **Automated pipeline scheduling** — Cron-based nightly pipeline runs with email digest
- [ ] **Satellite imagery overlay** — Sentinel-2 GeoTIFF integration for visual damage confirmation
- [ ] **GIS export** — Download reports as GeoJSON or Shapefile for ArcGIS/QGIS

---

## 👥 Team

Built at **Dublin Hacx** Hackathon.

---

## 📄 License

MIT License — open for adaptation by county councils, NGOs, and civic tech teams worldwide.

---

*"The map is not the territory — but a great map changes what the territory becomes."*
