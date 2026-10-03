import React from 'react';
import { MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateToDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToDashboard }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">NeedMap</span>
            <span className="text-xs text-slate-500">| Hackathon MVP</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-xs">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Framework</a>
            <button onClick={onNavigateToDashboard} className="text-blue-400 hover:text-blue-300 transition-colors">
              Launch Dashboard →
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NeedMap. Built for community-minded decision making.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
};
