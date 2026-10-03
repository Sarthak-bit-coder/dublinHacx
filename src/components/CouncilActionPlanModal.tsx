import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle,
  Building2,
  DollarSign
} from 'lucide-react';
import { PriorityRepair, StrategicSite, AIPatternCluster } from '../types';

interface CouncilActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: PriorityRepair[];
  strategicSites: StrategicSite[];
  clusters: AIPatternCluster[];
}

export const CouncilActionPlanModal: React.FC<CouncilActionPlanModalProps> = ({
  isOpen,
  onClose,
  priorities,
  strategicSites,
  clusters,
}) => {
  if (!isOpen) return null;

  const totalRepairCost = priorities.reduce((acc, curr) => acc + curr.estimatedCostUsd, 0);
  const totalFacilityCost = strategicSites.reduce((acc, curr) => acc + curr.estimatedCapExUsd, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-6 sm:p-8 text-stone-100 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Official Rural Precinct Infrastructure & Strategic Allocation Plan
              </h2>
              <p className="text-xs text-stone-400">
                County Precincts 4 & 7 · Rural Development Action Report · Generated for Board of Commissioners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="mt-6 space-y-6 text-xs text-stone-300">
          {/* Executive Overview Box */}
          <div className="bg-stone-950 p-4 rounded-lg border border-stone-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
              Executive Engineering Synthesis
            </span>
            <p className="text-stone-200 leading-relaxed">
              Following multi-point geospatial survey and citizen reports across Pine Basin, Highland Ridge, and Cedar Flats, an immediate intervention strategy has been generated. Compounding road sub-base erosion and single-point timber bridge scouring threaten essential school bus corridors and emergency cardiac/trauma response. Construction of the Mill Creek Level IV Clinic and deployment of the Pine Crossroads Technician Depot are recommended for USDA / State Rural Resilience grant allocation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-stone-800/80 font-mono">
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Immediate Repair Outlay</span>
                <span className="text-white font-bold text-sm">${totalRepairCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Strategic CapEx Plan</span>
                <span className="text-white font-bold text-sm">${(totalFacilityCost / 1000000).toFixed(2)}M</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">High-Risk Clusters</span>
                <span className="text-amber-400 font-bold text-sm">{clusters.length} Critical Zones</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Total Rural Population</span>
                <span className="text-emerald-400 font-bold text-sm">20,000 residents</span>
              </div>
            </div>
          </div>

          {/* Section 1: Ranked Repair Priority Queue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>1. Immediate 90-Day Priority Repair Queue</span>
              </h3>
              <span className="text-[11px] font-mono text-stone-400">Order based on Degradation & Isolation Index</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900/60 font-mono text-[10px] uppercase text-stone-400 border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3">Infrastructure Asset</th>
                    <th className="py-2.5 px-3">Degradation</th>
                    <th className="py-2.5 px-3">Isolation Risk</th>
                    <th className="py-2.5 px-3 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80 font-mono text-[11px]">
                  {priorities.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 text-center font-bold text-white">#{p.rank}</td>
                      <td className="py-2.5 px-3 font-sans text-stone-200">
                        <div className="font-semibold">{p.assetName}</div>
                        <div className="text-[10px] text-stone-400">{p.rationale}</div>
                      </td>
                      <td className="py-2.5 px-3 text-red-400 font-bold">{p.degradationScore}/100</td>
                      <td className="py-2.5 px-3 text-amber-300">{p.isolationRiskScore}%</td>
                      <td className="py-2.5 px-3 text-right text-stone-100 font-bold">
                        ${p.estimatedCostUsd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Strategic Hospital & Technician Allocations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>2. Recommended Strategic Siting Allocations</span>
              </h3>
              <span className="text-[11px] font-mono text-stone-400">Grant Submission Dossier</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strategicSites.map((site) => (
                <div key={site.id} className="p-3.5 bg-stone-950 border border-stone-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">{site.categoryLabel}</span>
                      <h4 className="font-bold text-xs text-white mt-0.5">{site.name}</h4>
                    </div>
                    <span className="font-mono text-xs text-stone-300 font-semibold">
                      ${(site.estimatedCapExUsd / 1000).toLocaleString()}k
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-2 leading-relaxed">
                    {site.keyJustification}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>Reach: {site.coveragePopulation.toLocaleString()} residents</span>
                    <span className="text-emerald-400">Transit: -{site.avgTravelTimeReductionMin} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signoff / Verification footer */}
          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 font-mono gap-3">
            <div>
              <span>Official Record Document ID: <strong className="text-stone-300">RG-2026-PRECINCT4-PLAN</strong></span>
            </div>
            <div>
              <span>Submitted to Precinct Board of Supervisors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
