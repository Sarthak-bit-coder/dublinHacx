# Implementation Plan — NeedMap Hackathon MVP

> **NeedMap**: “Turn community signals into actionable service-access insights.”

---

## Technical Stack
- **Framework**: React + Vite + TypeScript
- **Styling & UI**: Tailwind CSS + `shadcn/ui` + `lucide-react`
- **Map Platform**: Leaflet + OpenStreetMap + `react-leaflet` (100% Free)
- **Geographic Engine**: Uber `h3-js` (resolution 7 hex grid cells for aggregation & privacy)
- **Data Storage**: 100% Client-Side / Browser In-Memory
- **Analytics**: Recharts (signals over time, category breakdowns, priority rankings)

---

## Execution Phases & Checkpoints

### Phase 1: Project Foundation & Landing Page [/]
- [/] Scaffold Vite + React + TypeScript project
- [ ] Install dependencies (`leaflet`, `react-leaflet`, `h3-js`, `recharts`, `lucide-react`, `papaparse`, `@tailwindcss/vite`, `tailwindcss`)
- [ ] Configure Vite, Tailwind CSS, path aliases (`@/`)
- [ ] Setup App Router layout & routing
- [ ] Build Landing Page (Navbar, Hero, Problem Statement, How It Works, Privacy Commitment, Footer)

### Phase 2: Core Data Engine & Synthetic Data [ ]
- TypeScript interfaces (`types.ts`) & constants (`constants.ts`)
- Redwood Valley County synthetic dataset (~200 signals, 18 facilities, 3 demo scenarios)
- Priority scoring formula logic
- H3 hexagonal spatial aggregation engine
- Haversine facility distance calculator
- PII scanner & CSV validator
- Plain-English narrative summary generator

### Phase 3: Interactive Map Dashboard [ ]
- Leaflet map view centered on Redwood Valley County
- H3 Hexagonal Grid layer with priority-based color fills
- Facility markers with custom category icons
- Interactive filter panel
- Selected Zone Detail panel
- Map legend and responsive drawer/sheet for mobile

### Phase 4: Analytics & Insights Panel [ ]
- Summary KPI Cards
- Recharts category breakdown bar chart & time series area chart
- Interactive priority-ranked zone list
- Automated narrative summary card

### Phase 5: CSV Upload Pipeline & Safety System [ ]
- Drag & drop CSV dropzone
- Client-side PapaParse parser
- PII Warning system UI & Header Validation
- Data Preview Table
- In-memory data merge & re-analysis workflow

### Phase 6: Polish, Accessibility & Pitch Package [ ]
- Empty states, loading spinners, error fallbacks
- Accessibility audit
- Final README with setup instructions
- 60-second pitch script
- Production build verification (`npm run build`)
