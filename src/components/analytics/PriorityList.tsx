import React from 'react';
import { NeedZone } from '../../lib/types';
import { PRIORITY_META, CATEGORY_META } from '../../lib/constants';
import { ChevronRight } from 'lucide-react';

interface PriorityListProps {
  needZones: NeedZone[];
  selectedZone: NeedZone | null;
  onSelectZone: (zone: NeedZone) => void;
}

export const PriorityList: React.FC<PriorityListProps> = ({
  needZones,
  selectedZone,
  onSelectZone,
}) => {
  const topZones = needZones.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Top Priority Review Zones
        </h4>
        <span className="text-xs text-slate-400 font-mono">Ranked 1–{topZones.length}</span>
      </div>

      {topZones.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          No zones meet priority criteria
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {topZones.map((zone, index) => {
            const isSelected = selectedZone?.id === zone.id;
            const priorityMeta = PRIORITY_META[zone.priorityLabel];
            const categoryMeta = CATEGORY_META[zone.category];

            return (
              <div
                key={zone.id}
                onClick={() => onSelectZone(zone)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{zone.townName} Zone</div>
                    <div className="text-[11px] text-slate-500">{categoryMeta?.label} • {zone.signalCount} signals</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityMeta.bgClass} ${priorityMeta.textClass} border ${priorityMeta.borderClass}`}
                    >
                      {zone.priorityScore}/100
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
