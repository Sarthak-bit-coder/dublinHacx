import React from 'react';
import { ArrowRight, ShieldCheck, Layers, BarChart3 } from 'lucide-react';

interface HeroProps {
  onNavigateToDashboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToDashboard }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pt-12 pb-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Turn community signals into actionable service-access insights</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            See where essential services may be{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
              falling short.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8">
            NeedMap aggregates anonymized community complaints, public service requests, and facility locations into transparent <strong className="text-slate-900 font-semibold">hexagonal need zones</strong> — empowering planners and nonprofits to focus evaluation where it matters most.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 active:scale-95"
            >
              <span>Explore Interactive Map</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-6 py-3.5 rounded-xl font-medium text-base transition-all shadow-xs"
            >
              <span>How NeedMap Works</span>
            </a>
          </div>

          {/* Key Feature Highlights Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-4 border-t border-slate-200/80">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Hex Grid Zones</h4>
                <p className="text-xs text-slate-500">Privacy-safe hexagonal spatial grouping</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Priority Scoring</h4>
                <p className="text-xs text-slate-500">Transparent 0–100 urgency matrix</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">PII Safety Check</h4>
                <p className="text-xs text-slate-500">Automatic client-side privacy guard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
