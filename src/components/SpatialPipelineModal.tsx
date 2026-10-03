import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  X, 
  RefreshCw, 
  Check, 
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  Lock
} from 'lucide-react';
import { IssueReport, PipelineExecutionResult } from '../types';
import { runEightStageSpatialPipeline } from '../services/pipelineEngine';

interface SpatialPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: IssueReport[];
}

export const SpatialPipelineModal: React.FC<SpatialPipelineModalProps> = ({
  isOpen,
  onClose,
  reports,
}) => {
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult>(() => 
    runEightStageSpatialPipeline(reports)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string>('raw_staging');

  if (!isOpen) return null;

  const handleReRunPipeline = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/pipeline/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPipelineResult(data);
      } else {
        setPipelineResult(runEightStageSpatialPipeline(reports));
      }
    } catch {
      setPipelineResult(runEightStageSpatialPipeline(reports));
    } finally {
      setIsRunning(false);
    }
  };

  const selectedStage = pipelineResult.stages.find(s => s.id === activeStageId) || pipelineResult.stages[0];

  const getStageIcon = (stageNumber: number) => {
    switch (stageNumber) {
      case 1: return Database;
      case 2: return Layers;
      case 3: return MapPin;
      case 4: return Users;
      case 5: return ShieldAlert;
      case 6: return Sliders;
      case 7: return Sparkles;
      case 8: return CheckCircle2;
      default: return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl text-stone-100 p-6 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  MedMap-Adapted Architecture
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-mono">
                  8-Stage Data Pipeline
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                8-Stage Spatial Data & Candidate Site Optimization Pipeline
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReRunPipeline}
              disabled={isRunning}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isRunning ? 'Executing Pipeline...' : 'Re-Run 8 Stages'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Checksum Banner */}
        <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-stone-400">Versioned Snapshot Checksum:</span>
            <span className="text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
              {pipelineResult.snapshotChecksum}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Evaluated: <strong className="text-white">{pipelineResult.summaryMetrics.totalTractsEvaluated} Tracts</strong></span>
            <span>Geocoded: <strong className="text-white">{pipelineResult.summaryMetrics.facilitiesGeocoded.toLocaleString()} Facilities</strong></span>
            <span>Avg SVI: <strong className="text-amber-400">{pipelineResult.summaryMetrics.sviVulnerabilityIndexAvg}</strong></span>
          </div>
        </div>

        {/* 8-Stage Progress Stepper Bar */}
        <div>
          <h3 className="text-xs font-mono uppercase text-stone-400 mb-2.5 font-semibold">
            Pipeline Stage Progression ( reproducible lineage )
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {pipelineResult.stages.map((stage) => {
              const Icon = getStageIcon(stage.stageNumber);
              const isActive = activeStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-500">#{stage.stageNumber}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-purple-300' : 'text-stone-500'}`} />
                    <span className="text-[11px] font-semibold block leading-tight truncate">{stage.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="bg-stone-950 rounded-xl border border-stone-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700 text-purple-300 text-xs font-bold">
                Stage {selectedStage.stageNumber}: {selectedStage.name}
              </span>
              <span className="text-xs text-stone-400">({selectedStage.recordsProcessed.toLocaleString()} records processed)</span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">Hash: {selectedStage.checksumHash}</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            {selectedStage.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Data Sources:</span>
            {selectedStage.sourcesUsed.map((src, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-300">
                {src}
              </span>
            ))}
          </div>

          <div className="p-2.5 bg-stone-900/60 rounded-lg text-xs text-stone-300 font-mono border border-stone-800/80">
            <strong className="text-purple-400">Execution Result:</strong> {selectedStage.details}
          </div>
        </div>

        {/* Candidate Site Optimization Scoring Matrix */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Stage 7 & 8: Candidate Site Multi-Criteria Optimization Results</span>
              </h3>
              <p className="text-xs text-stone-400">
                Scored on Access, Capacity, Vulnerability (SVI/HRSA), Config Fit, and Cost Efficiency with rural road drive-time factors
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Avg Time Saved: -{pipelineResult.summaryMetrics.avgDriveTimeReductionMin} min
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pipelineResult.candidateOptimizations.map((cand) => (
              <div key={cand.siteId} className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
                      {cand.districtName} · {cand.censusTractId}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
                      {cand.candidateName}
                    </h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-lg font-bold text-emerald-400">{cand.totalOptimizationScore}</span>
                    <span className="text-[10px] text-stone-400 block">/ 100 Score</span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] bg-stone-900/70 p-2.5 rounded-lg border border-stone-800/80">
                  <div>Access Imprv: <strong className="text-sky-300">{cand.accessImprovementScore}</strong></div>
                  <div>Capacity Fit: <strong className="text-indigo-300">{cand.capacityScore}</strong></div>
                  <div>SVI Vulnerability: <strong className="text-amber-300">{cand.vulnerabilityScore}</strong></div>
                  <div>Cost Efficiency: <strong className="text-emerald-300">{cand.costEfficiencyScore}</strong></div>
                </div>

                {/* Drive time reduction */}
                <div className="flex items-center justify-between text-xs font-mono p-2 bg-purple-950/40 border border-purple-900/40 rounded-lg">
                  <span className="text-stone-300">Rural Drive Time:</span>
                  <span className="text-emerald-300 font-bold">
                    {cand.adjustedDriveTimeMin} min <span className="text-[10px] text-stone-400 font-normal">(vs {cand.baselineDriveTimeMin}m baseline)</span>
                  </span>
                </div>

                {/* Recommended service package */}
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Target Service Recommendations:</span>
                  <ul className="space-y-1 text-[11px] text-stone-300">
                    {cand.recommendedServices.map((srv, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>Engine Pipeline: MedMap-Adapted 8-Stage Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors font-sans font-medium text-xs"
          >
            Close Pipeline Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
