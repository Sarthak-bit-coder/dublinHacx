import React from 'react';
import { NeedZone } from '../../lib/types';
import { generateNarrativeSummary } from '../../lib/narrativeGenerator';
import { FileText, Sparkles } from 'lucide-react';

interface NarrativeSummaryProps {
  needZones: NeedZone[];
}

export const NarrativeSummary: React.FC<NarrativeSummaryProps> = ({ needZones }) => {
  const narrative = generateNarrativeSummary(needZones);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
      <div className="flex items-center gap-2 mb-3 text-blue-400">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Automated Intelligence Narrative
        </h4>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full ml-auto">
          Rule-Based Synthesis
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        "{narrative}"
      </p>

      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Generates human-readable summary from active hex zones and trend metrics.</span>
        </div>
        <span className="text-slate-500 font-mono">Updated Live</span>
      </div>
    </div>
  );
};
