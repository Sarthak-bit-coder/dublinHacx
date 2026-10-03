import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-5 left-5 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-3 max-w-xs text-xs">
      <div
        className="flex items-center justify-between gap-4 font-bold text-slate-900 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Need Zone Legend</span>
        </div>
        <button className="text-slate-500 hover:text-slate-800">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Priority Levels (0–100)
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-semibold text-slate-900">High-priority review</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">65–100</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Review</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">35–64</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Monitor</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">0–34</span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-100 mb-1">
            Map Indicators
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shrink-0" />
            <span>Listed Service Facilities</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-3.5 h-3.5 border-2 border-slate-800 border-dashed rounded-sm shrink-0" />
            <span>H3 Resolution 7 Hex Grid (~5 km²)</span>
          </div>
        </div>
      )}
    </div>
  );
};
