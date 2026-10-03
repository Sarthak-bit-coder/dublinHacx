# NeedMap 🗺️

> **Tagline**: “Turn community signals into actionable service-access insights.”

NeedMap helps local planners, nonprofits, emergency management teams, and community advocates identify potential unmet essential-service needs (healthcare, safe water, public transit, emergency access) in rural or underserved areas.

---

## 🌟 Key Features

1. **Privacy-Preserving Hexagonal Grid (H3)**
   - Aggregates community signals into Uber H3 resolution 7 cells (~5 km²).
   - Never maps exact home addresses or individual complainant pinpoints.

2. **Transparent Priority Scoring (0–100)**
   - Formula: $0.35 \times \text{Volume} + 0.25 \times \text{Severity} + 0.20 \times \text{Growth} + 0.20 \times \text{Distance}$
   - Categorized into clear labels: **Monitor (0–34)**, **Review (35–64)**, **High-priority review (65–100)**.

3. **Interactive Leaflet Map Dashboard**
   - Color-coded H3 polygons overlaying OpenStreetMap.
   - Service facility markers with custom icons (clinics, pharmacies, water stations, transit stops).
   - Real-time filter panel (by category, severity, date range, minimum signal threshold, layer toggles).

4. **Deep Zone Detail & Recommended Actions**
   - Click any zone to view signal breakdown, 30-day growth trend, nearest facility distance, "Why this was flagged" explanation, recommended next steps, and limitation disclaimers.

5. **Live Analytics & Narrative Intelligence**
   - KPI summary cards, Recharts category breakdown, time-series area charts, priority list.
   - Automated plain-English summary generator.

6. **Client-Side CSV Upload & PII Safety Engine**
   - Drag-and-drop CSV importer with client-side header PII scanner (`email`, `phone`, `ssn`, `address`).
   - Zero cloud database required — 100% in-browser processing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Mapping**: Leaflet + OpenStreetMap + `react-leaflet` + Uber `h3-js`
- **Charts**: Recharts
- **CSV Parsing**: PapaParse

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Navigate to project directory
cd C:\Users\brijb\Dublin_Hacx

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 How to Load Demo Data & Scenarios

Use the **Demo Scenario Switcher** bar at the top of the dashboard:
- 🔵 **Healthcare Gap**: Highlights healthcare/pharmacy access gaps in North Redwood & East Bend.
- 🟢 **Water & Sanitation**: Highlights water quality and well outage signals in Pine Ridge.
- 🟠 **Transit & Emergency**: Highlights rural transit delays and EMS access wait times in South Valley.
- 🔄 **Reset Scenario**: Restores default synthetic dataset.

---

## 📁 CSV Upload Format

Upload your own custom anonymous signal dataset using the **Upload CSV** button:

```csv
category,severity,summary,approximate_latitude,approximate_longitude,date
healthcare,high,"Pharmacy distance issue in north region",39.2200,-123.2500,2026-09-15
water_sanitation,medium,"Water pressure drop reported",39.1800,-123.1200,2026-09-20
transportation_emergency,high,"Missed rural transit connection",39.0500,-123.1800,2026-09-22
```

---

## 🎤 60–90 Second Hackathon Pitch Script

> *"Hi everyone, I'm presenting **NeedMap**.*
>
> *In many rural and underserved communities, residents face invisible service gaps — driving 45 minutes for evening pharmacy access, dealing with unannounced water outages, or waiting extended periods for emergency transit.*
>
> *Public complaint data exists, but raw complaints are chaotic and privacy-sensitive. NeedMap solves this by turning anonymized community signals into **H3 hexagonal need zones**.*
>
> *Instead of mapping individual home addresses, NeedMap aggregates signals into 5 km² hex cells, calculates a transparent 0-to-100 Priority Score based on volume, urgency, growth trend, and facility distance, and highlights where review is needed most.*
>
> *Planners can filter by category, toggle facility locations, click any zone to read recommended outreach steps, or upload custom survey CSVs with automatic client-side PII scanning.*
>
> *NeedMap doesn't make unassailable automated decisions — it provides transparent, privacy-safe signals so local human leaders can deploy mobile clinics and community surveys where they're needed most. Thank you!"*

---

## 📌 Built vs. Future Work

| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | ✅ Built | Hero, workflow, privacy commitment |
| H3 Hex Grid Aggregation | ✅ Built | Uber H3 resolution 7 cells |
| Priority Scoring Matrix | ✅ Built | 0–100 formula + labels |
| Interactive Leaflet Map | ✅ Built | Polygons, custom facility markers, tooltips |
| Filter & Layer Panel | ✅ Built | Multi-select categories, severity, time range |
| Zone Detail Inspection | ✅ Built | Score breakdown, distance, actions, disclaimers |
| Analytics & Charts | ✅ Built | KPI cards, category bar, trend area, narrative |
| CSV Upload & PII Scan | ✅ Built | PapaParse + header scanner + preview |
| Multi-scenario Demo | ✅ Built | Healthcare, Water, Transit stories |
| Firebase / Auth | 🔮 Future | Optional cloud sync if requested for multi-user teams |
| PDF Report Export | 🔮 Future | Generate printable county brief for board meetings |
