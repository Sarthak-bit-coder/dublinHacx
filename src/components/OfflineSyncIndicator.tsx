import React, { useState, useEffect } from 'react';
import { 
  syncService, 
  SyncState 
} from '../services/syncService';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  X, 
  Radio, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface OfflineSyncIndicatorProps {
  onForceSyncComplete?: () => void;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ onForceSyncComplete }) => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    setIsSimulatedOffline(syncService.getSimulatedOffline());
    const unsubscribe = syncService.subscribe((state, count, lastSync) => {
      setSyncState(state);
      setPendingCount(count);
      setLastSyncTime(lastSync);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleOfflineSimulation = () => {
    const next = !isSimulatedOffline;
    setIsSimulatedOffline(next);
    syncService.setSimulatedOffline(next);
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncService.syncWithServer();
      if (onForceSyncComplete) onForceSyncComplete();
    } finally {
      setIsManualSyncing(false);
    }
  };

  const renderStatusDot = () => {
    switch (syncState) {
      case 'synced':
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        );
      case 'syncing':
        return (
          <RefreshCw className="w-2.5 h-2.5 text-amber-400 animate-spin" />
        );
      case 'queued':
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex rounded-full h-2 w-2 bg-stone-500" />
        );
    }
  };

  const getStatusLabel = () => {
    switch (syncState) {
      case 'synced':
        return 'Local Cache & Central DB Synchronized';
      case 'syncing':
        return 'Syncing Local Cache...';
      case 'queued':
        return `${pendingCount} Offline Item${pendingCount > 1 ? 's' : ''} Queued`;
      case 'offline':
        return pendingCount > 0 
          ? `Offline · ${pendingCount} Item${pendingCount > 1 ? 's' : ''} Cached` 
          : 'Offline · Local Cache Ready';
    }
  };

  return (
    <>
      {/* Footer Visual Status Indicator Trigger */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex items-center gap-2 px-2.5 py-1 rounded bg-stone-900/80 hover:bg-stone-800 border border-stone-800/80 hover:border-stone-700 text-[11px] font-mono transition-all text-stone-300"
        title="View Offline Sync & Database State"
      >
        {renderStatusDot()}
        <span className="group-hover:text-white transition-colors">{getStatusLabel()}</span>
      </button>

      {/* Synchronization Inspector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-5 sm:p-6 text-stone-100 my-8">
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Offline Sync & Database Telemetry
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400">
                    Dual Local Cache & Central Precinct Storage
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sync Status Visual Diagram */}
            <div className="mt-4 p-3.5 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-2">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <HardDrive className="w-3.5 h-3.5 text-stone-400" />
                  Local Client Cache
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  {syncState === 'syncing' ? 'Syncing...' : syncState === 'synced' ? 'Synchronized' : 'Offline / Queued'}
                </span>
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Central Server DB
                </span>
              </div>

              {/* Progress Line */}
              <div className="relative w-full h-1.5 bg-stone-800 rounded-full overflow-hidden my-2">
                <div 
                  className={`h-full transition-all duration-300 ${
                    syncState === 'synced' ? 'w-full bg-emerald-500' :
                    syncState === 'syncing' ? 'w-2/3 bg-amber-400 animate-pulse' :
                    'w-1/3 bg-stone-600'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mt-2">
                <span>Queued Reports: <strong className="text-stone-200">{pendingCount}</strong></span>
                <span>Last Synced: <strong className="text-stone-300">{lastSyncTime}</strong></span>
                <span>Protocol: JSON HTTP v1</span>
              </div>
            </div>

            {/* Offline Simulation Switcher */}
            <div className="mt-4 p-3.5 bg-stone-950/60 rounded-lg border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                  {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Simulate Rural Disconnected Mode</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Test creating reports with no cellular signal. Reports are preserved locally in browser storage.
                </p>
              </div>

              <button
                onClick={handleToggleOfflineSimulation}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors border shrink-0 ${
                  isSimulatedOffline
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-sm'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                {isSimulatedOffline ? 'Offline Mode Active' : 'Go Offline'}
              </button>
            </div>

            {/* Pending payload overview if any */}
            {pendingCount > 0 && (
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {pendingCount} Report(s) waiting for server handshake
                </span>
                <p className="text-[11px] text-stone-300 mt-1">
                  These reports were recorded offline. They will automatically upload when network connectivity restores.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-500">
                Storage: LocalStorage + RAM
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isManualSyncing || isSimulatedOffline}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  <span>{isManualSyncing ? 'Syncing...' : 'Force Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
