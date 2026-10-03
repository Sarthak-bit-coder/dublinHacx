# NeedMap (RuralGrid) 🗺️⚡
> **Tagline**: *"Turn community signals into actionable service-access insights."*  
> **Repository**: [Dublin_Hacx (GitHub main branch)](https://github.com/Sarthak-bit-coder/Dublin_Hacx)  
> **Local Server URL**: [http://localhost:3000](http://localhost:3000)

---

## 🌟 Executive Overview & Purpose

In rural precincts and underserved communities, infrastructure failures—like culvert washouts, bridge degradation, water pump failures, or clinic access blockages—often become severe emergencies because residents face **low connectivity (2G/3G)**, **sparse data coverage**, and **long emergency response times**.

**NeedMap** is a privacy-focused, lightweight civic response and spatial intelligence application. It enables rural citizens to report hazards even under low-bandwidth connections, queues submissions offline when cellular service drops, and uses an **8-Stage Spatial Data Pipeline** combined with **Google Gemini 3.8 Flash AI** to synthesize pattern clusters, rank repair priorities, and calculate optimal candidate locations for new **Rural Health Outposts** and **Equipment Depots**.

---

## 🛠️ Key Product Capabilities & Modules

### 1. 📱 Ultra-Low-Data Rural Mobile App (`< 50 KB` Requests)
- **Strict < 50 KB Request Cap**: Outgoing JSON requests are validated and guaranteed to remain under 50 KB (typically ~1.2 KB to 2.5 KB).
- **Dedicated Mobile Endpoint (`POST /api/lite-reports`)**: Rejects payloads over 50 KB with a `413 Payload Too Large` safety status.
- **Store-and-Forward Offline Engine**: Queues reports locally (`localStorage`) when cellular towers are out of reach and automatically syncs with the server upon reconnection.
- **Simple 3-Step Wizard**: Designed for high contrast, large touch targets, and low digital literacy.

### 2. 🗺️ Real Satellite GIS Map & 3D Perspective Engine
- **Real Map Tiles**: Powered by Leaflet with **Esri World Imagery Satellite**, **CartoDB Dark Vector**, and **OpenTopoMap** providers.
- **Cool 3D Terrain Perspective Tilt Feature**: Interactive 3D pitch slider (0° to 55° angle) and Z-axis rotation for viewing mountain pass elevations.
- **Floating Glassmorphism Panels**:
  - **Left Panel**: Top Ranked Candidate Sites list (`#1 Pittsburg County`, `#2 Dixie County`, `#3 Pine Crossroads`...).
  - **Right Panel**: Model Weights Sliders (*People helped %*, *Remoteness %*, *Bed shortage %*, *Community need SVI %*) that dynamically update candidate site scores and heatmap circles in real-time.
  - **Bottom Left Panel**: Map symbol legend, score scale ramp, and heat density legend.

### 3. 🧬 MedMap-Adapted 8-Stage Spatial Data Pipeline
1. **Raw Staging**: Ingests CMS Registries, Census ACS 5-Year, CDC PLACES, CDC SVI, USDA RUCA, AHRF County Data, and HRSA HPSA/MUA/P shortage areas.
2. **Normalization**: Standardizes schemas into uniform spatial GeoParquet tables.
3. **Geography & Geocoding**: Geocodes locations via Census Geocoder + OpenStreetMap fallbacks, joining to 2023 Census Tracts (Precincts 4 & 7).
4. **ACS Demographics Enrichment**: Adds population, median income, elderly (>65) ratio, and uninsurance rates.
5. **Screening Features**: Builds multi-factor risk profiles combining SVI vulnerability and emergency road blockages.
6. **Candidate Site Generation**: Shortlists candidate sites, adjusting travel times for rural unpaved gravel vs paved highways.
7. **Multi-Criteria Optimization**: Ranks candidate sites using weighted scores (*Access Improvement*, *Capacity*, *SVI Vulnerability*, *Config Fit*, *Cost Efficiency*).
8. **Final Enrichment & Immutable SHA-256 Snapshots**: Outputs versioned SHA-256 checksummed snapshots (`sha256-v24...`) for 100% reproducible audit trails.

### 4. 🛡️ Cybersecurity, PII Redaction & Privacy Shield
- **PII Auto-Scrubber**: Automatically redacts names, SSNs, phone numbers, emails, and street addresses before storing or submitting data.
- **Differential Privacy GPS Fuzzing**: Applies Laplace noise (~50m jitter) to resident coordinates to prevent targeting individual homes while keeping precinct GIS precision.
- **HTTP Hardening Headers**: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `X-XSS-Protection`.

### 5. 🤖 Gemini 3.8 Flash AI Pattern Synthesis & Council Action Plan
- Synthesizes recurring report clusters into executive hazard warnings.
- Generates downloadable, printable **Council Action Plans** for county board meetings and public works dispatchers.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Map & 3D Canvas** | Leaflet 1.9, Esri World Imagery, CSS 3D Transforms |
| **Styling & Icons** | Tailwind CSS v4, Lucide React Icons |
| **Backend API Server** | Node.js (ESM), Express, `tsx` runtime |
| **AI Pattern Engine** | Google Gemini 3.8 Flash (`@google/genai`) |
| **Spatial Pipeline** | MedMap 8-Stage Python/TS Algorithm with SHA-256 Checksums |

---

## 🚀 Local Setup & Quick Start

1. **Clone & Install Dependencies**:
   ```bash
   cd C:\Users\brijb\Dublin_Hacx
   npm install --legacy-peer-deps
   ```
2. **Environment Configuration (Optional)**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no Gemini API key is provided, NeedMap automatically defaults to its built-in heuristic AI response engine.*

3. **Start Development Server**:
   ```bash
   npx.cmd -y tsx server.ts
   ```
4. **Open Application**:
   Navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🎤 60–90 Second Hackathon Pitch Script

> *"Judges, when severe weather hits rural communities, culverts collapse and unpaved roads turn into mud. For a family in an isolated mountain valley, a washed-out road isn't just an inconvenience—it's a life-threatening barrier that cuts off ambulances, dialysis trips, and school buses.*
>
> *Meet **NeedMap**. NeedMap turns low-bandwidth community signals into actionable service-access insights.*
>
> *First, for residents with weak 2G or 3G cell signals, we built an ultra-lightweight mobile app guaranteed to send requests **under 50 kilobytes**. If there's zero cell service, it saves reports offline locally and syncs automatically when reconnected.*
>
> *Second, for county planners, NeedMap runs an **8-Stage Spatial Data Pipeline** combining Census ACS demographics, CDC Social Vulnerability, and HRSA healthcare shortage areas. It generates a **Real Satellite GIS Map with 3D Perspective Pitch Controls**, allowing planners to tweak live Model Weight Sliders—like remoteness, population helped, and facility shortages—to rank candidate sites in real time.*
>
> *Finally, powered by **Google Gemini 3.8 Flash**, NeedMap groups recurring washouts into pattern clusters, exports formal Council Action Plans, and protects resident privacy with automated PII redaction and differential privacy GPS fuzzing.*
>
> *NeedMap doesn't replace human decision-making—it empowers local leaders to deliver aid where it's needed most, faster than ever before. Thank you!"*

---

## 📊 Data Model Architecture

```
1. reports (Anonymized / Synthetic Community Signals)
   - id, title, description, category, severity, status
   - coordinates: { lat, lng, x, y }
   - districtId, districtName, locationName, dateReported
   - affectedHouseholds, infrastructureType, emergencyAccessBlocked
   - payloadSizeKB (< 50 KB limit)

2. candidateSites / strategicSites
   - siteId, candidateName, censusTractId, districtName
   - coordinates: { lat, lng, x, y }
   - accessImprovementScore, capacityScore, vulnerabilityScore (SVI/HRSA)
   - totalOptimizationScore (0-100), adjustedDriveTimeMin, baselineDriveTimeMin

3. pipelineSnapshots (8-Stage Execution Audit Logs)
   - executionId, pipelineVersion, timestamp
   - stages: Array<StageStatus>
   - snapshotChecksum: sha256-v24...
```

---

## 🛡️ Privacy & Safety Statement

NeedMap uses aggregated, synthetic, and anonymized signals for analytical demonstration purposes. It does not display cleartext personally identifiable information (PII) or pinpoint exact residential addresses. Map outputs represent potential unmet-need signals designed to support human decision-making and should be validated with local community officials and public works departments.
