import { IssueReport } from '../types';

const STORAGE_KEY_QUEUE = 'ruralgrid_offline_queue_v1';
const STORAGE_KEY_LAST_SYNC = 'ruralgrid_last_sync_timestamp';
const STORAGE_KEY_SIMULATED_OFFLINE = 'ruralgrid_simulated_offline';

export type SyncState = 'synced' | 'syncing' | 'queued' | 'offline';

type SyncListener = (state: SyncState, queueCount: number, lastSync: string) => void;

class OfflineSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private simulatedOffline: boolean = false;
  private currentSyncState: SyncState = 'synced';

  constructor() {
    if (typeof window !== 'undefined') {
      this.simulatedOffline = localStorage.getItem(STORAGE_KEY_SIMULATED_OFFLINE) === 'true';
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
      this.updateState();
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSyncState, this.getPendingCount(), this.getLastSyncTime());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getSyncState();
    const count = this.getPendingCount();
    const time = this.getLastSyncTime();
    this.listeners.forEach((fn) => fn(state, count, time));
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    if (this.simulatedOffline) return false;
    return navigator.onLine;
  }

  public setSimulatedOffline(val: boolean) {
    this.simulatedOffline = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SIMULATED_OFFLINE, String(val));
    }
    this.handleNetworkChange();
  }

  public getSimulatedOffline(): boolean {
    return this.simulatedOffline;
  }

  private handleNetworkChange() {
    this.updateState();
    if (this.isOnline() && this.getPendingCount() > 0) {
      this.syncWithServer();
    }
  }

  public getPendingQueue(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getPendingCount(): number {
    return this.getPendingQueue().length;
  }

  public getLastSyncTime(): string {
    if (typeof window === 'undefined') return 'Just now';
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || 'Nominal (Connected)';
  }

  public updateLastSyncTime() {
    if (typeof window !== 'undefined') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
    }
  }

  public getSyncState(): SyncState {
    if (!this.isOnline()) return 'offline';
    if (this.currentSyncState === 'syncing') return 'syncing';
    if (this.getPendingCount() > 0) return 'queued';
    return 'synced';
  }

  private updateState() {
    this.currentSyncState = this.getSyncState();
    this.notify();
  }

  // Queue report locally for offline resilience
  public enqueueReport(report: any) {
    const queue = this.getPendingQueue();
    queue.push({
      ...report,
      queuedLocallyAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
    this.updateState();

    // If online, attempt immediate sync
    if (this.isOnline()) {
      this.syncWithServer();
    }
  }

  // Batch sync local queue with backend central database
  public async syncWithServer(): Promise<{ success: boolean; syncedCount: number; serverReports: any[] }> {
    if (!this.isOnline()) {
      return { success: false, syncedCount: 0, serverReports: [] };
    }

    const queue = this.getPendingQueue();
    this.currentSyncState = 'syncing';
    this.notify();

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingReports: queue,
          clientTimestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Sync server handshake failed');
      }

      const data = await res.json();
      
      // Clear queue upon successful server confirmation
      localStorage.removeItem(STORAGE_KEY_QUEUE);
      this.updateLastSyncTime();
      this.currentSyncState = 'synced';
      this.notify();

      return {
        success: true,
        syncedCount: data.syncedCount || queue.length,
        serverReports: data.reports || [],
      };
    } catch (err) {
      console.warn('Sync failed, keeping reports in local storage queue:', err);
      this.currentSyncState = 'queued';
      this.notify();
      return { success: false, syncedCount: 0, serverReports: [] };
    }
  }

  // Clear local queue for debugging
  public clearQueue() {
    localStorage.removeItem(STORAGE_KEY_QUEUE);
    this.updateState();
  }
}

export const syncService = new OfflineSyncManager();
