import React from 'react';
import { MapPin, Shield, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onNavigateToDashboard: () => void;
  onOpenReportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToDashboard, onOpenReportModal }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">NeedMap</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 rounded-full">
                Hackathon MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Community Access & Need Zone Intelligence</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#privacy" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Privacy First
          </a>
          <a href="#scenarios" className="hover:text-blue-600 transition-colors">Demo Scenarios</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all active:scale-95"
            >
              <span>+ Report an Issue</span>
            </button>
          )}

          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:shadow-blue-600/20 active:scale-95"
          >
            <span>Explore the Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
