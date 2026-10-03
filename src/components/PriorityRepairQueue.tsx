import React, { useState } from 'react';
import { 
  PriorityRepair 
} from '../types';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  HardHat, 
  MapPin, 
  CheckCircle, 
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';

interface PriorityRepairQueueProps {
  priorities: PriorityRepair[];
  onSelectRepair: (repair: PriorityRepair) => void;
  onNavigateToMap: () => void;
  onUpdateStatus: (repairId: string, newStatus: PriorityRepair['status']) => void;
}

export const PriorityRepairQueue: React.FC<PriorityRepairQueueProps> = ({
  priorities,
  onSelectRepair,
  onNavigateToMap,
  onUpdateStatus,
}) => {
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'degradation' | 'cost'>('rank');

  const filtered = priorities.filter((p) => {
    if (districtFilter !== 'all' && !p.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.assetName.toLowerCase().includes(q) || p.locationName.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'degradation') return b.degradationScore - a.degradationScore;
    if (sortBy === 'cost') return b.estimatedCostUsd - a.estimatedCostUsd;
    return 0;
  });

  const totalCost = priorities.reduce((acc, curr) => acc + curr.estimatedCostUsd, 0);
  const urgentCount = priorities.filter((p) => p.status === 'urgent_dispatch').length;
  const avgDays = Math.round((priorities.reduce((acc, curr) => acc + curr.estimatedCrewDays, 0) / priorities.length) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Metric Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-stone-400 uppercase block">Total Actionable Backlog</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              ${totalCost.toLocaleString()}
            </span>
            <span className="text-xs text-stone-500 font-mono">USD</span>
          </div>
          <span className="text-xs text-stone-400 mt-1 block">5 prioritized infrastructure assets</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-rose-400 uppercase block">Urgent Crew Dispatches</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
              {urgentCount} Assets
            </span>
            <span className="text-xs text-rose-400/80 font-mono">Active Emergency</span>
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Blackwood Bridge & East Ridge Culvert</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-emerald-400 uppercase block">Average Work Days / Job</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              {avgDays} Days
            </span>
            <span className="text-xs text-stone-500 font-mono">Heavy Crew Time</span>
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Standard 4-person civil road unit</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search priority repairs by bridge, culvert, well..."
            className="w-full bg-stone-950 border border-stone-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Controls (Segmented Buttons) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-md px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Districts</option>
            <option value="Pine Basin">Pine Basin</option>
            <option value="Highland Ridge">Highland Ridge</option>
            <option value="Cedar Flats">Cedar Flats</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-md px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="urgent_dispatch">Urgent Dispatch</option>
            <option value="queued">Queued</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded border border-stone-800">
            <button
              onClick={() => setSortBy('rank')}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'rank' ? 'bg-stone-800 text-stone-200 font-medium' : 'text-stone-400'}`}
            >
              Rank
            </button>
            <button
              onClick={() => setSortBy('degradation')}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'degradation' ? 'bg-stone-800 text-stone-200 font-medium' : 'text-stone-400'}`}
            >
              Degradation
            </button>
            <button
              onClick={() => setSortBy('cost')}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'cost' ? 'bg-stone-800 text-stone-200 font-medium' : 'text-stone-400'}`}
            >
              Cost
            </button>
          </div>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase text-[10px] border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Asset & Location</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4 text-center">Degradation</th>
                <th className="py-3 px-4 text-center">Isolation Risk</th>
                <th className="py-3 px-4">Required Machinery</th>
                <th className="py-3 px-4 text-right">Est. Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filtered.map((item) => {
                const isUrgent = item.status === 'urgent_dispatch';
                return (
                  <tr 
                    key={item.id}
                    className="hover:bg-stone-800/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      onSelectRepair(item);
                      onNavigateToMap();
                    }}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-200">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        item.rank === 1 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        item.rank === 2 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-stone-800 text-stone-300'
                      }`}>
                        #{item.rank}
                      </span>
                    </td>

                    {/* Asset & Location */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-100 group-hover:text-emerald-400 transition-colors">
                        {item.assetName}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        <span>{item.locationName}</span>
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-4 text-stone-300 font-mono text-[11px]">
                      {item.district}
                    </td>

                    {/* Degradation Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-red-400">
                        <span>{item.degradationScore}</span>
                        <span className="text-[10px] text-stone-500 font-normal">/100</span>
                      </div>
                      <div className="w-16 h-1 bg-stone-800 rounded-full mx-auto mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${item.degradationScore}%` }} 
                        />
                      </div>
                    </td>

                    {/* Isolation Risk */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs text-amber-300">
                        {item.isolationRiskScore}%
                      </span>
                    </td>

                    {/* Required Machinery */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.requiredMachinery.map((mach, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] font-mono text-stone-300 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 truncate"
                          >
                            {mach}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-100 font-semibold">
                      ${item.estimatedCostUsd.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={item.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as PriorityRepair['status'])}
                        className={`text-[11px] font-mono rounded px-2 py-1 border focus:outline-none ${
                          item.status === 'urgent_dispatch'
                            ? 'bg-red-950/60 border-red-800 text-red-300 font-semibold'
                            : item.status === 'in_progress'
                            ? 'bg-sky-950/60 border-sky-800 text-sky-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400'
                        }`}
                      >
                        <option value="urgent_dispatch">Urgent Dispatch</option>
                        <option value="queued">Queued</option>
                        <option value="in_progress">In Progress</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRepair(item);
                          onNavigateToMap();
                        }}
                        className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                        title="Locate on Strategic GIS Map"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
