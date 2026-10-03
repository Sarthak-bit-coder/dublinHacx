import React, { useState } from 'react';
import { StrategicSite } from '../types';
import { 
  Hospital, 
  Wrench, 
  Droplet, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink,
  Sliders,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface StrategicPlacementPanelProps {
  sites: StrategicSite[];
  onSelectSite: (site: StrategicSite) => void;
  onNavigateToMap: () => void;
}

export const StrategicPlacementPanel: React.FC<StrategicPlacementPanelProps> = ({
  sites,
  onSelectSite,
  onNavigateToMap,
}) => {
  const [budgetFilter, setBudgetFilter] = useState<number>(3000000);
  const [siteTypeFilter, setSiteTypeFilter] = useState<string>('all');

  const filtered = sites.filter((s) => {
    if (siteTypeFilter !== 'all' && s.type !== siteTypeFilter) return false;
    if (s.estimatedCapExUsd > budgetFilter) return false;
    return true;
  });

  const totalCapEx = sites.reduce((acc, curr) => acc + curr.estimatedCapExUsd, 0);
  const totalPopCovered = sites.reduce((acc, curr) => acc + curr.coveragePopulation, 0);

  const getSiteIcon = (type: StrategicSite['type']) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="w-5 h-5 text-emerald-400" />;
      case 'technician_depot':
        return <Wrench className="w-5 h-5 text-sky-400" />;
      case 'mobile_clinic_post':
        return <Hospital className="w-5 h-5 text-teal-400" />;
      case 'water_purification_hub':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Geospatial Voronoi Allocation Optimizer</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Strategic Facilities & Technician Placement
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            AI-driven spatial siting balances severe isolation equity with maximum population reach. Computes optimal coordinates for new rural clinics, equipment depots, and emergency staging.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div className="flex items-center gap-4 bg-stone-950 p-3 rounded-lg border border-stone-800 shrink-0 font-mono text-xs">
          <div>
            <span className="text-[10px] text-stone-500 block uppercase">Total Program CapEx</span>
            <span className="text-stone-100 font-bold text-sm">${(totalCapEx / 1000000).toFixed(2)}M</span>
          </div>
          <div className="w-px h-8 bg-stone-800" />
          <div>
            <span className="text-[10px] text-stone-500 block uppercase">Rural Citizens Reached</span>
            <span className="text-emerald-400 font-bold text-sm">{totalPopCovered.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter / Budget Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-mono text-[11px]">Facility Type:</span>
          {(['all', 'hospital', 'technician_depot', 'mobile_clinic_post', 'water_purification_hub'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSiteTypeFilter(type)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                siteTypeFilter === type
                  ? 'bg-stone-800 text-emerald-400 border border-stone-700 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {type === 'all' ? 'All Sites' :
               type === 'hospital' ? 'Emergency Hospitals' :
               type === 'technician_depot' ? 'Technician Depots' :
               type === 'mobile_clinic_post' ? 'Nurse Outposts' : 'Water Hubs'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-400 font-mono text-[11px]">Max Budget:</span>
          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(Number(e.target.value))}
            className="bg-stone-950 border border-stone-700 rounded-md px-2.5 py-1 text-stone-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value={500000}>$500,000 Cap</option>
            <option value={1500000}>$1,500,000 Cap</option>
            <option value={3000000}>$3,000,000 (Full Plan)</option>
          </select>
        </div>
      </div>

      {/* Recommended Sites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((site) => (
          <div
            key={site.id}
            className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-stone-700 transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 shrink-0">
                    {getSiteIcon(site.type)}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                      {site.categoryLabel}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {site.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1 font-mono">
                      <MapPin className="w-3 h-3 text-stone-500" />
                      <span>{site.district}</span>
                      <span aria-hidden="true">·</span>
                      <span>Lat: {site.coordinates.lat}, Lng: {site.coordinates.lng}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    {site.priorityScore}%
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    AI Siting Match
                  </span>
                </div>
              </div>

              {/* Justification */}
              <p className="text-xs text-stone-300 mt-3.5 leading-relaxed">
                {site.keyJustification}
              </p>

              {/* Quantitative Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-800/80 font-mono text-xs">
                <div className="bg-stone-950 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-500 block uppercase">Travel Time Delta</span>
                  <span className="text-emerald-400 font-bold">-{site.avgTravelTimeReductionMin} min</span>
                </div>
                <div className="bg-stone-950 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-500 block uppercase">Coverage Population</span>
                  <span className="text-stone-100 font-bold">{site.coveragePopulation.toLocaleString()}</span>
                </div>
                <div className="bg-stone-950 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-500 block uppercase">Estimated CapEx</span>
                  <span className="text-stone-100 font-bold">${(site.estimatedCapExUsd / 1000).toLocaleString()}k</span>
                </div>
              </div>

              {/* Equipment & Specification List */}
              {site.recommendedEquipment && (
                <div className="mt-3.5 pt-3 border-t border-stone-800/80">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block mb-1.5">
                    Planned Asset Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {site.recommendedEquipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-stone-300 bg-stone-950 px-2 py-0.5 rounded border border-stone-800"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status: {site.status.replace(/_/g, ' ')}</span>
              </span>

              <button
                onClick={() => {
                  onSelectSite(site);
                  onNavigateToMap();
                }}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
              >
                <span>Inspect on GIS Map</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
