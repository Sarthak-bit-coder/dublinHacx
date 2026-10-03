import React, { useState, useEffect, useRef } from 'react';
import { 
  IssueReport, 
  PriorityRepair, 
  StrategicSite, 
  IssueCategory 
} from '../types';
import { 
  Layers, 
  Eye, 
  Crosshair, 
  AlertTriangle, 
  Wrench, 
  Hospital, 
  Droplet, 
  Zap, 
  Radio, 
  X, 
  ChevronRight,
  ThumbsUp,
  MapPin,
  Clock,
  Users,
  Compass,
  Sliders,
  Box,
  RotateCw,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import L from 'leaflet';

interface InteractiveMapProps {
  reports: IssueReport[];
  priorities: PriorityRepair[];
  strategicSites: StrategicSite[];
  selectedItem: IssueReport | PriorityRepair | StrategicSite | null;
  onSelectItem: (item: any) => void;
  onDropPin: (coords: { x: number; y: number; lat: number; lng: number }) => void;
  onUpvoteReport?: (reportId: string) => void;
  isLiteMode?: boolean;
}

// Tile layers definitions for real map
const TILE_SERVERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

interface CandidateSiteItem {
  id: string;
  rank: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  score: number;
  populationWithin30Min: number;
  beds: number;
  type: 'hospital' | 'depot' | 'clinic';
  reasons: string;
}

// Preset model weight configurations matching reference design
const WEIGHT_PRESETS = {
  balanced: { peopleHelped: 23, remoteness: 16, bedShortage: 17, communityNeed: 12, serviceDemand: 12, rightSize: 12, valueCost: 12 },
  mostPeople: { peopleHelped: 45, remoteness: 5, bedShortage: 15, communityNeed: 10, serviceDemand: 10, rightSize: 10, valueCost: 5 },
  remoteAreas: { peopleHelped: 10, remoteness: 45, bedShortage: 15, communityNeed: 15, serviceDemand: 5, rightSize: 5, valueCost: 5 },
  highNeed: { peopleHelped: 15, remoteness: 15, bedShortage: 15, communityNeed: 40, serviceDemand: 5, rightSize: 5, valueCost: 5 },
  bestValue: { peopleHelped: 15, remoteness: 10, bedShortage: 10, communityNeed: 10, serviceDemand: 10, rightSize: 15, valueCost: 30 }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  reports,
  priorities,
  strategicSites,
  selectedItem,
  onSelectItem,
  onDropPin,
  onUpvoteReport,
  isLiteMode = false,
}) => {
  // Real Leaflet Map Container Reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatCirclesGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Controls State
  const [mapTileStyle, setMapTileStyle] = useState<'satellite' | 'dark' | 'topo'>('satellite');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [pitchAngle, setPitchAngle] = useState<number>(38); // 3D Pitch tilt angle 0° - 55°
  const [rotationAngle, setRotationAngle] = useState<number>(-12); // 3D Rotation angle
  const [updateOnMove, setUpdateOnMove] = useState<boolean>(true);
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [activePreset, setActivePreset] = useState<keyof typeof WEIGHT_PRESETS>('balanced');

  // Sliders State (Model Weights matching reference image)
  const [weights, setWeights] = useState(WEIGHT_PRESETS.balanced);

  // Candidate Sites List
  const [candidateList, setCandidateList] = useState<CandidateSiteItem[]>([
    { id: 'site-1', rank: 1, name: 'Pittsburg County, OK', region: 'Oklahoma', lat: 34.92, lng: -95.76, score: 90, populationWithin30Min: 40774, beds: 100, type: 'hospital', reasons: 'High rural health desert & emergency isolation' },
    { id: 'site-2', rank: 2, name: 'Dixie County, FL', region: 'Florida', lat: 29.61, lng: -83.16, score: 89, populationWithin30Min: 40209, beds: 100, type: 'hospital', reasons: 'Coastal storm surge & road access cutoff' },
    { id: 'site-3', rank: 3, name: 'Pine Crossroads, ID', region: 'Idaho Precinct 4', lat: 44.182, lng: -116.425, score: 89, populationWithin30Min: 14820, beds: 50, type: 'hospital', reasons: 'Mountain pass culvert failure & ambulance delay' },
    { id: 'site-4', rank: 4, name: 'Navajo County, AZ', region: 'Arizona', lat: 34.88, lng: -110.02, score: 89, populationWithin30Min: 9995, beds: 25, type: 'clinic', reasons: 'Tribal lands health shortage area' },
    { id: 'site-5', rank: 5, name: 'Highland Ridge Depot, ID', region: 'Idaho Precinct 7', lat: 44.225, lng: -116.385, score: 88, populationWithin30Min: 18450, beds: 35, type: 'depot', reasons: 'Equidistant heavy technician & lineman staging' },
    { id: 'site-6', rank: 6, name: 'San Miguel County, NM', region: 'New Mexico', lat: 35.45, lng: -105.15, score: 88, populationWithin30Min: 19462, beds: 50, type: 'hospital', reasons: 'Wildfire evac corridor & flash flood risk' },
    { id: 'site-7', rank: 7, name: 'Gila County, AZ', region: 'Arizona', lat: 33.40, lng: -110.85, score: 88, populationWithin30Min: 19817, beds: 50, type: 'clinic', reasons: 'MUA/P HRSA primary care shortage' },
    { id: 'site-8', rank: 8, name: 'Prince Edward County, VA', region: 'Virginia', lat: 37.22, lng: -78.43, score: 88, populationWithin30Min: 46950, beds: 100, type: 'hospital', reasons: 'High elder population density' },
    { id: 'site-9', rank: 9, name: 'Wright County, MO', region: 'Missouri', lat: 37.27, lng: -92.46, score: 88, populationWithin30Min: 34073, beds: 100, type: 'hospital', reasons: 'High SVI index & river basin washout' },
    { id: 'site-10', rank: 10, name: 'Zapata County, TX', region: 'Texas', lat: 26.90, lng: -99.27, score: 88, populationWithin30Min: 13855, beds: 25, type: 'clinic', reasons: 'Border colonias healthcare void' },
    { id: 'site-11', rank: 11, name: 'Stephens County, OK', region: 'Oklahoma', lat: 34.48, lng: -97.94, score: 87, populationWithin30Min: 28838, beds: 50, type: 'hospital', reasons: 'Tornado corridor backup facility' }
  ]);

  // Recalculate Candidate Site Scores dynamically when weights change
  useEffect(() => {
    const totalWeight = weights.peopleHelped + weights.remoteness + weights.bedShortage + weights.communityNeed + weights.serviceDemand + weights.rightSize + weights.valueCost;
    if (totalWeight === 0) return;

    setCandidateList((prev) => {
      const updated = prev.map((site) => {
        // Dynamic scoring algorithm based on model sliders
        const pFactor = (site.populationWithin30Min / 50000) * (weights.peopleHelped / totalWeight);
        const rFactor = (site.type === 'depot' ? 0.9 : 0.7) * (weights.remoteness / totalWeight);
        const bFactor = (site.beds / 100) * (weights.bedShortage / totalWeight);
        const cFactor = 0.85 * (weights.communityNeed / totalWeight);
        const sFactor = 0.80 * (weights.serviceDemand / totalWeight);
        const vFactor = 0.90 * (weights.valueCost / totalWeight);

        const newScore = Math.min(99, Math.max(70, Math.round((pFactor + rFactor + bFactor + cFactor + sFactor + vFactor) * 100)));
        return { ...site, score: newScore };
      });

      // Sort by new optimization score
      updated.sort((a, b) => b.score - a.score);
      return updated.map((site, index) => ({ ...site, rank: index + 1 }));
    });
  }, [weights]);

  // Handle preset selection
  const applyPreset = (presetKey: keyof typeof WEIGHT_PRESETS) => {
    setActivePreset(presetKey);
    setWeights(WEIGHT_PRESETS[presetKey]);
  };

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    // Center map on Idaho Precinct / Midwest US region
    const map = L.map(mapContainerRef.current, {
      center: [44.19, -116.43],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    leafletMapRef.current = map;

    // Add Tile Layer
    const tileConfig = TILE_SERVERS[mapTileStyle];
    L.tileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    // Create Layer Groups
    heatCirclesGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Map click for pin drop
    map.on('click', (e: L.LeafletMouseEvent) => {
      onDropPin({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000,
        x: 50,
        y: 50,
      });
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Tile Layer when tile style changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileConfig = TILE_SERVERS[mapTileStyle];
    L.tileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapTileStyle]);

  // Render Real Markers & Heat Circles on Leaflet Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    const heatGroup = heatCirclesGroupRef.current;
    if (!map || !markersGroup || !heatGroup) return;

    markersGroup.clearLayers();
    heatGroup.clearLayers();

    // 1. Draw Population & Need Heatmap Circles
    candidateList.forEach((site) => {
      const radius = 25000 + site.populationWithin30Min * 0.8;
      const color = site.score > 88 ? '#ef4444' : site.score > 85 ? '#f59e0b' : '#3b82f6';

      L.circle([site.lat, site.lng], {
        radius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.22,
      }).addTo(heatGroup);

      // Inner core heat pulse
      L.circle([site.lat, site.lng], {
        radius: radius * 0.4,
        color: color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.45,
      }).addTo(heatGroup);
    });

    // 2. Add Candidate Site Ranked Markers
    candidateList.forEach((site) => {
      const isTop3 = site.rank <= 3;
      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${isTop3 ? 'bg-blue-600 text-white shadow-blue-500/50 ring-4 ring-blue-500/30' : 'bg-stone-900 border border-stone-700 text-stone-200'} font-bold font-mono text-xs flex items-center justify-center shadow-lg transition-transform transform hover:scale-125">
            ${site.rank}
          </div>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-50">
            ${site.name} (${site.score} pts)
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([site.lat, site.lng], { icon: customIcon }).addTo(markersGroup);
      marker.on('click', () => {
        onSelectItem({
          id: site.id,
          name: site.name,
          title: `${site.name} (Rank #${site.rank})`,
          keyJustification: `${site.reasons}. Serves ${site.populationWithin30Min.toLocaleString()} residents within 30 min.`,
          priorityScore: site.score,
          avgTravelTimeReductionMin: 36,
          coveragePopulation: site.populationWithin30Min,
          district: site.region,
          coordinates: { lat: site.lat, lng: site.lng, x: 50, y: 50 }
        });
      });
    });

    // 3. Add Active Citizen Reports & Washed Out Bridges
    reports.forEach((rep) => {
      const lat = rep.coordinates.lat || 44.195;
      const lng = rep.coordinates.lng || -116.481;

      const isCritical = rep.severity === 'critical';
      const iconHtml = `
        <div class="w-5 h-5 rounded-full ${isCritical ? 'bg-red-600 ring-4 ring-red-500/40 animate-pulse' : 'bg-amber-500'} border-2 border-stone-950 flex items-center justify-center shadow-md">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-report-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);
      marker.on('click', () => onSelectItem(rep));
    });

  }, [candidateList, reports, mapTileStyle]);

  // Pan map to candidate site on click from left panel
  const handleSelectCandidate = (site: CandidateSiteItem) => {
    const map = leafletMapRef.current;
    if (map) {
      map.flyTo([site.lat, site.lng], 11, { duration: 1.5 });
    }
    onSelectItem({
      id: site.id,
      name: site.name,
      title: `${site.name} (Rank #${site.rank})`,
      keyJustification: `${site.reasons}. Serves ${site.populationWithin30Min.toLocaleString()} residents within 30 minutes.`,
      priorityScore: site.score,
      avgTravelTimeReductionMin: 36,
      coveragePopulation: site.populationWithin30Min,
      district: site.region,
      coordinates: { lat: site.lat, lng: site.lng, x: 50, y: 50 }
    });
  };

  return (
    <div className="relative w-full h-[680px] lg:h-[780px] bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      
      {/* 1. Sleek Top Glassmorphism Control Bar */}
      <header className="z-30 bg-stone-950/90 backdrop-blur-md px-4 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>NeedMap Real GIS Engine</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-mono">
                Satellite & 3D Tilt Mode
              </span>
            </h2>
          </div>
        </div>

        {/* Map View Mode Switches */}
        <div className="flex items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                mapTileStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapTileStyle('dark')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                mapTileStyle === 'dark' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🌙 Dark Vector
            </button>
            <button
              onClick={() => setMapTileStyle('topo')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                mapTileStyle === 'topo' ? 'bg-stone-800 text-amber-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⛰️ Topo
            </button>
          </div>

          {/* COOL 3D TERRAIN TILT TOGGLE */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
              is3DMode
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
            }`}
          >
            <Box className={`w-3.5 h-3.5 ${is3DMode ? 'animate-bounce' : ''}`} />
            <span>{is3DMode ? '3D Tilt ON (38° Pitch)' : '2D Flat View'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main GIS Real Map Container with 3D Tilt Transform */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-stone-950 perspective-1000">
        
        {/* Real Leaflet Map Wrapper with 3D Pitch/Tilt Transform */}
        <div
          ref={mapContainerRef}
          className="w-full h-full transition-transform duration-700 ease-out z-0"
          style={{
            transform: is3DMode
              ? `rotateX(${pitchAngle}deg) rotateZ(${rotationAngle}deg) scale(1.15)`
              : 'rotateX(0deg) rotateZ(0deg) scale(1.0)',
            transformOrigin: '50% 60%',
          }}
        />

        {/* 3D Tilt Control Angle Slider Bar (Visible in 3D mode) */}
        {is3DMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/40 text-xs font-mono text-stone-200 flex items-center gap-3 shadow-2xl">
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> 3D Perspective Pitch:
            </span>
            <input
              type="range"
              min="0"
              max="55"
              value={pitchAngle}
              onChange={(e) => setPitchAngle(Number(e.target.value))}
              className="w-24 accent-purple-500 cursor-pointer"
            />
            <span className="text-purple-400 font-bold">{pitchAngle}°</span>

            <span className="text-stone-600">|</span>
            <span className="text-stone-400">Rotate Z:</span>
            <input
              type="range"
              min="-45"
              max="45"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
            <span className="text-blue-400 font-bold">{rotationAngle}°</span>
          </div>
        )}

        {/* LEFT FLOATING PANEL: Top Candidate Sites Ranking List (Matches Reference Image) */}
        <div className="absolute top-4 left-4 z-20 w-80 max-h-[88%] bg-stone-950/90 backdrop-blur-xl border border-stone-800/90 rounded-xl p-3.5 shadow-2xl flex flex-col text-xs text-stone-200 animate-in fade-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-medium">
              <input
                type="checkbox"
                checked={updateOnMove}
                onChange={(e) => setUpdateOnMove(e.target.checked)}
                className="rounded bg-stone-900 border-stone-700 text-blue-500 focus:ring-blue-500"
              />
              <span>Update as I move map</span>
            </label>
            <span className="text-[10px] font-mono text-stone-400">Best sites in area</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2.5 space-y-2 pr-1">
            {candidateList.map((site) => (
              <div
                key={site.id}
                onClick={() => handleSelectCandidate(site)}
                className="p-2.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800/80 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-full shrink-0 font-bold font-mono text-[11px] flex items-center justify-center ${
                    site.rank <= 3 ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {site.rank}
                  </span>
                  <div className="truncate">
                    <h4 className="font-bold text-stone-100 group-hover:text-blue-300 transition-colors truncate">
                      {site.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 truncate">
                      {site.populationWithin30Min.toLocaleString()} newly within 30m · {site.beds} beds
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-blue-400 shrink-0">
                  {site.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FLOATING PANEL: Model Weights & Interactive Sliders (Matches Reference Image) */}
        <div className="absolute top-4 right-4 z-20 w-80 max-h-[90%] bg-stone-950/90 backdrop-blur-xl border border-stone-800/90 rounded-xl p-4 shadow-2xl flex flex-col text-xs text-stone-200 overflow-y-auto animate-in fade-in slide-in-from-right duration-300 space-y-3.5">
          
          {/* Header Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              Ranking Stage 8 candidate sites...
            </span>
          </div>

          {/* Region Selector */}
          <div>
            <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">
              REGION / PRECINCT
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Idaho Precincts 4 & 7 (628 candidate sites)</option>
              <option value="missouri">Missouri (628 candidate sites)</option>
              <option value="oklahoma">Oklahoma Region</option>
            </select>
          </div>

          {/* Model Weights Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                MODEL WEIGHTS PRESETS
              </label>
              <button
                onClick={() => applyPreset('balanced')}
                className="text-[10px] text-blue-400 hover:underline font-mono"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(WEIGHT_PRESETS) as Array<keyof typeof WEIGHT_PRESETS>).map((key) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                    activePreset === key
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {key.replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Custom mix from the sliders below.</p>
          </div>

          {/* Sliders List */}
          <div className="space-y-2.5 pt-1 border-t border-stone-800">
            {/* Slider 1: People Helped */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-semibold text-stone-200">People helped</span>
                <span className="font-mono text-blue-400 font-bold">{weights.peopleHelped}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.peopleHelped}
                onChange={(e) => {
                  setActivePreset('balanced');
                  setWeights({ ...weights, peopleHelped: Number(e.target.value) });
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <p className="text-[9px] text-stone-400">Drive time saved across everyone nearby</p>
            </div>

            {/* Slider 2: Remoteness */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-semibold text-stone-200">Remoteness</span>
                <span className="font-mono text-blue-400 font-bold">{weights.remoteness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.remoteness}
                onChange={(e) => {
                  setActivePreset('balanced');
                  setWeights({ ...weights, remoteness: Number(e.target.value) });
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <p className="text-[9px] text-stone-400">Distance from existing hospital/outpost</p>
            </div>

            {/* Slider 3: Bed Shortage */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-semibold text-stone-200">Bed / Facility shortage</span>
                <span className="font-mono text-blue-400 font-bold">{weights.bedShortage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.bedShortage}
                onChange={(e) => {
                  setActivePreset('balanced');
                  setWeights({ ...weights, bedShortage: Number(e.target.value) });
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            {/* Slider 4: Community Need / SVI */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-semibold text-stone-200">Community need (SVI)</span>
                <span className="font-mono text-blue-400 font-bold">{weights.communityNeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.communityNeed}
                onChange={(e) => {
                  setActivePreset('balanced');
                  setWeights({ ...weights, communityNeed: Number(e.target.value) });
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT FLOATING LEGEND (Matches Reference Image) */}
        <div className="absolute bottom-4 left-4 z-20 bg-stone-950/90 backdrop-blur-md p-3 rounded-xl border border-stone-800 text-xs font-mono text-stone-300 shadow-2xl space-y-2">
          <div className="font-bold text-white text-[11px] border-b border-stone-800 pb-1">Legend</div>
          
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
              <span>Existing hospital / clinic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/50"></span>
              <span>Recommended candidate site (rank)</span>
            </div>
          </div>

          <div className="pt-1.5">
            <span className="text-[9px] text-stone-400 block mb-0.5">Score Scale</span>
            <div className="w-32 h-2 rounded bg-gradient-to-r from-blue-600 via-amber-500 to-red-600"></div>
            <div className="flex justify-between text-[8px] text-stone-400 mt-0.5">
              <span>Low (70)</span>
              <span>High (99)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Footer Strip */}
      <footer className="bg-stone-950 px-4 py-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
        <div>Real Map Source: Esri World Imagery & OpenStreetMap | 3D Canvas Matrix</div>
        <div className="text-emerald-400 font-bold">100% Interactive Multi-Criteria Decision Model</div>
      </footer>
    </div>
  );
};
