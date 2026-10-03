import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Hospital, 
  Wrench, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2,
  Sliders,
  Compass,
  ArrowRight
} from 'lucide-react';
import { AIPatternCluster, IssueReport } from '../types';
import { requestAIPatternAnalysis, AnalysisResult } from '../services/geminiService';

interface PatternInsightsPanelProps {
  clusters: AIPatternCluster[];
  reports: IssueReport[];
  onSelectClusterReports: (reportIds: string[]) => void;
  onNavigateToMap: () => void;
  onUpdateClusters: (newClusters: AIPatternCluster[], summary?: string) => void;
}

export const PatternInsightsPanel: React.FC<PatternInsightsPanelProps> = ({
  clusters,
  reports,
  onSelectClusterReports,
  onNavigateToMap,
  onUpdateClusters,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('monsoon_flood');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'clusters' | 'placement' | 'scenarios'>('clusters');

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await requestAIPatternAnalysis(reports, selectedScenario);
      setAnalysisResult(result);
      if (result.clusters && result.clusters.length > 0) {
        onUpdateClusters(result.clusters, result.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero AI Synthesis Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Gemini 3.8 Spatial Pattern & Strategic Synthesizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Rural Infrastructure Pattern Detection
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              Synthesizes disparate citizen reports, GIS river catchments, and road degradation vectors to identify isolated community clusters and calculate optimal locations for new emergency clinics and technician depots.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-stone-950 border border-stone-700 text-xs text-stone-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="monsoon_flood">Scenario: Monsoon & Flash Flood Runoff</option>
              <option value="harvest_transit">Scenario: Autumn Heavy Harvest Transit</option>
              <option value="winter_freeze">Scenario: Sub-Zero Freeze & Snow Cutoff</option>
              <option value="healthcare_equity">Scenario: 30-Min Golden Hour Healthcare Equity</option>
            </select>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-stone-950 font-semibold text-xs rounded-md shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Running Synthesis...' : 'Re-Run AI Engine'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Summary Strip */}
        <div className="mt-4 pt-4 border-t border-stone-800 text-xs text-stone-300 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] leading-relaxed">
            <span className="text-emerald-400 font-semibold">Active Synthesis Assessment: </span>
            {analysisResult?.summary || 
              "High concentration of sub-base erosion along East Ridge Pass and Blackwood Crossing creates an impending single point of failure, threatening 1,850 farming households with complete school and medical isolation."}
          </p>
        </div>
      </div>

      {/* Internal Navigation Tabs (Interactive Segmented Buttons) */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'clusters'
              ? 'bg-stone-800 text-emerald-400 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Detected Risk Clusters ({clusters.length})
        </button>

        <button
          onClick={() => setActiveTab('placement')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'placement'
              ? 'bg-stone-800 text-emerald-400 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          AI Strategic Placements (Hospitals & Depots)
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'scenarios'
              ? 'bg-stone-800 text-emerald-400 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Simulation Modeling Matrix
        </button>
      </div>

      {/* Tab 1: Risk Clusters */}
      {activeTab === 'clusters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => {
            const isCritical = cluster.severity === 'critical';
            return (
              <div
                key={cluster.id}
                className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-stone-700 transition-colors"
              >
                <div>
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
                    <span className={isCritical ? 'text-red-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {cluster.severity.toUpperCase()} RISK
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{cluster.confidence}% AI Confidence</span>
                    <span aria-hidden="true">·</span>
                    <span>{cluster.districtName}</span>
                  </div>

                  <h3 className="text-base font-bold text-stone-100 mt-2">
                    {cluster.title}
                  </h3>

                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                    {cluster.description}
                  </p>

                  <div className="mt-3 p-3 bg-stone-950/70 border border-stone-800/80 rounded-lg">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                      Action Recommendation
                    </span>
                    <p className="text-[11px] text-stone-200 leading-relaxed">
                      {cluster.actionRecommendation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    <span>{cluster.affectedPopulation.toLocaleString()} residents affected</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectClusterReports(cluster.relatedReportIds);
                      onNavigateToMap();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>View on Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Strategic Hospital & Technician Allocations */}
      {activeTab === 'placement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hospital Placement Recommendation */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Hospital className="w-4 h-4" />
                  <span>Strategic Healthcare Allocation</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Proposed Mill Creek Rural Emergency Clinic
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                Priority: 96/100
              </span>
            </div>

            <p className="text-xs text-stone-300 mt-3 leading-relaxed">
              Identified by computing geographic Voronoi polygons across current ambulance routes and dirt road impassability indices. Mill Creek Junction represents the optimal multi-valley convergence point.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800 font-mono text-xs">
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Travel Reduction</span>
                <span className="text-emerald-400 font-bold text-sm">-36 minutes</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Coverage Catchment</span>
                <span className="text-stone-100 font-bold text-sm">5,800 people</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-500 uppercase block">Golden Hour Reach</span>
                <span className="text-stone-100 font-bold text-sm">88% of hamlets</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-stone-300">
              <span className="text-[11px] font-mono text-stone-400 block mb-1.5">Required Facilities & Equipment:</span>
              <ul className="space-y-1 list-disc list-inside text-stone-300 text-[11px]">
                <li>Level IV Stabilization Suite (4 Acute Beds + Tele-ICU hookup)</li>
                <li>4WD All-Weather Emergency Ambulance Depot</li>
                <li>Solar Microgrid 40kW with 72-Hour Iron-Phosphate Battery Storage</li>
                <li>Emergency Helipad Landing Clearway</li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">Estimated CapEx: $1,450,000 USD</span>
              <button
                onClick={onNavigateToMap}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded transition-colors"
              >
                Inspect Map Coordinate
              </button>
            </div>
          </div>

          {/* Technician & Machinery Depot Placement */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <Wrench className="w-4 h-4" />
                  <span>Strategic Equipment Dispatch Outpost</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Pine Crossroads Heavy Equipment Yard
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
                Priority: 92/100
              </span>
            </div>

            <p className="text-xs text-stone-300 mt-3 leading-relaxed">
              Currently, road graders and utility boom trucks must travel 78 km from the county seat over washed-out passes, averaging 3.5 hours response time. Pre-staging equipment at Pine Crossroads cuts dispatch to 42 minutes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800 font-mono text-xs">
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Dispatch Delta</span>
                <span className="text-sky-400 font-bold text-sm">-168 minutes</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase block">Serviced Roads</span>
                <span className="text-stone-100 font-bold text-sm">340 km network</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-500 uppercase block">Washout Access</span>
                <span className="text-stone-100 font-bold text-sm">&lt;30 min to 80%</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-stone-300">
              <span className="text-[11px] font-mono text-stone-400 block mb-1.5">Recommended Heavy Inventory:</span>
              <ul className="space-y-1 list-disc list-inside text-stone-300 text-[11px]">
                <li>2x All-Wheel Drive Road Motor Graders (140M class)</li>
                <li>Modular Bailey Bridge 60ft Temporary Steel Span</li>
                <li>Stockpile of 60in & 72in Corrugated Armored Culvert Pipes</li>
                <li>High-Output Mobile Line-Genset (75 kVA) for Borehole Emergencies</li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">Estimated CapEx: $420,000 USD</span>
              <button
                onClick={onNavigateToMap}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-stone-950 text-xs font-semibold rounded transition-colors"
              >
                Inspect Map Coordinate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Simulation Matrix */}
      {activeTab === 'scenarios' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2">
            Stress Test Simulations & Failure Modes
          </h3>
          <p className="text-xs text-stone-300 mb-6 max-w-2xl leading-relaxed">
            The AI engine tests infrastructure degradation against 4 recurring environmental shock events common to rural mountain basins and agricultural valleys.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="font-semibold text-stone-200">100-Year Precipitation Runoff</span>
                <span className="text-red-400 font-bold">Severity: Critical</span>
              </div>
              <p className="text-xs text-stone-300 mt-2">
                Simulates 4.2 inches of rain over 36 hours. Triggers failure in 4 unreinforced culverts, cuts off Mill Creek primary school bus route, and elevates Blackwood Bridge scouring risk to 94%.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="font-semibold text-stone-200">Heavy Grain Harvest Transit</span>
                <span className="text-amber-400 font-bold">Severity: High</span>
              </div>
              <p className="text-xs text-stone-300 mt-2">
                Simulates 220 overloaded tandem grain trailers per day over gravel arterials. Predicts 42% road rut depth acceleration and surface washboarding along South Canyon road within 14 days.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="font-semibold text-stone-200">Sub-Zero Mountain Pass Inversion</span>
                <span className="text-sky-400 font-bold">Severity: High</span>
              </div>
              <p className="text-xs text-stone-300 mt-2">
                Isolates Highland Ridge for 18 continuous days. Demonstrates why a pre-positioned mobile health post is necessary to prevent cold-induced medical transfer emergencies.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="font-semibold text-stone-200">Wildland Grid Fire Power Drop</span>
                <span className="text-yellow-400 font-bold">Severity: Critical</span>
              </div>
              <p className="text-xs text-stone-300 mt-2">
                Single-phase line failure halts 6 community solar pumps simultaneously, leaving 520 rural cattle and farm families dependent on manual hauling within 18 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
