# NeedMap (RuralGrid) — Hackathon Executive Summary & Project Guide

> **Tagline**: *"Turn community signals into actionable service-access insights."*  
> **Repository**: [Dublin_Hacx (main branch)](https://github.com/Sarthak-bit-coder/Dublin_Hacx)  
> **Local Host URL**: [http://localhost:3000](http://localhost:3000)

---

## 🌟 Vision & Impact Statement

In rural precincts, infrastructure failures—like culvert washouts, bridge abutment degradation, or well pump electrical faults—often turn into severe emergencies because residents face **low connectivity**, **sparse data coverage**, and **long emergency response times**. 

**NeedMap (RuralGrid)** is a privacy-focused, light-weight civic response and spatial intelligence application. It enables rural residents to easily log infrastructure damage even on 2G/3G networks, automatically syncs queued reports when connection improves, and uses **AI pattern synthesis (Google Gemini)** to help local councils prioritize repairs and strategically position emergency services.

---

## ⚡ Key Highlights & Core Features

```
               ┌───────────────────────────────────────────────┐
               │         NeedMap Civic Data Ecosystem          │
               └───────────────────────┬───────────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
┌───────────┐                  ┌───────────────┐                ┌──────────────┐
│ Lite App  │                  │  Control Panel│                │  AI Engine   │
│ Field Mode│ ──(Offline Sync)─►  GIS Dashboard │ ──(Gemini 3.8)─► Pattern     │
│ (2G/3G)   │                  │ & Map Layers  │                │ Synthesis    │
└───────────┘                  └───────────────┘                └──────────────┘
```

### 1. 📱 Ultra-Low-Data "Lite" Field Reporter App
- **Optimized for Edge Networks**: Stripped down to essential text & compressed image reporting to preserve cellular data.
- **Store-and-Forward Offline Engine**: Built-in queue stores reports locally when offline (`localStorage`) and automatically syncs with the server when reconnected.
- **Accessibility Modes**: Large touch targets, voice-assisted input options, and simplified 3-step reporting.

### 2. 🗺️ Interactive GIS Control Panel & Map
- **Precinct Boundary Visualizations**: Precise mapping for rural districts (Precincts 4 & 7).
- **Interactive Layer Toggles**: Filter between active citizen reports, high-priority repair crews, AI-predicted hazard hotspots, and candidate clinic/depot sites.
- **Dynamic Pin-Dropping**: Tap any spot on the map to pinpoint damaged culverts or flooded access roads.

### 3. 🤖 AI Pattern Detection & Strategic Siting (Google Gemini)
- **Hotspot Detection**: Analyzes individual civic reports to identify larger systemic threats (e.g., dual road washouts isolating a mountain valley).
- **Strategic Health & Depot Placement**: Computes optimal geographic coordinates for new **Rural Health Outposts** and **Technician Emergency Depots** to minimize travel times.
- **Heuristic Fallback**: Includes a built-in offline heuristic engine to deliver AI insights even without a Gemini API key.

### 4. 🛠️ Algorithmic Priority Repair Queue
- **Multi-Factor Priority Scoring**: Scores assets based on degradation level, isolation risk (e.g., cutting off schools or ambulances), and population affected.
- **Council Briefing Exporter**: Generates instant, downloadable executive briefings for public works dispatchers and county commissioners.

### 5. 🌧️ Real-Time Hydrological Weather Telemetry
- Monitors 24-hour rainfall, soil saturation levels, and erosion multipliers to predict sub-base liquefaction before road washouts occur.

---

## 🏗️ Architecture & Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Modern, ultra-fast client interface |
| **Styling & Icons** | Tailwind CSS v4, Lucide React | Clean, high-contrast responsive UI |
| **Backend Server** | Node.js, Express, `tsx` | REST API, static asset server, & offline sync bridge |
| **AI Integration** | Google Gemini 3.8 Flash (`@google/genai`) | Pattern recognition & spatial facility siting |
| **Data Sync** | LocalStorage + Custom REST Sync API | Reliable store-and-forward offline telemetry |

---

## 📂 Project Navigation Directory

```
Dublin_Hacx/
├── server.ts                       # Express backend server with Gemini AI & sync APIs
├── package.json                    # Project dependencies & scripts
├── DOCUMENTATION.md                # Comprehensive technical documentation
├── SUMMARY.md                      # Executive hackathon overview (this file)
└── src/
    ├── App.tsx                     # Main app state & mode orchestrator
    ├── types.ts                    # Core TypeScript data definitions
    ├── components/
    │   ├── ControlPanelDashboard.tsx # Unified executive dashboard
    │   ├── InteractiveMap.tsx        # GIS mapping interface
    │   ├── LiteReportApp.tsx         # Mobile low-data field app
    │   ├── PatternInsightsPanel.tsx  # Gemini AI pattern & siting panel
    │   ├── PriorityRepairQueue.tsx   # Algorithmic repair queue
    │   ├── StrategicPlacementPanel.tsx# Facility placement recommendation view
    │   ├── IssueReportsList.tsx      # Comprehensive issue list
    │   ├── ReportModal.tsx           # New report creation modal
    │   ├── CouncilActionPlanModal.tsx# Briefing export modal
    │   ├── OfflineSyncIndicator.tsx  # Offline sync status badge
    │   └── Header.tsx                # Universal app header
    ├── services/
    │   ├── geminiService.ts          # AI service calls
    │   ├── syncService.ts            # Offline sync logic
    │   └── weatherService.ts         # Environmental telemetry
    └── data/
        └── mockData.ts               # Seed data for districts, reports, and sites
```

---

## 🚀 How to Run the App

1. **Install Dependencies**:
   ```powershell
   npm.cmd install --legacy-peer-deps
   ```
2. **Launch Dev Server**:
   ```powershell
   npx.cmd -y tsx server.ts
   ```
3. **Open in Browser**:
   Navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 📝 Recent Repository Commits

- **`9dc3f86`**: `docs: add comprehensive DOCUMENTATION.md detailing architecture, features, and technical stack`
- **`9027877`**: `feat: add UploadModal component for data file ingestion`
- **`51e3b16`**: `feat: refactor into lightweight rural-first architecture with AI pattern detection, offline sync, and control panel dashboard`
- **`081c4a9`**: `feat: implement store-and-forward AI map promotion engine for low-data rural reports`
- **`a6ae5f2`**: `feat: add ultra-low-data offline mode and rural resident reporting engine`
