import React, { useState, useEffect } from 'react';
import { NeedZone, NeedCategory, SeverityLevel, Report } from '../../lib/types';
import { queueOfflineReport, getOfflineReportsQueue, syncOfflineReports } from '../../lib/offlineSync';
import { TOWNS } from '../../data/redwoodCountyData';
import { getH3IndexFromCoordinates } from '../../lib/hexGrid';
import { Zap, Wifi, WifiOff, CheckCircle2, Send, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

interface RuralLowDataModeProps {
  needZones: NeedZone[];
  onAddReport: (report: Report) => void;
  onExitLowDataMode: () => void;
}

export const RuralLowDataMode: React.FC<RuralLowDataModeProps> = ({
  needZones,
  onAddReport,
  onExitLowDataMode,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [category, setCategory] = useState<NeedCategory>('healthcare');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [town, setTown] = useState(TOWNS[0].name);
  const [summary, setSummary] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineReports((synced) => {
        synced.forEach((rep) => onAddReport(rep));
        setSubmittedMessage(`Synced ${synced.length} offline report(s) with live network!`);
        setOfflineCount(0);
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineCount(getOfflineReportsQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onAddReport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const townObj = TOWNS.find((t) => t.name === town) || TOWNS[0];
    const latJitter = (Math.random() - 0.5) * 0.02;
    const lngJitter = (Math.random() - 0.5) * 0.02;
    const lat = townObj.lat + latJitter;
    const lng = townObj.lng + lngJitter;

    const newReport: Report = {
      id: `rural-${Date.now()}`,
      category,
      subcategory: category,
      severity,
      sourceType: 'community_survey',
      summary: summary.trim(),
      approximateLatitude: lat,
      approximateLongitude: lng,
      locationGridId: getH3IndexFromCoordinates(lat, lng),
      town,
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isSynthetic: false,
      status: 'active',
      tags: ['low_data_report'],
    };

    if (navigator.onLine) {
      onAddReport(newReport);
      setSubmittedMessage('Report submitted live! (Used < 2 KB data)');
    } else {
      queueOfflineReport(newReport);
      setOfflineCount(getOfflineReportsQueue().length);
      setSubmittedMessage('Report saved locally offline. Will sync automatically when signal returns!');
    }

    setSummary('');
    setTimeout(() => setSubmittedMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col p-4 max-w-xl mx-auto">
      {/* Low-Data Banner */}
      <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 p-3 rounded-xl flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white">Rural Low-Data Mode Active</strong>
            <div className="text-[10px] text-amber-300">Map image tiles disabled • &lt; 5 KB data footprint</div>
          </div>
        </div>
        <button
          onClick={onExitLowDataMode}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-700"
        >
          Exit Mode
        </button>
      </div>

      {/* Network Status Badge */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl mb-5">
        <div className="flex items-center gap-2 text-xs">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Signal Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-bold">Offline / Low Signal</span>
            </>
          )}
        </div>

        {offlineCount > 0 && (
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
            {offlineCount} Queued Offline
          </span>
        )}
      </div>

      {/* 1-Tap Resident Report Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-lg">
        <h3 className="font-extrabold text-lg text-white mb-1 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-400" />
          Quick Resident Report
        </h3>
        <p className="text-xs text-slate-400 mb-4">No names or home addresses required. Saves offline if no signal.</p>

        {submittedMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{submittedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Issue Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('healthcare')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  category === 'healthcare'
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🏥 Healthcare
              </button>
              <button
                type="button"
                onClick={() => setCategory('water_sanitation')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  category === 'water_sanitation'
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                💧 Water
              </button>
              <button
                type="button"
                onClick={() => setCategory('transportation_emergency')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  category === 'transportation_emergency'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🚌 Transit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Town / Region
            </label>
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {TOWNS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} Area
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Short Description
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              placeholder="e.g. Pharmacy closed early, road blocked..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            Submit Report (Instant Low-Data)
          </button>
        </form>
      </div>

      {/* Lightweight Text-Only Need Zones List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h4 className="font-extrabold text-sm text-white mb-3 flex items-center justify-between">
          <span>Active Need Zones (Lightweight Summary)</span>
          <span className="text-xs text-slate-400 font-mono">{needZones.length} Zones</span>
        </h4>

        <div className="space-y-2">
          {needZones.slice(0, 4).map((zone) => (
            <div key={zone.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{zone.townName} Zone</div>
                <div className="text-[11px] text-slate-400">
                  {zone.signalCount} signals • Nearest service ~{zone.nearestFacilityDistanceKm} km
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  zone.priorityLabel === 'High-priority review'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {zone.priorityScore}/100
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
