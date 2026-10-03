import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  ListOrdered, 
  Building2, 
  FileSpreadsheet, 
  Wifi, 
  WifiOff, 
  Plus,
  Smartphone,
  Eye,
  Layers,
  HeartPulse,
  ShieldAlert,
  Upload
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'control-panel' | 'map' | 'reports' | 'ai-patterns' | 'priority-queue' | 'strategic-sites';
  setActiveTab: (tab: 'control-panel' | 'map' | 'reports' | 'ai-patterns' | 'priority-queue' | 'strategic-sites') => void;
  onOpenReportModal: () => void;
  onOpenCouncilPlan: () => void;
  onOpenSecurityModal?: () => void;
  onOpenUploadModal?: () => void;
  onOpenLiteApp?: () => void;
  isLiteMode: boolean;
  setIsLiteMode: (v: boolean) => void;
  isEasyMode?: boolean;
  setIsEasyMode?: (v: boolean) => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenCouncilPlan,
  onOpenSecurityModal,
  onOpenUploadModal,
  onOpenLiteApp,
  isLiteMode,
  setIsLiteMode,
  isEasyMode = false,
  setIsEasyMode,
  criticalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark & Precinct Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('control-panel')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
              RG
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <span>RuralGrid</span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-stone-800 text-stone-300 border border-stone-700">
                  Rural Ops
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Clear 5 Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium text-stone-300">
          <button
            onClick={() => setActiveTab('control-panel')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'control-panel' 
                ? 'bg-stone-800/90 text-emerald-400 font-semibold shadow-sm' 
                : 'hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Overview & Map</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'reports' 
                ? 'bg-stone-800/90 text-emerald-400 font-semibold shadow-sm' 
                : 'hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Community Reports</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai-patterns')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'ai-patterns' 
                ? 'bg-stone-800/90 text-emerald-400 font-semibold shadow-sm' 
                : 'hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Siting & Patterns</span>
          </button>

          <button
            onClick={() => setActiveTab('priority-queue')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'priority-queue' 
                ? 'bg-stone-800/90 text-emerald-400 font-semibold shadow-sm' 
                : 'hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Priority Repairs</span>
          </button>

          <button
            onClick={() => setActiveTab('strategic-sites')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'strategic-sites' 
                ? 'bg-stone-800/90 text-emerald-400 font-semibold shadow-sm' 
                : 'hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Facilities & Clinics</span>
          </button>
        </nav>

        {/* Action Controls & Lite Mode */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Easy Mode Switcher for Residents */}
          {setIsEasyMode && (
            <button
              onClick={() => setIsEasyMode(!isEasyMode)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isEasyMode
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/70 shadow-sm'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
              title={isEasyMode ? "Switch to Detailed Planner Mode" : "Switch to Simplified Community Mode"}
            >
              <span>{isEasyMode ? '🌱 Easy Mode' : '📊 Planner Mode'}</span>
            </button>
          )}

          {/* Standalone Lite Mobile Reporter App button */}
          {onOpenLiteApp && (
            <button
              onClick={onOpenLiteApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-800/80 rounded-lg transition-all"
              title="Open ultra-lightweight mobile reporter (ideal for slow 2G/3G connections)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Lite Mobile App</span>
              <span className="md:hidden">Lite App</span>
            </button>
          )}

          {/* Cybersecurity Audit & Privacy Shield Button */}
          {onOpenSecurityModal && (
            <button
              onClick={onOpenSecurityModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg transition-all"
              title="View Cybersecurity, PII Redaction, & Privacy Shield Telemetry"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Cybersecurity Shield</span>
            </button>
          )}

          {/* CSV Data Upload & Scenario Switcher Button */}
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 rounded-lg transition-all"
              title="Upload CSV dataset or select hackathon demo scenario"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Upload CSV / Scenarios</span>
            </button>
          )}

          {/* Action Plan Export Button */}
          <button
            onClick={onOpenCouncilPlan}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
            <span>Council Plan</span>
          </button>

          {/* Primary Action Button: Report Issue */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Report Hazard</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center px-3 py-2 border-t border-stone-800/80 bg-stone-950 overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveTab('control-panel')}
          className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'control-panel' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          Overview & Map
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'reports' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          Reports ({criticalCount})
        </button>
        <button
          onClick={() => setActiveTab('ai-patterns')}
          className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'ai-patterns' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          AI Siting & Patterns
        </button>
        <button
          onClick={() => setActiveTab('priority-queue')}
          className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'priority-queue' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          Priority Repairs
        </button>
        <button
          onClick={() => setActiveTab('strategic-sites')}
          className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'strategic-sites' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          Facilities
        </button>
      </div>
    </header>
  );
};
