import { Report } from './types';

const OFFLINE_QUEUE_KEY = 'needmap_offline_reports_queue';

/**
 * Saves an anonymized report to browser local storage when offline or on weak signal.
 */
export function queueOfflineReport(report: Report): void {
  const currentQueue = getOfflineReportsQueue();
  currentQueue.push(report);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
}

/**
 * Retrieves all locally cached offline reports.
 */
export function getOfflineReportsQueue(): Report[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clears the offline reports queue after syncing.
 */
export function clearOfflineReportsQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

/**
 * Syncs any offline queued reports with the main active dataset when connection is restored.
 */
export function syncOfflineReports(onSync: (syncedReports: Report[]) => void): void {
  const queue = getOfflineReportsQueue();
  if (queue.length > 0) {
    onSync(queue);
    clearOfflineReportsQueue();
  }
}
