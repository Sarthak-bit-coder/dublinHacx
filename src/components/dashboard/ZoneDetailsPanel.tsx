import React from 'react';
import { NeedZone } from '../../lib/types';
import { PRIORITY_META, CATEGORY_META } from '../../lib/constants';
import { AlertCircle, MapPin, TrendingUp, TrendingDown, Minus, CheckCircle, ShieldAlert, X } from 'lucide-react';

interface ZoneDetailsPanelProps {
  zone: NeedZone | null;
  onClose: () => void;
}

export const ZoneDetailsPanel: React.FC<ZoneDetailsPanelProps> = ({ zone, onClose }) => {
  if (!zone) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 shadow-xs flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">No Need Zone Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Click any colored hexagonal zone on the map to inspect priority scores, signal breakdown, nearest facilities, and recommended actions.
        </p>
      </div>
    );
  }

  const priorityMeta = PRIORITY_META[zone.priorityLabel];
  const categoryMeta = CATEGORY_META[zone.category];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col gap-5 relative animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        title="Close details"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityMeta.bgClass} ${priorityMeta.textClass} border ${priorityMeta.borderClass}`}>
            {zone.priorityLabel}
          </span>
          <span className="text-xs text-slate-500 capitalize">Confidence: <strong>{zone.confidenceLevel}</strong></span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {zone.townName ? `${zone.townName} Region` : 'Need Zone'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{categoryMeta.label}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Priority Score</div>
          <div className="text-2xl font-black text-slate-900" style={{ color: priorityMeta.hexColor }}>
            {zone.priorityScore}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Signals</div>
          <div className="text-2xl font-black text-slate-900">{zone.signalCount}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">High Urgency</div>
          <div className="text-2xl font-black text-red-600">{zone.highSeverityCount}</div>
        </div>
      </div>

      {/* Trend & Facility Quick Card */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-600 font-medium">30-Day Signal Trend:</span>
          <div className="flex items-center gap-1.5 font-bold">
            {zone.trendDirection === 'increasing' ? (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingUp className="w-4 h-4" /> Rising (+{zone.recent30DayCount} recent)
              </span>
            ) : zone.trendDirection === 'decreasing' ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingDown className="w-4 h-4" /> Decreasing
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-600">
                <Minus className="w-4 h-4" /> Stable
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
          <div className="flex items-center justify-between font-bold text-blue-900 mb-0.5">
            <span>Nearest Service Facility:</span>
            <span>~{zone.nearestFacilityDistanceKm} km</span>
          </div>
          <p className="text-slate-600">{zone.nearestFacilityName}</p>
        </div>
      </div>

      {/* Why Flagged Explanation */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          Why This Zone Was Flagged
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          {zone.explanation}
        </p>
      </div>

      {/* Sample Anonymized Signals */}
      {zone.sampleSummaries.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Sample Anonymized Summaries
          </h4>
          <ul className="space-y-1.5">
            {zone.sampleSummaries.map((summary, idx) => (
              <li key={idx} className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2">
                <span className="text-blue-500 font-bold shrink-0">•</span>
                <span>"{summary}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action Steps */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Recommended Next Steps
        </h4>
        <div className="space-y-1.5">
          {zone.recommendedActions.map((action, idx) => (
            <div key={idx} className="text-xs text-slate-700 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl font-medium">
              {action}
            </div>
          ))}
        </div>
      </div>

      {/* Analytical Limitation Disclaimer */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Important Limitation:</strong> This zone score is an analytical signal for evaluation, not conclusive proof of a service deficit. Always validate with local partners.
        </div>
      </div>
    </div>
  );
};
