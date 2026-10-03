import React from 'react';
import { NeedZone } from '../../lib/types';
import { predictNeedPatterns } from '../../lib/aiPredictor';
import { Sparkles, TrendingUp, AlertCircle, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface AIPredictorCardProps {
  needZones: NeedZone[];
}

export const AIPredictorCard: React.FC<AIPredictorCardProps> = ({ needZones }) => {
  const aiResult = predictNeedPatterns(needZones);

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-lg relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              AI Emerging Risk Pattern Forecast
            </h4>
            <p className="text-[11px] text-slate-400">30-Day Predictive Spatial Pattern Analysis</p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-indigo-400" />
          <span>+{aiResult.predictedGrowthPercentage}% Risk Spike</span>
        </span>
      </div>

      <div className="space-y-3">
        {/* Forecast Narrative */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          "{aiResult.forecastText}"
        </p>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-900/60">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400" /> Primary Risk Factor
            </div>
            <div className="text-xs font-bold text-slate-200">{aiResult.primaryRiskFactor}</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-900/60">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Proactive Intervention
            </div>
            <div className="text-xs font-bold text-emerald-300">{aiResult.recommendedAction}</div>
          </div>
        </div>

        {/* Emerging zones count */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>
            Identified <strong className="text-indigo-300">{aiResult.emergingHighRiskZones.length}</strong> candidate zones with high 30-day escalation potential.
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-[10px]">
            <ShieldAlert className="w-3 h-3 text-indigo-400" /> Pattern Model v1.2
          </span>
        </div>
      </div>
    </div>
  );
};
