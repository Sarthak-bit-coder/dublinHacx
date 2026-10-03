import React, { useState } from 'react';
import { IssueReport, IssueCategory, SeverityLevel } from '../types';
import { 
  AlertTriangle, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  Calendar, 
  Users, 
  ShieldAlert, 
  ExternalLink,
  Search,
  Filter,
  Camera
} from 'lucide-react';

interface IssueReportsListProps {
  reports: IssueReport[];
  onSelectReport: (report: IssueReport) => void;
  onNavigateToMap: () => void;
  onUpvote: (reportId: string) => void;
  onOpenReportModal: () => void;
  isLiteMode: boolean;
}

export const IssueReportsList: React.FC<IssueReportsListProps> = ({
  reports,
  onSelectReport,
  onNavigateToMap,
  onUpvote,
  onOpenReportModal,
  isLiteMode,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = reports.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return <span className="text-red-400 font-semibold font-mono text-[11px]">CRITICAL EMERGENCY</span>;
      case 'high':
        return <span className="text-amber-400 font-semibold font-mono text-[11px]">HIGH IMPAIRMENT</span>;
      case 'moderate':
        return <span className="text-stone-300 font-mono text-[11px]">MODERATE</span>;
      default:
        return <span className="text-stone-500 font-mono text-[11px]">MINOR</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search citizen reports by keyword, road name, or village..."
            className="w-full bg-stone-950 border border-stone-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-stone-950 border border-stone-700 rounded-md px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sectors</option>
            <option value="road">Road & Culverts</option>
            <option value="bridge">Bridges</option>
            <option value="water">Water & Wells</option>
            <option value="power">Power Grid</option>
            <option value="health">Healthcare Routes</option>
            <option value="telecom">Telecom & Radio</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-stone-950 border border-stone-700 rounded-md px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
          </select>

          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold rounded-md transition-colors"
          >
            + New Field Report
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((report) => (
          <div
            key={report.id}
            className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-stone-700 transition-colors cursor-pointer group"
            onClick={() => {
              onSelectReport(report);
              onNavigateToMap();
            }}
          >
            <div>
              {/* Photo preview if present and not in lite mode */}
              {report.photoUrl && !isLiteMode && (
                <div className="mb-3 rounded-lg overflow-hidden border border-stone-800 h-36 relative">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-stone-300 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-stone-400" />
                    <span>Citizen Verification Photo</span>
                  </div>
                </div>
              )}

              {/* Zero-Pill Metadata Line */}
              <div className="flex items-center gap-2 text-xs text-stone-400">
                {getSeverityBadge(report.severity)}
                <span aria-hidden="true">·</span>
                <span className="capitalize">{report.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{report.districtName}</span>
                <span aria-hidden="true">·</span>
                <span>{report.dateReported}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-stone-100 group-hover:text-emerald-400 transition-colors mt-2">
                {report.title}
              </h3>

              {/* Emergency Banner if blocked */}
              {report.emergencyAccessBlocked && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-950/30 border border-red-900/40 px-2.5 py-1 rounded">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Emergency Block: Medical & School Bus Route Inaccessible</span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                {report.description}
              </p>

              {/* Location & Impact */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-800/80 font-mono text-[11px] text-stone-400">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">{report.locationName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{report.affectedHouseholds} households cut off</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpvote(report.id);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 transition-colors text-xs"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirm Issue ({report.upvotes})</span>
                </button>

                <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{report.verifiedCount} verified</span>
                </span>
              </div>

              <span className="text-xs text-emerald-400 group-hover:underline flex items-center gap-1">
                <span>View on Map</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
