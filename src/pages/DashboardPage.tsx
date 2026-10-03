import React, { useState, useMemo } from 'react';
import { MapPin, ArrowLeft, Upload, ShieldCheck, BarChart2, PlusCircle, Zap } from 'lucide-react';
import { Report, ServiceFacility, NeedZone, FilterOptions } from '../lib/types';
import { generateSyntheticReports, INITIAL_FACILITIES } from '../data/redwoodCountyData';
import { aggregateReportsToNeedZones } from '../lib/aggregation';
import { evaluateAndPromoteReportsToMap } from '../lib/aiMapPromoter';
import { MapView } from '../components/map/MapView';
import { FilterPanel } from '../components/dashboard/FilterPanel';
import { ZoneDetailsPanel } from '../components/dashboard/ZoneDetailsPanel';
import { DemoControls } from '../components/dashboard/DemoControls';
import { SummaryCards } from '../components/analytics/SummaryCards';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { TrendChart } from '../components/analytics/TrendChart';
import { PriorityList } from '../components/analytics/PriorityList';
import { NarrativeSummary } from '../components/analytics/NarrativeSummary';
import { AIPredictorCard } from '../components/analytics/AIPredictorCard';
import { AIMapPromotionBanner } from '../components/analytics/AIMapPromotionBanner';
import { UploadModal } from '../components/upload/UploadModal';
import { ReportModal } from '../components/reporting/ReportModal';
import { RuralLowDataMode } from '../components/reporting/RuralLowDataMode';

interface DashboardPageProps {
  onNavigateToLanding: () => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  categories: ['healthcare', 'water_sanitation', 'transportation_emergency'],
  severities: ['low', 'medium', 'high'],
  sourceTypes: ['public_service_request', 'community_survey', 'approved_incident_summary', 'demo'],
  dateRangeDays: 180,
  minSignalCount: 2,
  showFacilities: true,
  showReportClusters: true,
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToLanding }) => {
  const [scenario, setScenario] = useState<'healthcare' | 'water' | 'transit'>('healthcare');
  const [reports, setReports] = useState<Report[]>(() => generateSyntheticReports('healthcare'));
  const [facilities] = useState<ServiceFacility[]>(INITIAL_FACILITIES);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [selectedZone, setSelectedZone] = useState<NeedZone | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');

  // Compute aggregated need zones whenever reports, facilities, or filters change
  const needZones = useMemo(() => {
    return aggregateReportsToNeedZones(reports, facilities, filters);
  }, [reports, facilities, filters]);

  const handleScenarioChange = (newScenario: 'healthcare' | 'water' | 'transit') => {
    setScenario(newScenario);
    setReports(generateSyntheticReports(newScenario));
    setSelectedZone(null);
  };

  const handleResetData = () => {
    setReports(generateSyntheticReports(scenario));
    setFilters(DEFAULT_FILTERS);
    setSelectedZone(null);
  };

  const handleImportCSVData = (newReports: Report[]) => {
    setReports((prev) => [...newReports, ...prev]);
    setSelectedZone(null);
  };

  const handleAddResidentReport = (newReport: Report) => {
    setReports((prev) => [newReport, ...prev]);
  };

  if (isLowDataMode) {
    return (
      <RuralLowDataMode
        needZones={needZones}
        onAddReport={handleAddResidentReport}
        onExitLowDataMode={() => setIsLowDataMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToLanding}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Landing</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">NeedMap Dashboard</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Redwood Valley
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Anonymized Signal & Service Access Spatial Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLowDataMode(true)}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Switch to ultra-lightweight low-bandwidth mode"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Low-Data Mode</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Scenario Controls & Summary Cards */}
        <DemoControls
          currentScenario={scenario}
          onSelectScenario={handleScenarioChange}
          onResetData={handleResetData}
        />

        <SummaryCards needZones={needZones} totalSignalCount={reports.length} />

        {/* View Switcher Tabs for Mobile */}
        <div className="flex lg:hidden items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('map')}
            aria-label="View Map View"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            aria-label="View Analytics View"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics & Insights</span>
          </button>
        </div>

        {/* Map Grid Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ${activeTab === 'analytics' ? 'hidden lg:grid' : ''}`}>
          {/* Left Filters Sidebar */}
          <div className="lg:col-span-3">
            <FilterPanel
              filters={filters}
              onChangeFilters={setFilters}
              onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              totalSignalCount={reports.length}
              activeZoneCount={needZones.length}
            />
          </div>

          {/* Main Leaflet Map View */}
          <div className="lg:col-span-6 h-[580px] w-full">
            <MapView
              needZones={needZones}
              facilities={facilities}
              reports={reports}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              showFacilities={filters.showFacilities}
              showReportClusters={filters.showReportClusters}
            />
          </div>

          {/* Right Zone Details Panel */}
          <div className="lg:col-span-3">
            <ZoneDetailsPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
          </div>
        </div>

        {/* Analytics Section */}
        <div className={`space-y-6 ${activeTab === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <span>Service Access Analytics & AI Intelligence</span>
            </h3>
            <span className="text-xs text-slate-500">Live filter synchronized</span>
          </div>

          {/* AI Store & Forward Map Auto-Promotion Engine Alert */}
          {(() => {
            const aiPromotion = evaluateAndPromoteReportsToMap(reports);
            return (
              <AIMapPromotionBanner
                logs={aiPromotion.logMessages}
                newlyPromotedCount={aiPromotion.newlyAddedZoneIds.length}
              />
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NarrativeSummary needZones={needZones} />
            <AIPredictorCard needZones={needZones} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryChart needZones={needZones} />
            <TrendChart reports={reports} />
            <PriorityList
              needZones={needZones}
              selectedZone={selectedZone}
              onSelectZone={(z) => {
                setSelectedZone(z);
                setActiveTab('map');
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </main>

      {/* CSV Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportData={handleImportCSVData}
      />

      {/* Resident Issue Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={handleAddResidentReport}
      />
    </div>
  );
};
