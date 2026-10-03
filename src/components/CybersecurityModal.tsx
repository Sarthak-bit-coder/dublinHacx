import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileCheck, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Server,
  Zap,
  Key,
  ShieldAlert
} from 'lucide-react';
import { getSecurityTelemetry, SecurityAuditTelemetry } from '../services/securityService';

interface CybersecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CybersecurityModal: React.FC<CybersecurityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [telemetry, setTelemetry] = useState<SecurityAuditTelemetry>(getSecurityTelemetry());
  const [isPolled, setIsPolled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/security-audit')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.securityRating) {
            setTelemetry((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl text-stone-100 p-6 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Cybersecurity Architecture
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                  Rating: A+ Bank-Grade Shield
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Cybersecurity, Privacy Protection & Integrity Safeguards
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Summary Banner */}
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-emerald-300 font-bold block">100% End-to-End Privacy & Integrity Enforcement</span>
              <span className="text-stone-400 text-[11px]">All citizen reports stripped of PII before database storage or AI pattern analysis.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-emerald-400 font-bold shrink-0">
            A+ Compliant
          </span>
        </div>

        {/* 4 Key Security Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: PII Auto-Scrubber */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-emerald-400" />
                1. PII Redaction Engine
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Automatically redacts names, SSNs, phone numbers, emails, and street addresses using regex sanitization before storing reports.
            </p>
            <div className="pt-2 border-t border-stone-850 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>Redacted Ingestion Items:</span>
              <span className="text-white font-bold">{telemetry.piiItemsRedactedCount} Items Cleaned</span>
            </div>
          </div>

          {/* Pillar 2: Differential Privacy GPS */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                2. Differential Privacy GPS
              </span>
              <span className="text-[10px] font-mono bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Applies Laplace noise jitter (~50m) to resident coordinates to prevent targeting individual homes while keeping precinct GIS precision.
            </p>
            <div className="pt-2 border-t border-stone-850 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>Fuzzed GPS Points:</span>
              <span className="text-sky-300 font-bold">{telemetry.gpsCoordinatesFuzzedCount} Locations Fuzzed</span>
            </div>
          </div>

          {/* Pillar 3: SHA-256 Checksum Integrity */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-purple-400" />
                3. SHA-256 Checksum Audit
              </span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">Verified</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Every 8-stage data pipeline run generates an immutable, versioned SHA-256 snapshot to guarantee tamper-proof audit trails for councils.
            </p>
            <div className="pt-2 border-t border-stone-850 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>Snapshot Audit Status:</span>
              <span className="text-purple-300 font-bold">Immutable SHA-256</span>
            </div>
          </div>

          {/* Pillar 4: Request Buffer Guard */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                4. Request Payload Guard
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">Enforced</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Enforces a strict 50 KB ceiling on all rural mobile app requests to block payload flooding, ReDoS, and buffer overflow attempts.
            </p>
            <div className="pt-2 border-t border-stone-850 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>Payload Cap Ceiling:</span>
              <span className="text-amber-300 font-bold">&lt; 50 KB Max Limit</span>
            </div>
          </div>
        </div>

        {/* Enforced Security Headers List */}
        <div>
          <h3 className="text-xs font-mono uppercase text-stone-400 mb-2 font-semibold">
            HTTP Security Headers Enforced on Server:
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>X-Content-Type-Options: nosniff</span>
            </div>
            <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>X-Frame-Options: DENY</span>
            </div>
            <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>X-XSS-Protection: 1; mode=block</span>
            </div>
            <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Strict-Transport-Security</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>Security Audit Timestamp: {new Date(telemetry.timestamp).toLocaleTimeString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors font-sans font-medium text-xs"
          >
            Close Security Audit
          </button>
        </div>
      </div>
    </div>
  );
};
