import React, { useState, useEffect } from 'react';
import { 
  DISTRICTS, 
  INITIAL_REPORTS, 
  INITIAL_PRIORITIES, 
  INITIAL_STRATEGIC_SITES, 
  INITIAL_AI_CLUSTERS 
} from './data/mockData';
import { 
  IssueReport, 
  PriorityRepair, 
  StrategicSite, 
  AIPatternCluster,
  WeatherImpactData 
} from './types';
import { fetchWeatherImpact } from './services/weatherService';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { ReportModal } from './components/ReportModal';
import { PatternInsightsPanel } from './components/PatternInsightsPanel';
import { PriorityRepairQueue } from './components/PriorityRepairQueue';
import { IssueReportsList } from './components/IssueReportsList';
import { StrategicPlacementPanel } from './components/StrategicPlacementPanel';
import { CouncilActionPlanModal } from './components/CouncilActionPlanModal';
import { SpatialPipelineModal } from './components/SpatialPipelineModal';
import { CybersecurityModal } from './components/CybersecurityModal';
import { UploadModal } from './components/upload/UploadModal';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import { LiteReportApp } from './components/LiteReportApp';
import { ControlPanelDashboard } from './components/ControlPanelDashboard';
import { 
  AlertTriangle, 
  Hospital, 
  Wrench, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Users,
  Activity,
  ArrowRight,
  CloudRain,
  Droplets,
  RefreshCw,
  X,
  Wind,
  Thermometer,
  ShieldAlert,
  Smartphone,
  Database,
  ShieldCheck,
  Upload
} from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<'full' | 'lite'>('full');
  const [activeTab, setActiveTab] = useState<'control-panel' | 'map' | 'reports' | 'ai-patterns' | 'priority-queue' | 'strategic-sites'>('control-panel');
  const [reports, setReports] = useState<IssueReport[]>(INITIAL_REPORTS);
  const [priorities, setPriorities] = useState<PriorityRepair[]>(INITIAL_PRIORITIES);
  const [strategicSites, setStrategicSites] = useState<StrategicSite[]>(INITIAL_STRATEGIC_SITES);
  const [clusters, setClusters] = useState<AIPatternCluster[]>(INITIAL_AI_CLUSTERS);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCouncilPlanOpen, setIsCouncilPlanOpen] = useState(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [isEasyMode, setIsEasyMode] = useState(true); // Default to easy friendly mode for rural users
  const [droppedCoords, setDroppedCoords] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);

  // Weather telemetry state
  const [weatherData, setWeatherData] = useState<WeatherImpactData | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Check URL parameters for direct Lite App access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'lite' || window.location.hash.includes('lite') || window.location.pathname.includes('lite')) {
        setAppMode('lite');
      }
    }
  }, []);

  // Fetch initial server reports if online
  const fetchServerReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
          setReports(data.reports);
        }
      }
    } catch {
      // Use existing state
    }
  };

  useEffect(() => {
    fetchServerReports();
  }, []);

  // Load weather impact telemetry on mount
  useEffect(() => {
    let isMounted = true;
    fetchWeatherImpact().then((data) => {
      if (isMounted) setWeatherData(data);
    });
    return () => { isMounted = false; };
  }, []);

  const handleRefreshWeather = async () => {
    setIsRefreshingWeather(true);
    try {
      const fresh = await fetchWeatherImpact();
      setWeatherData(fresh);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  // Handle report created from lightweight mobile app
  const handleReportCreatedFromLite = (newReport: any) => {
    setReports((prev) => {
      const exists = prev.some((r) => r.id === newReport.id);
      if (exists) return prev;
      return [newReport, ...prev];
    });

    if (newReport.severity === 'critical' || newReport.severity === 'high') {
      const newPrio: PriorityRepair = {
        id: `prio-${Date.now()}`,
        reportId: newReport.id,
        rank: priorities.length + 1,
        assetName: newReport.title,
        district: newReport.districtName,
        degradationScore: newReport.severity === 'critical' ? 88 : 74,
        isolationRiskScore: newReport.emergencyAccessBlocked ? 90 : 70,
        urgencyScore: newReport.severity === 'critical' ? 91 : 75,
        estimatedCrewDays: newReport.severity === 'critical' ? 4 : 2,
        requiredMachinery: ['Utility Crew Service Truck', 'Road Grader'],
        estimatedCostUsd: newReport.severity === 'critical' ? 22000 : 9500,
        status: newReport.severity === 'critical' ? 'urgent_dispatch' : 'queued',
        locationName: newReport.locationName,
        coordinates: {
          x: newReport.coordinates?.x || 40,
          y: newReport.coordinates?.y || 40,
          lat: newReport.coordinates?.lat || 44.18,
          lng: newReport.coordinates?.lng || -116.42,
        },
        rationale: newReport.description,
      };
      setPriorities((prev) => [...prev, newPrio]);
    }
  };

  // If in Lite App mode, render standalone lightweight reporter app
  if (appMode === 'lite') {
    return (
      <LiteReportApp
        onBackToFullApp={() => setAppMode('full')}
        onReportCreated={handleReportCreatedFromLite}
      />
    );
  }

  // Handle report submission
  const handleAddReport = (newReportData: Omit<IssueReport, 'id' | 'dateReported' | 'upvotes' | 'verifiedCount'>) => {
    const newReport: IssueReport = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      upvotes: 1,
      verifiedCount: 1,
    };
    
    setReports((prev) => [newReport, ...prev]);

    // If critical or high severity, dynamically append to Priority Queue
    if (newReport.severity === 'critical' || newReport.severity === 'high') {
      const newPrio: PriorityRepair = {
        id: `prio-${Date.now()}`,
        reportId: newReport.id,
        rank: priorities.length + 1,
        assetName: newReport.title,
        district: newReport.districtName,
        degradationScore: newReport.severity === 'critical' ? 88 : 74,
        isolationRiskScore: newReport.emergencyAccessBlocked ? 90 : 70,
        urgencyScore: newReport.severity === 'critical' ? 91 : 75,
        estimatedCrewDays: newReport.severity === 'critical' ? 4 : 2,
        requiredMachinery: ['Utility Crew Service Truck', 'Road Grader'],
        estimatedCostUsd: newReport.severity === 'critical' ? 22000 : 9500,
        status: newReport.severity === 'critical' ? 'urgent_dispatch' : 'queued',
        locationName: newReport.locationName,
        coordinates: {
          x: newReport.coordinates.x,
          y: newReport.coordinates.y,
          lat: newReport.coordinates.lat,
          lng: newReport.coordinates.lng,
        },
        rationale: newReport.description,
      };
      setPriorities((prev) => [...prev, newPrio]);
    }
  };

  // Upvote / Validate a report
  const handleUpvoteReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    if (selectedItem?.id === reportId) {
      setSelectedItem((prev: any) => ({ ...prev, upvotes: prev.upvotes + 1 }));
    }
  };

  // Update repair priority status
  const handleUpdateRepairStatus = (repairId: string, newStatus: PriorityRepair['status']) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === repairId ? { ...p, status: newStatus } : p))
    );
  };

  // Drop pin from map
  const handleDropPin = (coords: { x: number; y: number; lat: number; lng: number }) => {
    setDroppedCoords(coords);
    setIsReportModalOpen(true);
  };

  // Select cluster report links
  const handleSelectClusterReports = (reportIds: string[]) => {
    const firstMatch = reports.find((r) => reportIds.includes(r.id));
    if (firstMatch) {
      setSelectedItem(firstMatch);
    }
  };

  // Update clusters from AI synthesis
  const handleUpdateClusters = (newClusters: AIPatternCluster[]) => {
    setClusters(newClusters);
  };

  const criticalIssuesCount = reports.filter((r) => r.severity === 'critical').length;
  const emergencyBlocksCount = reports.filter((r) => r.emergencyAccessBlocked).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased">
      {/* Universal Clean Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          setDroppedCoords(null);
          setIsReportModalOpen(true);
        }}
        onOpenCouncilPlan={() => setIsCouncilPlanOpen(true)}
        onOpenPipelineModal={() => setIsPipelineModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenLiteApp={() => setAppMode('lite')}
        isLiteMode={isLiteMode}
        setIsLiteMode={setIsLiteMode}
        isEasyMode={isEasyMode}
        setIsEasyMode={setIsEasyMode}
        criticalCount={criticalIssuesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* TAB 1: Unified Easy Overview & Map Dashboard */}
        {activeTab === 'control-panel' && (
          <ControlPanelDashboard
            reports={reports}
            priorities={priorities}
            strategicSites={strategicSites}
            weatherData={weatherData}
            onSelectReport={(r) => setSelectedItem(r)}
            onSelectRepair={(p) => setSelectedItem(p)}
            onNavigateToMap={() => setActiveTab('map')}
            onOpenReportModal={() => {
              setDroppedCoords(null);
              setIsReportModalOpen(true);
            }}
            onOpenLiteApp={() => setAppMode('lite')}
            onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
            onOpenCouncilPlan={() => setIsCouncilPlanOpen(true)}
            onOpenPipelineModal={() => setIsPipelineModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onUpvoteReport={handleUpvoteReport}
            isEasyMode={isEasyMode}
          />
        )}

        {/* TAB 2: Strategic GIS Map Standalone View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Civic Metric Ribbon */}
            <section aria-label="District Civic Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
                <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block font-semibold">
                  Emergency Blockades
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono tabular-nums">
                    {emergencyBlocksCount} Corridors
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block truncate">
                  School & ambulance cutoff active
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                  Emergency Hospital Reach
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                    -36 min
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Mill Creek</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block truncate">
                  Golden-hour coverage increases to 88%
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
                <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block font-semibold">
                  Technician Response Siting
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-sky-400 font-mono tabular-nums">
                    42 min
                  </span>
                  <span className="text-xs text-stone-400 font-mono">vs 3.5 hrs</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block truncate">
                  Pine Crossroads equipment staging
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block font-semibold">
                  AI Pattern Clusters
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono tabular-nums">
                    {clusters.length} Hotspots
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block truncate">
                  Coordinated culvert & bridge failures
                </span>
              </div>

              {/* Weather Degradation Metric Card */}
              <div 
                onClick={() => setIsWeatherModalOpen(true)}
                className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-sm cursor-pointer hover:border-cyan-500/50 transition-colors group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                    Weather Degradation
                  </span>
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono tabular-nums">
                    {weatherData ? `${weatherData.erosionMultiplier}x Rate` : '2.4x Rate'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Erosion</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block truncate">
                  {weatherData 
                    ? `${weatherData.precipitation24hMm}mm 24h · ${weatherData.soilSaturationPct}% Saturation` 
                    : '41.2mm rain · 86% Saturation'}
                </span>
              </div>
            </section>

            {/* Map Component */}
            <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-900">
              <InteractiveMap
                reports={reports}
                priorities={priorities}
                strategicSites={strategicSites}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onDropPin={handleDropPin}
                onUpvoteReport={handleUpvoteReport}
                isLiteMode={isLiteMode}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Issue Reports List */}
        {activeTab === 'reports' && (
          <IssueReportsList
            reports={reports}
            onSelectReport={(r) => setSelectedItem(r)}
            onNavigateToMap={() => setActiveTab('control-panel')}
            onUpvote={handleUpvoteReport}
            onOpenReportModal={() => {
              setDroppedCoords(null);
              setIsReportModalOpen(true);
            }}
            isLiteMode={isLiteMode}
          />
        )}

        {/* TAB 4: AI Pattern Insights & Strategic Siting */}
        {activeTab === 'ai-patterns' && (
          <PatternInsightsPanel
            clusters={clusters}
            reports={reports}
            onSelectClusterReports={handleSelectClusterReports}
            onNavigateToMap={() => setActiveTab('control-panel')}
            onUpdateClusters={handleUpdateClusters}
          />
        )}

        {/* TAB 5: Priority Repair Queue */}
        {activeTab === 'priority-queue' && (
          <PriorityRepairQueue
            priorities={priorities}
            onSelectRepair={(p) => setSelectedItem(p)}
            onNavigateToMap={() => setActiveTab('control-panel')}
            onUpdateStatus={handleUpdateRepairStatus}
          />
        )}

        {/* TAB 6: Strategic Facilities & Clinics */}
        {activeTab === 'strategic-sites' && (
          <StrategicPlacementPanel
            sites={strategicSites}
            onSelectSite={(s) => setSelectedItem(s)}
            onNavigateToMap={() => setActiveTab('control-panel')}
          />
        )}
      </main>

      {/* Clean Footer with Offline Sync Status and Lite App Link */}
      <footer className="border-t border-stone-800 bg-stone-950 py-6 mt-12 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-stone-200">RuralGrid</span>
            <span aria-hidden="true">·</span>
            <span>Civic Infrastructure & Spatial Resource Allocator</span>
            <span aria-hidden="true">·</span>
            <span>Precincts 4 & 7</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-stone-400">
            {/* Real-Time Visual Offline Sync Status Indicator */}
            <OfflineSyncIndicator onForceSyncComplete={fetchServerReports} />
            <span aria-hidden="true">·</span>
            {/* Standalone Lite Reporter App Link */}
            <button
              onClick={() => setAppMode('lite')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open Lite Field Reporter</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCouncilPlanOpen(true)}
              className="text-stone-300 hover:text-white transition-colors"
            >
              Export Action Plan
            </button>
          </div>
        </div>
      </footer>

      {/* Citizen Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setDroppedCoords(null);
        }}
        onSubmitReport={handleAddReport}
        initialCoords={droppedCoords}
      />

      {/* Council Action Plan Modal */}
      <CouncilActionPlanModal
        isOpen={isCouncilPlanOpen}
        onClose={() => setIsCouncilPlanOpen(false)}
        priorities={priorities}
        strategicSites={strategicSites}
        clusters={clusters}
      />

      {/* 8-Stage Spatial Data & Candidate Site Optimization Pipeline Modal */}
      <SpatialPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        reports={reports}
      />

      {/* Cybersecurity & Privacy Protection Shield Modal */}
      <CybersecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* CSV Data Ingestion & Hackathon Scenario Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadDataset={(newReports) => {
          setReports(newReports);
        }}
      />

      {/* Weather Impact Telemetry Modal */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-100 my-8">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-inner">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                    Real-Time Environmental Telemetry
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Weather Impact on Infrastructure Degradation
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsWeatherModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Headline Banner */}
            <div className="mt-4 p-3.5 bg-cyan-950/40 border border-cyan-900/50 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-cyan-200">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">{weatherData?.alertHeadline || 'High River Catchment Surge Warning'}</span>
              </div>
              <button
                onClick={handleRefreshWeather}
                disabled={isRefreshingWeather}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
                <span>{isRefreshingWeather ? 'Polling...' : 'Refresh API'}</span>
              </button>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 font-mono text-xs">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Erosion Velocity</span>
                <span className="text-cyan-300 font-bold text-lg">{weatherData?.erosionMultiplier || 2.4}x</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Degradation pace</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">24h Rainfall</span>
                <span className="text-white font-bold text-lg">{weatherData?.precipitation24hMm || 41.2}mm</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Catchment rain gauge</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Soil Saturation</span>
                <span className="text-amber-400 font-bold text-lg">{weatherData?.soilSaturationPct || 86}%</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Sub-base liquefaction</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Temperature</span>
                <span className="text-stone-200 font-bold text-lg">{weatherData?.temperatureC || 7.8}°C</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">{weatherData?.windSpeedKph || 36} km/h wind</span>
              </div>
            </div>

            {/* Soil Saturation Progress Bar */}
            <div className="mt-4 p-4 bg-stone-950 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1.5">
                <span>Soil Absorption Limit (Sub-Base Failure Threshold)</span>
                <span className="text-amber-400 font-bold">{weatherData?.soilSaturationPct || 86}% Critical</span>
              </div>
              <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${weatherData?.soilSaturationPct || 86}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-2.5 leading-relaxed">
                When soil saturation exceeds 80%, rural unpaved gravel arterials lose internal friction, leading to culvert blowouts and foundation scouring within 6 to 12 hours of continuous rainfall.
              </p>
            </div>

            {/* District-by-District Weather Risk Breakdown */}
            <div className="mt-4">
              <h3 className="text-xs font-bold text-stone-200 mb-2 font-mono uppercase tracking-wider">
                Precinct Basin Breakdown
              </h3>
              <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900/60 font-mono text-[10px] text-stone-400 uppercase border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3 text-center">Rain (24h)</th>
                      <th className="py-2.5 px-3 text-center">Saturation</th>
                      <th className="py-2.5 px-3">Washout Hazard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 font-mono text-[11px]">
                    {(weatherData?.districtBreakdown || []).map((db, idx) => (
                      <tr key={idx} className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-3 font-semibold text-stone-100 font-sans">
                          {db.district}
                          <div className="text-[10px] text-stone-400 font-normal font-sans">
                            {db.primaryVulnerability}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-cyan-300 font-bold">{db.precipitationMm}mm</td>
                        <td className="py-2.5 px-3 text-center text-amber-300 font-bold">{db.saturationPct}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            db.washoutRisk === 'Critical' ? 'bg-red-950/80 text-red-300 border border-red-800/60 font-bold' :
                            db.washoutRisk === 'High' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold' :
                            'bg-stone-800 text-stone-300'
                          }`}>
                            {db.washoutRisk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Telemetry Stamp */}
            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>Telemetry Timestamp: {weatherData?.timestamp ? new Date(weatherData.timestamp).toLocaleTimeString() : 'Live'}</span>
              <span>Sensor Feed: County Hydrological Network</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
