# RuralGrid 🗺️⚡

> **Tagline**: “Civic Infrastructure & Spatial Resource Allocator for Rural Communities.”

RuralGrid empowers rural residents, field technicians, emergency responders, and county officials to report infrastructure degradation, detect AI pattern clusters, monitor real-time weather soil saturation, and prioritize engineering repairs—even under low-bandwidth 2G/3G cell coverage.

---

## 🌟 Core Application Modules

### 1. 📱 Standalone Lite Field Reporter App (`LiteReportApp.tsx`)
- Ultra-lightweight mobile reporter optimized for low-data rural connectivity (< 10 KB payload).
- 1-tap resident issue reporting for roads, bridges, water pumps, power lines, healthcare, and telecommunications.
- Automatic offline queueing in `localStorage` when out of cell range, with automatic background server sync upon reconnection.

### 2. 🗺️ Interactive Strategic GIS Canvas Map (`InteractiveMap.tsx`)
- High-performance vector canvas map showing verified issue pins, active repair queues, and recommended strategic sites.
- Interactive pin dropping, upvoting, and category filters.

### 3. 🤖 AI Pattern Insights & Cluster Synthesis (`PatternInsightsPanel.tsx`)
- Automatic spatial pattern recognition grouping related report clusters (e.g. coordinated culvert washouts or road isolation risks).
- Powered by Gemini AI synthesis for automated mitigation guidance.

### 4. 🛠️ Priority Repair Queue (`PriorityRepairQueue.tsx`)
- Ranks asset degradation scores (0–100) and isolation risk metrics.
- Calculates required crew days, machinery needs (graders, excavators, service trucks), and estimated repair costs.

### 5. 🏥 Strategic Facility Siting (`StrategicPlacementPanel.tsx`)
- AI-assisted placement recommendations for emergency clinics, mobile medical posts, water purification hubs, and technician depots to maximize golden-hour emergency coverage.

### 6. 🌧️ Real-Time Weather Degradation Telemetry (`weatherService.ts`)
- Tracks precipitation, soil saturation percentage (sub-base liquefaction threshold), and erosion velocity multipliers (e.g. 2.4x erosion rate).

### 7. 📄 Municipal Council Action Plan Generator (`CouncilActionPlanModal.tsx`)
- Exportable formal executive brief for county board meetings and infrastructure grant proposals.

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Navigate to project directory
cd C:\Users\brijb\Dublin_Hacx

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- To access the **Standalone Lite Mobile Reporter**, click **"Open Lite Field Reporter"** in the top header or footer (or add `?mode=lite` to the URL).

---

## 📁 Cleaned & Streamlined File Structure

```
src/
├── components/
│   ├── ControlPanelDashboard.tsx     # Unified Overview Dashboard
│   ├── CouncilActionPlanModal.tsx    # Municipal Export Brief Modal
│   ├── Header.tsx                    # Header with Mode Toggles
│   ├── InteractiveMap.tsx            # Strategic GIS Canvas Map
│   ├── IssueReportsList.tsx          # Filterable Issue Feed
│   ├── LiteReportApp.tsx             # Standalone Low-Data Reporter App
│   ├── OfflineSyncIndicator.tsx      # Real-Time Sync Indicator
│   ├── PatternInsightsPanel.tsx      # AI Pattern Cluster Panel
│   ├── PriorityRepairQueue.tsx       # Equipment & Repair Dispatch Queue
│   ├── ReportModal.tsx               # Citizen Issue Report Form
│   └── StrategicPlacementPanel.tsx   # AI Facility Placement Siting
├── data/
│   └── mockData.ts                   # Precinct profiles & synthetic datasets
├── services/
│   ├── geminiService.ts              # Gemini AI synthesis integration
│   ├── syncService.ts                # Offline report sync service
│   └── weatherService.ts             # Environmental telemetry service
├── App.tsx                           # Main application controller
├── main.tsx
├── index.css
└── types.ts                          # TypeScript definitions
```
