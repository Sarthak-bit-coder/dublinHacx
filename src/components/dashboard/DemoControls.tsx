import React from 'react';
import { Play, RotateCcw, Activity, Droplets, Truck } from 'lucide-react';

interface DemoControlsProps {
  currentScenario: 'healthcare' | 'water' | 'transit';
  onSelectScenario: (scenario: 'healthcare' | 'water' | 'transit') => void;
  onResetData: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  currentScenario,
  onSelectScenario,
  onResetData,
}) => {
  return (
    <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Play className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-xs tracking-tight text-white block">Demo Scenario Switcher</span>
          <span className="text-[11px] text-slate-400">Select synthetic story for Redwood Valley County</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectScenario('healthcare')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentScenario === 'healthcare'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Healthcare Gap</span>
        </button>

        <button
          onClick={() => onSelectScenario('water')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentScenario === 'water'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Water & Sanitation</span>
        </button>

        <button
          onClick={() => onSelectScenario('transit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentScenario === 'transit'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Transit & Emergency</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

        <button
          onClick={onResetData}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Reset to default synthetic dataset"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Scenario</span>
        </button>
      </div>
    </div>
  );
};
