import React, { useState, useRef } from 'react';
import { 
  IssueReport, 
  PriorityRepair, 
  StrategicSite, 
  IssueCategory 
} from '../types';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Crosshair, 
  AlertTriangle, 
  Wrench, 
  Hospital, 
  Droplet, 
  Zap, 
  Radio, 
  Truck, 
  X, 
  CheckCircle2, 
  ChevronRight,
  ThumbsUp,
  MapPin,
  Clock,
  Users
} from 'lucide-react';

interface InteractiveMapProps {
  reports: IssueReport[];
  priorities: PriorityRepair[];
  strategicSites: StrategicSite[];
  selectedItem: IssueReport | PriorityRepair | StrategicSite | null;
  onSelectItem: (item: any) => void;
  onDropPin: (coords: { x: number; y: number; lat: number; lng: number }) => void;
  onUpvoteReport: (reportId: string) => void;
  isLiteMode: boolean;
}

type MapLayer = 'all' | 'reports' | 'repairs' | 'facilities' | 'isochrone';
type MapStyle = 'topo' | 'satellite' | 'heatmap';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  reports,
  priorities,
  strategicSites,
  selectedItem,
  onSelectItem,
  onDropPin,
  onUpvoteReport,
  isLiteMode,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');
  const [mapStyle, setMapStyle] = useState<MapStyle>('topo');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  const mapSvgRef = useRef<SVGSVGElement | null>(null);

  // Handle map click for pin-drop mode
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPinDropMode || !mapSvgRef.current) return;
    const rect = mapSvgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate geographical conversion
    const lat = 44.05 + (1 - clickY / 100) * 0.3;
    const lng = -116.6 + (clickX / 100) * 0.35;

    onDropPin({
      x: Math.round(clickX * 10) / 10,
      y: Math.round(clickY * 10) / 10,
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
    });
    setIsPinDropMode(false);
  };

  const filteredReports = reports.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'road': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'bridge': return <Wrench className="w-3.5 h-3.5 text-rose-400" />;
      case 'water': return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case 'power': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'health': return <Hospital className="w-3.5 h-3.5 text-emerald-400" />;
      case 'telecom': return <Radio className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getSeverityBorderColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'border-red-500 bg-red-950/80 text-red-300';
      case 'high': return 'border-amber-500 bg-amber-950/80 text-amber-300';
      default: return 'border-stone-500 bg-stone-900/80 text-stone-300';
    }
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[700px] bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Map Toolbar Bar */}
      <div className="z-20 bg-stone-950/90 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        {/* Layer Tabs */}
        <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-lg border border-stone-800 text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'all' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('reports')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'reports' ? 'bg-stone-800 text-amber-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveLayer('repairs')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'repairs' ? 'bg-stone-800 text-red-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Repairs ({priorities.length})
          </button>
          <button
            onClick={() => setActiveLayer('facilities')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'facilities' ? 'bg-stone-800 text-emerald-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Allocations ({strategicSites.length})
          </button>
          <button
            onClick={() => setActiveLayer('isochrone')}
            className={`hidden md:block px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'isochrone' ? 'bg-stone-800 text-rose-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Health Desert
          </button>
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        {activeLayer !== 'facilities' && (
          <div className="hidden xl:flex items-center gap-1.5 text-xs">
            <span className="text-stone-500 font-mono text-[11px] mr-1">Filter:</span>
            {(['all', 'road', 'bridge', 'water', 'power', 'health'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  categoryFilter === cat
                    ? 'bg-stone-800 text-emerald-400 border border-stone-700 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* View Mode & Pin Drop Action */}
        <div className="flex items-center gap-2">
          {/* Map Style Selector */}
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded border border-stone-800 text-xs">
            <button
              onClick={() => setMapStyle('topo')}
              className={`px-2 py-1 rounded ${mapStyle === 'topo' ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-300'}`}
              title="Topographic GIS"
            >
              Topo
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded ${mapStyle === 'satellite' ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-300'}`}
              title="Satellite Terrain"
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('heatmap')}
              className={`px-2 py-1 rounded ${mapStyle === 'heatmap' ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-300'}`}
              title="Degradation Heatmap"
            >
              Heatmap
            </button>
          </div>

          {/* Drop Pin Mode Toggle */}
          <button
            onClick={() => setIsPinDropMode(!isPinDropMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-all ${
              isPinDropMode
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md animate-pulse'
                : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isPinDropMode ? 'Click Map to Place' : 'Drop Pin'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-stone-950">
        <svg
          ref={mapSvgRef}
          onClick={handleMapClick}
          className={`w-full h-full ${isPinDropMode ? 'cursor-crosshair' : 'cursor-default'}`}
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Background pattern for satellite or topo */}
            <radialGradient id="satelliteGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1e241c" />
              <stop offset="60%" stopColor="#131713" />
              <stop offset="100%" stopColor="#0c0e0c" />
            </radialGradient>

            <linearGradient id="valleySlope" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25241e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#161715" stopOpacity="0.8" />
            </linearGradient>

            {/* Pattern for Healthcare Void Zone */}
            <pattern id="diagonalHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.25" />
            </pattern>

            {/* Heatmap gradients */}
            <radialGradient id="heatHotspot1" cx="28%" cy="34%" r="18%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHotspot2" cx="52%" cy="22%" r="20%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHotspot3" cx="22%" cy="15%" r="16%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>

            {/* Coverage radius gradients for facilities */}
            <radialGradient id="hospitalCoverage" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="depotCoverage" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="75%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292524" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Base Layer depending on style */}
          {mapStyle === 'satellite' ? (
            <rect width="1000" height="650" fill="url(#satelliteGlow)" />
          ) : (
            <rect width="1000" height="650" fill="#141210" />
          )}

          {/* Topographic Contour Lines */}
          <g className="opacity-25" stroke="#78716c" strokeWidth="0.75" fill="none">
            {/* Mountain Ridge 1 */}
            <path d="M 50 180 Q 220 90 400 120 T 780 80 T 960 140" />
            <path d="M 40 220 Q 240 130 420 160 T 800 120 T 970 180" />
            <path d="M 30 270 Q 250 190 440 210 T 820 180 T 980 230" />
            {/* Valley Contours */}
            <path d="M 80 400 Q 290 320 520 340 T 900 310" />
            <path d="M 90 470 Q 320 390 560 410 T 920 380" />
            <path d="M 120 560 Q 360 470 600 500 T 940 460" />
            <path d="M 160 620 Q 400 540 650 570 T 960 540" />
          </g>

          {/* Elevation Labels */}
          <g className="fill-stone-600 text-[9px] font-mono select-none opacity-40">
            <text x="60" y="175">EL 1840m</text>
            <text x="750" y="75">EL 2100m (Timber Pass)</text>
            <text x="80" y="465">EL 980m (Pine Basin)</text>
            <text x="700" y="500">EL 820m (Cedar Flats)</text>
          </g>

          {/* Map Grid */}
          <rect width="1000" height="650" fill="url(#gridPattern)" />

          {/* River & Creek Drainage Network */}
          <g fill="none">
            {/* Blackwood River */}
            <path
              d="M 980 40 Q 820 110 650 170 T 480 280 T 320 380 T 150 490 T 20 620"
              stroke="#0284c7"
              strokeWidth="5"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
            {/* Mill Creek Tributary */}
            <path
              d="M 280 20 Q 320 140 380 220 T 480 280"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            {/* South Fork Branch */}
            <path
              d="M 480 280 Q 580 390 680 470 T 890 610"
              stroke="#0ea5e9"
              strokeWidth="3"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
          </g>

          {/* Waterway Labels */}
          <g className="fill-sky-400 text-[10px] font-mono italic opacity-60">
            <text x="660" y="160" transform="rotate(15 660 160)">Blackwood River</text>
            <text x="320" y="120" transform="rotate(65 320 120)">Mill Creek</text>
            <text x="600" y="410" transform="rotate(35 600 410)">South Fork</text>
          </g>

          {/* Healthcare Desert / Isochrone Layer (>45 min ambulance) */}
          {(activeLayer === 'all' || activeLayer === 'isochrone') && (
            <g className="transition-opacity duration-300">
              {/* Isolated high valley polygon */}
              <polygon
                points="120,60 380,80 460,240 260,340 100,280 60,140"
                fill="url(#diagonalHatch)"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              <text x="140" y="140" fill="#f87171" className="text-[10px] font-mono font-semibold opacity-85">
                ISOLATION VOID: &gt;55 Min Response Zone
              </text>
            </g>
          )}

          {/* Degradation Heatmap Overlay (if selected) */}
          {mapStyle === 'heatmap' && (
            <g className="mix-blend-screen pointer-events-none">
              <circle cx="280" cy="221" r="140" fill="url(#heatHotspot1)" />
              <circle cx="520" cy="143" r="160" fill="url(#heatHotspot2)" />
              <circle cx="220" cy="98" r="120" fill="url(#heatHotspot3)" />
            </g>
          )}

          {/* Road Network */}
          <g fill="none">
            {/* Primary County Route 14 (Paved Arterial) */}
            <path
              d="M 50 360 Q 220 330 460 350 T 820 390 T 960 410"
              stroke="#e7e5e4"
              strokeWidth="3.5"
              strokeOpacity="0.8"
            />
            {/* Secondary Arterial 8 (Valley Corridor) */}
            <path
              d="M 460 350 Q 510 240 540 150 T 560 30"
              stroke="#a8a29e"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              strokeOpacity="0.75"
            />
            {/* East Ridge Logging Pass (Vulnerable unpaved) */}
            <path
              d="M 180 450 Q 240 320 280 220 T 360 140"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.8"
            />
            {/* Highland Timber Pass Spur (High washout risk) */}
            <path
              d="M 280 220 Q 230 160 210 95 T 190 40"
              stroke="#ea580c"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />
            {/* South Canyon Road */}
            <path
              d="M 460 350 Q 560 460 620 507 T 720 620"
              stroke="#78716c"
              strokeWidth="1.75"
              strokeDasharray="4 4"
              strokeOpacity="0.7"
            />
          </g>

          {/* Settlement / Community Centroid Anchors */}
          <g className="text-stone-300 font-medium text-[11px] select-none">
            {/* Pine Basin Village */}
            <circle cx="460" cy="350" r="4.5" fill="#f59e0b" stroke="#1c1917" strokeWidth="2" />
            <text x="472" y="354" className="font-semibold fill-amber-300">Pine Crossroads</text>

            {/* Highland Valley */}
            <circle cx="210" cy="95" r="4" fill="#a8a29e" stroke="#1c1917" strokeWidth="1.5" />
            <text x="222" y="99" className="fill-stone-300">Highland Valley (Pop. 1,420)</text>

            {/* Blackwood Crossing */}
            <circle cx="530" cy="145" r="4" fill="#a8a29e" stroke="#1c1917" strokeWidth="1.5" />
            <text x="542" y="149" className="fill-stone-300">Blackwood Hamlet</text>

            {/* Cedar Flats */}
            <circle cx="780" cy="420" r="4.5" fill="#a8a29e" stroke="#1c1917" strokeWidth="1.5" />
            <text x="792" y="424" className="fill-stone-300">Cedar Flats (Pop. 3,100)</text>
          </g>

          {/* Strategic Facilities Coverage Shadows */}
          {(activeLayer === 'all' || activeLayer === 'facilities') && (
            <g>
              {strategicSites.map((site) => {
                const cx = (site.coordinates.x / 100) * 1000;
                const cy = (site.coordinates.y / 100) * 650;
                const radius = site.type === 'hospital' ? 180 : site.type === 'technician_depot' ? 220 : 110;
                const gradId = site.type === 'hospital' ? 'url(#hospitalCoverage)' : 'url(#depotCoverage)';

                return (
                  <g key={`cov-${site.id}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={gradId}
                      stroke={site.type === 'hospital' ? '#10b981' : '#0284c7'}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.4"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Priority Repairs Indicators */}
          {(activeLayer === 'all' || activeLayer === 'repairs') && (
            <g>
              {priorities.map((prio) => {
                const cx = (prio.coordinates.x / 100) * 1000;
                const cy = (prio.coordinates.y / 100) * 650;
                const isSelected = selectedItem?.id === prio.id;

                return (
                  <g
                    key={prio.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(prio);
                    }}
                    onMouseEnter={() => setHoveredItem(prio)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Urgency Pulsing Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? "22" : "16"}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={isSelected ? "3" : "1.5"}
                      strokeOpacity="0.7"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="#991b1b"
                      stroke="#f87171"
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      className="fill-white font-mono text-[10px] font-bold pointer-events-none"
                    >
                      #{prio.rank}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Citizen Issue Reports Markers */}
          {(activeLayer === 'all' || activeLayer === 'reports') && (
            <g>
              {filteredReports.map((report) => {
                const cx = (report.coordinates.x / 100) * 1000;
                const cy = (report.coordinates.y / 100) * 650;
                const isSelected = selectedItem?.id === report.id;
                const isCritical = report.severity === 'critical';

                return (
                  <g
                    key={report.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(report);
                    }}
                    onMouseEnter={() => setHoveredItem(report)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {isCritical && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="#ef4444"
                        fillOpacity="0.25"
                        stroke="#ef4444"
                        strokeWidth="1"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? "9" : "7"}
                      fill={isCritical ? "#dc2626" : "#f59e0b"}
                      stroke="#1c1917"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Strategic Facilities Markers (New Hospitals / Technician Depots) */}
          {(activeLayer === 'all' || activeLayer === 'facilities') && (
            <g>
              {strategicSites.map((site) => {
                const cx = (site.coordinates.x / 100) * 1000;
                const cy = (site.coordinates.y / 100) * 650;
                const isSelected = selectedItem?.id === site.id;
                const isHospital = site.type === 'hospital';

                return (
                  <g
                    key={site.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(site);
                    }}
                    onMouseEnter={() => setHoveredItem(site)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Diamond or Hexagon container */}
                    <rect
                      x={cx - 14}
                      y={cy - 14}
                      width="28"
                      height="28"
                      rx="6"
                      transform={`rotate(45 ${cx} ${cy})`}
                      fill={isHospital ? "#065f46" : "#075985"}
                      stroke={isHospital ? "#34d399" : "#38bdf8"}
                      strokeWidth={isSelected ? "3" : "1.5"}
                    />
                    {isHospital ? (
                      <path
                        d={`M ${cx - 6} ${cy} L ${cx + 6} ${cy} M ${cx} ${cy - 6} L ${cx} ${cy + 6}`}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    ) : (
                      <circle cx={cx} cy={cy} r="4" fill="#ffffff" />
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Compass / Scale Indicator */}
        <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-stone-800 text-stone-400 font-mono text-[11px] flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-200">N</span>
            <div className="w-12 h-1 bg-stone-700 relative">
              <div className="absolute top-0 left-0 w-6 h-full bg-stone-400" />
            </div>
            <span>10 km</span>
          </div>
          <span className="hidden sm:inline text-stone-600">|</span>
          <span className="hidden sm:inline text-stone-500">NAD83 County Plane</span>
        </div>

        {/* Hover Tooltip Preview */}
        {hoveredItem && !selectedItem && (
          <div 
            className="absolute z-30 pointer-events-none bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-lg p-2.5 text-xs shadow-xl max-w-xs transition-opacity"
            style={{
              left: `${Math.min(Math.max((hoveredItem.coordinates?.x || 50), 10), 75)}%`,
              top: `${Math.min(Math.max((hoveredItem.coordinates?.y || 50) - 14, 8), 80)}%`,
            }}
          >
            <p className="font-semibold text-stone-100">{hoveredItem.title || hoveredItem.name || hoveredItem.assetName}</p>
            <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-2">
              {hoveredItem.description || hoveredItem.rationale || hoveredItem.keyJustification}
            </p>
          </div>
        )}

        {/* Selected Item Drawer / Dossier Modal */}
        {selectedItem && (() => {
          const item = selectedItem as any;
          return (
            <div className="absolute bottom-4 right-4 z-30 w-80 sm:w-96 bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-xl p-4 shadow-2xl text-xs text-stone-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2.5">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    {item.categoryLabel || item.infrastructureType || 'Infrastructure Asset'}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-0.5">
                    {item.title || item.name || item.assetName}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectItem(null)}
                  className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo preview if present */}
              {item.photoUrl && !isLiteMode && (
                <div className="mt-2.5 rounded-lg overflow-hidden border border-stone-800 h-28 relative">
                  <img
                    src={item.photoUrl}
                    alt="Infrastructure inspection"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 bg-stone-950/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-300">
                    Field Photo
                  </div>
                </div>
              )}

              {/* Description / Rationale */}
              <p className="mt-2.5 text-stone-300 leading-relaxed text-[11px]">
                {item.description || item.rationale || item.keyJustification}
              </p>

              {/* Quantitative Data Matrix */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-800/80 font-mono text-[11px]">
                {item.affectedHouseholds !== undefined && (
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    <span>{item.affectedHouseholds} households</span>
                  </div>
                )}
                {item.avgTravelTimeReductionMin !== undefined && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>-{item.avgTravelTimeReductionMin}m transit</span>
                  </div>
                )}
                {item.degradationScore !== undefined && (
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Degradation: {item.degradationScore}/100</span>
                  </div>
                )}
                {item.estimatedCostUsd !== undefined && (
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <span>Est: ${item.estimatedCostUsd.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2">
                {item.upvotes !== undefined ? (
                  <button
                    onClick={() => onUpvoteReport(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confirm / Upvote ({item.upvotes})</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-stone-400">
                    Priority Score: {item.priorityScore || item.urgencyScore}%
                  </span>
                )}

                <span className="text-[10px] font-mono text-stone-500">
                  Lat: {item.coordinates?.lat}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom Map Status Strip */}
      <div className="bg-stone-950 px-4 py-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-400 font-mono gap-2">
        <div className="flex items-center gap-3">
          <span>Active Reports: <strong className="text-stone-200">{reports.length}</strong></span>
          <span className="text-stone-700">·</span>
          <span>Emergency Blocks: <strong className="text-red-400">{reports.filter(r => r.emergencyAccessBlocked).length}</strong></span>
          <span className="text-stone-700">·</span>
          <span>Recommended Facilities: <strong className="text-emerald-400">{strategicSites.length}</strong></span>
        </div>
        <div className="text-[11px] text-stone-500">
          Click any pin on terrain to view engineering rationale & civic status
        </div>
      </div>
    </div>
  );
};
