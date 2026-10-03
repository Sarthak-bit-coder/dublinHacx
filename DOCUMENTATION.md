# NeedMap (RuralGrid) — Technical Architecture & Hackathon Summary

> **Tagline**: *“Turn community signals into actionable service-access insights.”*

---

## 📌 Executive Summary

NeedMap (RuralGrid) is a privacy-first, ultra-lightweight GIS and civic response application specifically designed for rural communities facing low connectivity, unpaved infrastructure degradation, and emergency access vulnerabilities.

It bridges the gap between rural citizens who need a fast, low-bandwidth way to report critical road washouts or water pump failures and county infrastructure planners who need spatial AI insights to prioritize repairs and position emergency facilities effectively.

---

## 🛠️ Core Capabilities & Features

### 1. 📱 Standalone Ultra-Low-Data Field Reporter ("Lite Mode")
- **Low-Bandwidth Design**: Tailored for 2G/3G edge connections or intermittent cellular signals in remote valley basins.
- **Store-and-Forward Offline Sync**: Reports created without network connectivity are stored locally (`localStorage` + IndexedDB fallback) and queued for automatic batch sync when reconnection is detected.
- **Easy Mode Accessibility**: Audio/voice transcription prompts, large touch targets, simplified 3-step reporting wizard.

### 2. 🗺️ Strategic GIS Interactive Map & Spatial Analysis
- **District Precinct Overlay**: Real-time rendering of Precinct 4 & Precinct 7 rural zones.
- **Interactive Layer Controls**: Toggle between active community issue markers, priority repair queues, strategic placement sites, and AI-predicted hazard clusters.
- **Dynamic Pin Drop**: Citizens and field technicians can drop coordinates directly on the map to log exact washout locations.

### 3. 🤖 AI Pattern Detection & Strategic Siting Engine
- **Powered by Gemini 3.8 Flash**: Analyzes natural language report streams and telemetry to identify systemic failure patterns.
- **Hotspot Clustering**: Groups recurring culvert and bridge failures into severity-ranked clusters with confidence scores and affected household counts.
- **Optimal Siting Recommendation**: Calculates high-impact locations for new Rural Health Clinics and Emergency Technician Depots to cut emergency response times dramatically.

### 4. ⚡ Priority Repair Queue & Degradation Scoring
- **Automated Algorithmic Scoring**: Ranks infrastructure repairs based on degradation level, isolation risk (e.g. school/hospital cutoffs), and urgency scores.
- **Council Action Plan Export**: Generates printable and downloadable executive action plans for county commissioners, budget boards, and public works dispatchers.

### 5. 🌧️ Real-Time Environmental & Hydrological Telemetry
- **Weather Impact Telemetry**: Monitors 24h rainfall totals, soil saturation percentages, and erosion rate multipliers.
- **Sub-Base Failure Threshold Warning**: Displays critical indicators when soil moisture exceeds liquefaction thresholds for unpaved gravel arterials.

---

## 🏗️ Technical Architecture & Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Icons** | Tailwind CSS v4, Lucide React Icons |
| **Backend API Server** | Express, Node.js (ESM), `tsx` runtime |
| **AI Synthesis** | Google Gemini 3.8 Flash API (`@google/genai`) |
| **Data Persistence** | In-memory REST API (`server.ts`) + Browser Local Storage Sync |
| **Mapping Engine** | Custom Interactive SVG & Canvas GIS Renderer |

---

## 📁 Project Structure

```
Dublin_Hacx/
├── server.ts                       # Express backend server with Gemini AI & sync APIs
├── package.json                    # Project metadata & npm dependencies
├── vite.config.ts                  # Vite build configuration
├── index.html                      # HTML entry point
├── src/
│   ├── App.tsx                     # Main application state & tab orchestration
│   ├── main.tsx                    # React DOM root entry
│   ├── types.ts                    # TypeScript interfaces for reports, repairs, & clusters
│   ├── components/
│   │   ├── ControlPanelDashboard.tsx # Combined executive dashboard view
│   │   ├── InteractiveMap.tsx        # GIS interactive mapping canvas
│   │   ├── LiteReportApp.tsx         # Mobile low-data field reporting app
│   │   ├── OfflineSyncIndicator.tsx  # Real-time online/offline sync status badge
│   │   ├── PatternInsightsPanel.tsx  # AI pattern cluster analysis & gemini synthesis
│   │   ├── PriorityRepairQueue.tsx   # Algorithmic repair queue management
│   │   ├── StrategicPlacementPanel.tsx# Facility siting recommendations
│   │   ├── IssueReportsList.tsx      # Comprehensive report catalog
│   │   ├── ReportModal.tsx           # Modal for creating detailed reports
│   │   ├── CouncilActionPlanModal.tsx# Exportable council briefing modal
│   │   └── Header.tsx                # Universal navigation & mode toggles
│   ├── services/
│   │   ├── geminiService.ts          # Client-side AI service call wrappers
│   │   ├── syncService.ts            # Store-and-forward offline synchronization logic
│   │   └── weatherService.ts         # Weather impact telemetry service
│   └── data/
│       └── mockData.ts               # Seed data for districts, reports, and sites
└── public/                         # Static assets & demonstration images
```

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   # Server runs at http://localhost:3000
   ```
3. **Configure Gemini API (Optional)**:
   Add your key to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is provided, the application gracefully defaults to a built-in heuristic AI response engine.*

---

## 📜 Summary of Development History & Commits

- **`f23a1c6`**: Initial core setup of NeedMap app with spatial grid, priority scoring, analytics, and resident reporting.
- **`a6ae5f2`**: Added ultra-low-data offline mode & store-and-forward resident reporting engine.
- **`081c4a9`**: Integrated store-and-forward AI map promotion engine for low-data rural reports.
- **`51e3b16`**: Full architecture refactor into rural-first design with AI pattern detection, offline sync indicator, and unified control panel dashboard.
- **`9027877`**: Included data upload modal and final component integrations.
- **`DOCUMENTATION.md`**: Added complete technical documentation file to codebase repository.
