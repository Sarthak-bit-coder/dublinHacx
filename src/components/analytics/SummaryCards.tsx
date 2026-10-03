import React from 'react';
import { NeedZone } from '../../lib/types';
import { CATEGORY_META } from '../../lib/constants';
import { Layers, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  needZones: NeedZone[];
  totalSignalCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ needZones, totalSignalCount }) => {
  const highPriorityCount = needZones.filter((z) => z.priorityLabel === 'High-priority review').length;

  const categoryCounts: Record<string, number> = {};
  needZones.forEach((z) => {
    categoryCounts[z.category] = (categoryCounts[z.category] || 0) + z.signalCount;
  });

  const topCategoryKey = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  )[0] || 'healthcare';

  const topCategoryMeta = CATEGORY_META[topCategoryKey as keyof typeof CATEGORY_META] || CATEGORY_META.healthcare;

  const fastestGrowingZone = needZones.find((z) => z.trendDirection === 'increasing') || needZones[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Need Zones */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identified Zones</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{needZones.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">From {totalSignalCount} signals</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* High Priority Review */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority</div>
          <div className="text-2xl font-black text-red-600 mt-1">{highPriorityCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Require local review</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Primary Concern Category */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Category</div>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]">
            {topCategoryMeta.label}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {categoryCounts[topCategoryKey] || 0} signals
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Fastest Growing Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fastest Growing</div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {fastestGrowingZone?.townName || 'Redwood Valley'}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
            {fastestGrowingZone?.recent30DayCount || 0} signals in 30 days
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
