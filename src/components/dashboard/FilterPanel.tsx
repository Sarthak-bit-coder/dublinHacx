import React from 'react';
import { Filter, RotateCcw, Eye, Layers } from 'lucide-react';
import { FilterOptions, NeedCategory, SeverityLevel } from '../../lib/types';
import { CATEGORY_META } from '../../lib/constants';

interface FilterPanelProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  totalSignalCount: number;
  activeZoneCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalSignalCount,
  activeZoneCount,
}) => {
  const toggleCategory = (cat: NeedCategory) => {
    let updated: NeedCategory[];
    if (filters.categories.includes(cat)) {
      if (filters.categories.length === 1) return; // Keep at least one
      updated = filters.categories.filter((c) => c !== cat);
    } else {
      updated = [...filters.categories, cat];
    }
    onChangeFilters({ ...filters, categories: updated });
  };

  const toggleSeverity = (sev: SeverityLevel) => {
    let updated: SeverityLevel[];
    if (filters.severities.includes(sev)) {
      if (filters.severities.length === 1) return;
      updated = filters.severities.filter((s) => s !== sev);
    } else {
      updated = [...filters.severities, sev];
    }
    onChangeFilters({ ...filters, severities: updated });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Controls</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
          title="Reset to default filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Summary Count Pill */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Matching Signals:</span>{' '}
          <strong className="text-slate-900 font-bold text-sm">{totalSignalCount}</strong>
        </div>
        <div>
          <span className="text-slate-500">Need Zones:</span>{' '}
          <strong className="text-blue-600 font-bold text-sm">{activeZoneCount}</strong>
        </div>
      </div>

      {/* Category Multi-select */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Service Category
        </label>
        <div className="space-y-2">
          {(['healthcare', 'water_sanitation', 'transportation_emergency'] as NeedCategory[]).map((catKey) => {
            const isSelected = filters.categories.includes(catKey);
            const meta = CATEGORY_META[catKey];

            return (
              <button
                key={catKey}
                onClick={() => toggleCategory(catKey)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{meta.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Urgency / Severity Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as SeverityLevel[]).map((sev) => {
            const isSelected = filters.severities.includes(sev);
            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={`py-2 px-2.5 text-center text-xs rounded-xl font-medium border capitalize transition-all ${
                  isSelected
                    ? sev === 'high'
                      ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                      : sev === 'medium'
                      ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                      : 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Time Period
        </label>
        <select
          value={filters.dateRangeDays}
          onChange={(e) => onChangeFilters({ ...filters, dateRangeDays: Number(e.target.value) })}
          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value={30}>Past 30 Days</option>
          <option value={90}>Past 90 Days</option>
          <option value={180}>Past 6 Months (Default)</option>
          <option value={365}>Past 1 Year</option>
        </select>
      </div>

      {/* Min Signal Threshold Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Min Signals per Zone
          </label>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {filters.minSignalCount}+ signals
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          value={filters.minSignalCount}
          onChange={(e) => onChangeFilters({ ...filters, minSignalCount: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>1 (Low)</span>
          <span>8</span>
          <span>15 (Strict)</span>
        </div>
      </div>

      {/* Map Layer Toggles */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Map Layers
        </label>

        <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Show Service Facilities</span>
          </div>
          <input
            type="checkbox"
            checked={filters.showFacilities}
            onChange={(e) => onChangeFilters({ ...filters, showFacilities: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Show Hex Grid Boundaries</span>
          </div>
          <input
            type="checkbox"
            checked={filters.showReportClusters}
            onChange={(e) => onChangeFilters({ ...filters, showReportClusters: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
};
