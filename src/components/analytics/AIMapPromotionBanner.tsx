import React from 'react';
import { Bot, MapPin, Sparkles, CheckCircle } from 'lucide-react';

interface AIMapPromotionBannerProps {
  logs: string[];
  newlyPromotedCount: number;
}

export const AIMapPromotionBanner: React.FC<AIMapPromotionBannerProps> = ({ logs, newlyPromotedCount }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 text-white p-4 rounded-2xl border border-teal-500/40 shadow-lg animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
              <span>AI Store-and-Forward Pattern Engine</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            </h4>
            <p className="text-[11px] text-slate-300">Auto-generating map zones from rural batch signal queues</p>
          </div>
        </div>

        {newlyPromotedCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>+{newlyPromotedCount} Need Zone(s) Auto-Added to Map</span>
          </span>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-teal-800/40">
        {logs.slice(0, 2).map((log, idx) => (
          <div key={idx} className="text-xs text-slate-200 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-teal-900/50">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
