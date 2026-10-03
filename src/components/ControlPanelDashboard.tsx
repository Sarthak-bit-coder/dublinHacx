import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Hospital, 
  Wrench, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Activity, 
  ArrowRight, 
  CloudRain, 
  Droplets, 
  RefreshCw, 
  ShieldAlert, 
  Smartphone, 
  Clock, 
  DollarSign, 
  HardHat, 
  Filter, 
  Compass, 
  FileText,
  Sparkles,
  Layers,
  ChevronRight,
  ThumbsUp
} from 'lucide-react';
import { IssueReport, PriorityRepair, StrategicSite, WeatherImpactData } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface ControlPanelDashboardProps {
  reports: IssueReport[];
  priorities: PriorityRepair[];
  strategicSites: StrategicSite[];
  weatherData: WeatherImpactData | null;
  onSelectReport: (report: IssueReport) => void;
  onSelectRepair: (repair: PriorityRepair) => void;
  onNavigateToMap: () => void;
  onOpenReportModal: () => void;
  onOpenLiteApp: () => void;
  onOpenWeatherModal?: () => void;
  onOpenCouncilPlan?: () => void;
  onUpvoteReport?: (reportId: string) => void;
  isEasyMode?: boolean;
}

export const ControlPanelDashboard: React.FC<ControlPanelDashboardProps> = ({
  reports,
  priorities,
  strategicSites,
  weatherData,
  onSelectReport,
  onSelectRepair,
  onNavigateToMap,
  onOpenReportModal,
  onOpenLiteApp,
  onOpenWeatherModal,
  onOpenCouncilPlan,
  onUpvoteReport,
  isEasyMode = false,
}) => {
  const [selectedMapItem, setSelectedMapItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtered reports for quick community feed preview
  const filteredReports = categoryFilter === 'all' 
    ? reports 
    : reports.filter((r) => r.category === categoryFilter);

  const criticalIssuesCount = reports.filter((r) => r.severity === 'critical').length;
  const emergencyBlocksCount = reports.filter((r) => r.emergencyAccessBlocked).length;

  // Filter top 3 highest priority repairs
  const topPriorities = priorities.slice(0, 3);

  // Key strategic sites
  const hospitalSite = strategicSites.find((s) => s.type === 'hospital');
  const technicianSite = strategicSites.find((s) => s.type === 'technician_depot');

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero & Quick Actions Banner (Clean, Easy to Understand) */}
      <section 
        aria-label="Overview Banner"
        className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/95 to-emerald-950/40 border border-stone-800 p-5 sm:p-6 shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold tracking-wide">
                Pine Basin & Blackwood Valley
              </span>
              <span className="text-xs text-stone-400 font-mono">
                County Precincts 4 & 7
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Rural Infrastructure & Community Portal
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              {isEasyMode 
                ? 'Check road conditions, report hazards in under a minute, and see where county repair crews and new clinics are planned.'
                : 'GIS spatial prioritization, real-time weather degradation telemetry, and AI optimization for rural hospital & technician siting.'}
            </p>
          </div>

          {/* Quick Big Action Buttons (Easy Touch Targets) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-sm shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-stone-950" />
              <span>Report an Issue</span>
            </button>

            <button
              onClick={onOpenLiteApp}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
              title="Ultra-fast version for slow rural 2G/3G connections"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Open Lite Mobile App</span>
              <span className="sm:hidden">Lite App</span>
            </button>

            {onOpenCouncilPlan && (
              <button
                onClick={onOpenCouncilPlan}
                className="hidden lg:flex px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-medium text-xs transition-colors items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Action Plan</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Civic Metric Ribbon (Spacious, Legible, with Weather Impact Card) */}
      <section aria-label="District Civic Metrics" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Real-Time Weather Impact on Infrastructure Degradation */}
        <div 
          onClick={onOpenWeatherModal}
          className="bg-stone-900/90 border border-stone-800 hover:border-cyan-500/60 rounded-xl p-4 shadow-sm transition-all cursor-pointer group relative overflow-hidden"
          role="button"
          tabIndex={0}
          aria-label="View real-time weather degradation telemetry"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
              Weather Degradation
            </span>
            <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 group-hover:scale-110 transition-transform">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono tabular-nums">
              {weatherData ? `${weatherData.erosionMultiplier}x Rate` : '2.4x Rate'}
            </span>
            <span className="text-xs text-stone-400 font-mono">Erosion</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate">
            {weatherData 
              ? `${weatherData.precipitation24hMm}mm Rain · ${weatherData.soilSaturationPct}% Saturation` 
              : '41.2mm rain · 86% Saturation'}
          </p>
          <span className="text-[10px] text-cyan-400/90 font-mono mt-2 flex items-center gap-1 group-hover:underline">
            <span>Tap for live telemetry</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Metric 2: Emergency Corridors & Road Hazards */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block font-semibold">
              Road & Bridge Blocks
            </span>
            <div className="p-1 rounded bg-rose-950/80 border border-rose-800/60 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono tabular-nums">
              {emergencyBlocksCount} Cutoffs
            </span>
            <span className="text-xs text-stone-400 font-mono">Active</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate">
            {criticalIssuesCount} critical repairs awaiting dispatch
          </p>
          <span className="text-[10px] text-stone-500 font-mono mt-2 block">
            School bus & ambulance bypass active
          </span>
        </div>

        {/* Metric 3: AI Hospital Siting Impact */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
              Proposed Hospital Siting
            </span>
            <div className="p-1 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <Hospital className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              -36 min
            </span>
            <span className="text-xs text-stone-400 font-mono">Ambulance</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate">
            Mill Creek Health Center serves 2,400 residents
          </p>
          <span className="text-[10px] text-emerald-400/90 font-mono mt-2 block">
            Golden-hour access rises to 88%
          </span>
        </div>

        {/* Metric 4: AI Technician & Outpost Response */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block font-semibold">
              Technician Response
            </span>
            <div className="p-1 rounded bg-sky-950/80 border border-sky-800/60 text-sky-400">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-sky-400 font-mono tabular-nums">
              42 min
            </span>
            <span className="text-xs text-stone-400 font-mono">vs 3.5 hrs</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate">
            Pine Crossroads equipment & lineman outpost
          </p>
          <span className="text-[10px] text-sky-400/90 font-mono mt-2 block">
            Covers 4 critical mountain passes
          </span>
        </div>
      </section>

      {/* 3. Main Interactive GIS Map (Clear, Center-Stage, with Simple Controls) */}
      <section aria-label="Interactive Infrastructure Map" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Strategic GIS Infrastructure Map</span>
            </h2>
            <p className="text-xs text-stone-400">
              {isEasyMode
                ? 'Tap any marker on the map to see repair details, or tap anywhere to report a hazard at that spot.'
                : 'Elevation contours, river networks, road degradation indices, and AI-optimized hospital/technician locations.'}
            </p>
          </div>

          <button
            onClick={onNavigateToMap}
            className="self-start sm:self-auto text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Full Map Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Embedded Interactive Map */}
        <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-900">
          <InteractiveMap
            reports={reports}
            priorities={priorities}
            strategicSites={strategicSites}
            selectedItem={selectedMapItem}
            onSelectItem={(item) => setSelectedMapItem(item)}
            onDropPin={(coords) => {
              setSelectedMapItem(null);
              onOpenReportModal();
            }}
            onUpvoteReport={(id) => {
              if (onUpvoteReport) onUpvoteReport(id);
            }}
            isLiteMode={false}
          />
        </div>
      </section>

      {/* 4. Three Clean, Simple Focus Sections Below the Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Section A: Top Urgent Repairs Needed (High Priority Queue) */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Immediate Repairs</h3>
                <span className="text-[11px] text-stone-400 font-mono">Ranked by Isolation Risk</span>
              </div>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topPriorities.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRepair(item)}
                className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 hover:border-stone-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800/80 text-rose-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {item.rank}
                    </span>
                    <h4 className="text-xs font-bold text-stone-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.assetName}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                    item.status === 'urgent_dispatch' 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {item.rationale}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-850">
                  <span className="flex items-center gap-1 text-stone-300">
                    <DollarSign className="w-3 h-3 text-stone-500" />
                    ${item.estimatedCostUsd.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3 h-3 text-stone-500" />
                    {item.estimatedCrewDays} Crew Days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: AI Strategic Siting Highlights (Hospitals & Technicians) */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Strategic Siting</h3>
                <span className="text-[11px] text-stone-400 font-mono">Clinics & Technician Depots</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono">
              AI Optimized
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Hospital Recommendation Card */}
            {hospitalSite && (
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5" />
                    Proposed Rural Health Center
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Pine Basin District</span>
                </div>
                <h4 className="text-xs font-bold text-white">{hospitalSite.name}</h4>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {hospitalSite.keyJustification}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-400">
                  <span className="text-emerald-300 font-bold">-{hospitalSite.avgTravelTimeReductionMin} min travel time</span>
                  <span>{hospitalSite.coveragePopulation.toLocaleString()} residents served</span>
                </div>
              </div>
            )}

            {/* Technician Outpost Card */}
            {technicianSite && (
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-sky-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    Heavy Equipment & Lineman Depot
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Crossroads Fork</span>
                </div>
                <h4 className="text-xs font-bold text-white">{technicianSite.name}</h4>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {technicianSite.keyJustification}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-400">
                  <span className="text-sky-300 font-bold">42 min response time</span>
                  <span>4 mountain passes covered</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section C: Recent Community Reports Feed */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Community Reports</h3>
                <span className="text-[11px] text-stone-400 font-mono">Recent Citizen Submissions</span>
              </div>
            </div>
            <button
              onClick={onOpenReportModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
            >
              <span>+ New</span>
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono text-stone-400">
            {['all', 'road', 'bridge', 'water', 'power'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-stone-800 text-emerald-400 font-bold' 
                    : 'bg-stone-950/60 hover:text-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredReports.slice(0, 4).map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-stone-700 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {report.title}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                    report.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                    report.severity === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-stone-800 text-stone-400'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 line-clamp-1">
                  {report.locationName} · {report.affectedHouseholds} homes affected
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                  <span>Reported {report.dateReported}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpvoteReport) onUpvoteReport(report.id);
                    }}
                    className="flex items-center gap-1 text-emerald-400/90 hover:text-emerald-300 font-semibold"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{report.upvotes} Confirm</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
