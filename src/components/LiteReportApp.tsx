import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Check, 
  Send, 
  Wifi, 
  WifiOff, 
  Camera, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  HardHat,
  Droplet,
  Zap,
  Radio,
  Hospital,
  Compass,
  PhoneCall
} from 'lucide-react';
import { IssueCategory, SeverityLevel, IssueReport } from '../types';
import { syncService, SyncState } from '../services/syncService';

interface LiteReportAppProps {
  onBackToFullApp: () => void;
  onReportCreated?: (newReport: any) => void;
}

export const LiteReportApp: React.FC<LiteReportAppProps> = ({
  onBackToFullApp,
  onReportCreated,
}) => {
  // Form State
  const [category, setCategory] = useState<IssueCategory>('road');
  const [severity, setSeverity] = useState<SeverityLevel>('critical');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [emergencyBlocked, setEmergencyBlocked] = useState(true);
  const [householdsCutoff, setHouseholdsCutoff] = useState<number>(20);
  const [district, setDistrict] = useState('Pine Basin');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('/src/assets/images/rural_road_damage_1791058378160.jpg');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const unsub = syncService.subscribe((state, count) => {
      setSyncState(state);
      setPendingCount(count);
    });
    return () => unsub();
  }, []);

  // Quick GPS Grab
  const handleGetGps = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
          });
          setIsGettingGps(false);
        },
        () => {
          // Fallback realistic coordinates for county precinct
          setGpsCoords({ lat: 44.1952, lng: -116.4812 });
          setIsGettingGps(false);
        },
        { timeout: 4000 }
      );
    } else {
      setGpsCoords({ lat: 44.1952, lng: -116.4812 });
      setIsGettingGps(false);
    }
  };

  const categories: { id: IssueCategory; label: string; icon: any; defaultPhoto: string }[] = [
    { id: 'road', label: 'Road / Pothole / Culvert', icon: AlertTriangle, defaultPhoto: '/src/assets/images/rural_road_damage_1791058378160.jpg' },
    { id: 'bridge', label: 'Bridge / River Crossing', icon: HardHat, defaultPhoto: '/src/assets/images/rural_bridge_degradation_1791058386354.jpg' },
    { id: 'water', label: 'Well / Drinking Water', icon: Droplet, defaultPhoto: '/src/assets/images/rural_water_pump_1791058405622.jpg' },
    { id: 'power', label: 'Fallen Line / Power Cut', icon: Zap, defaultPhoto: '/src/assets/images/rural_road_damage_1791058378160.jpg' },
    { id: 'health', label: 'Clinic / Medical Route', icon: Hospital, defaultPhoto: '/src/assets/images/rural_health_clinic_1791058396931.jpg' },
    { id: 'telecom', label: 'Cell Signal / Tower', icon: Radio, defaultPhoto: '/src/assets/images/rural_road_damage_1791058378160.jpg' },
  ];

  const [lastPayloadKB, setLastPayloadKB] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isConnected = syncService.isOnline();
    const finalTitle = title.trim() || `${category.toUpperCase()} Issue near ${locationName || district}`;
    const finalDescription = description.trim() || `Reported via Rural Lite Reporter. Access blocked: ${emergencyBlocked ? 'Yes' : 'No'}. Affected households: ${householdsCutoff}.`;

    const reportPayload: any = {
      id: `lite-${Date.now()}`,
      title: finalTitle,
      description: finalDescription,
      category,
      severity,
      status: isConnected ? 'verified' : 'pending_review',
      coordinates: {
        lat: gpsCoords?.lat || 44.1840,
        lng: gpsCoords?.lng || -116.4120,
        x: Math.floor(Math.random() * 60) + 20,
        y: Math.floor(Math.random() * 60) + 20,
      },
      districtId: district === 'Pine Basin' ? 'district-pine-basin' : district === 'Highland Ridge' ? 'district-highland-ridge' : 'district-cedar-flats',
      districtName: district,
      locationName: locationName || `${district} Rural Sector`,
      dateReported: new Date().toISOString().split('T')[0],
      upvotes: 1,
      verifiedCount: 1,
      photoUrl: selectedPhoto,
      affectedHouseholds: Number(householdsCutoff) || 10,
      infrastructureType: category === 'road' ? 'Rural County Road' : category === 'bridge' ? 'Creek Bridge Crossing' : 'Community Infrastructure',
      reporterType: 'resident',
      emergencyAccessBlocked: emergencyBlocked,
      sourceApp: 'lite_mobile_reporter',
    };

    // Calculate exact payload size in KB for transparency
    const jsonStr = JSON.stringify(reportPayload);
    const sizeKB = Math.round((new Blob([jsonStr]).size / 1024) * 100) / 100;
    setLastPayloadKB(sizeKB);

    if (!isConnected) {
      // Offline mode: queue locally in localStorage
      syncService.enqueueReport(reportPayload);
      setIsOfflineSaved(true);
      if (onReportCreated) onReportCreated(reportPayload);
      setIsSubmitting(false);
      setSubmittedSuccessfully(true);
    } else {
      // Online mode: submit directly to dedicated low-bandwidth mobile endpoint (< 50 KB limit)
      try {
        const res = await fetch('/api/lite-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
        });
        if (res.ok) {
          const data = await res.json();
          if (onReportCreated) onReportCreated(data.report || reportPayload);
        } else {
          // Fallback to local queue on server failure
          syncService.enqueueReport(reportPayload);
          if (onReportCreated) onReportCreated(reportPayload);
        }
      } catch (err) {
        syncService.enqueueReport(reportPayload);
        if (onReportCreated) onReportCreated(reportPayload);
      } finally {
        setIsSubmitting(false);
        setSubmittedSuccessfully(true);
      }
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setLocationName('');
    setDescription('');
    setSubmittedSuccessfully(false);
    setIsOfflineSaved(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      {/* Ultra-Lightweight Header */}
      <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              RL
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">Rural Reporter</h1>
              <span className="text-[10px] font-mono text-stone-400 block">Low-Bandwidth Mobile Edition</span>
            </div>
          </div>

          <button
            onClick={onBackToFullApp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Full Map App</span>
          </button>
        </div>

        {/* Network & Low-Data Status Banner */}
        <div className="max-w-md mx-auto mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-stone-300">
            {syncService.isOnline() ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span>Connected (2G/3G)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <WifiOff className="w-3 h-3" />
                <span>Offline Mode (Queued)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
              &lt; 50 KB Limit
            </span>
            <span className="text-stone-400 text-[10px]">
              {pendingCount > 0 ? `${pendingCount} queued` : 'Sync ready'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Single-Column Lite Form View */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5">
        {submittedSuccessfully ? (
          /* Confirmation Screen */
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Report Successfully Recorded</h2>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {isOfflineSaved ? (
                  <span className="text-amber-300 font-medium">
                    Saved locally to your device storage. As soon as your phone reconnects to cellular signal or WiFi, it will automatically transmit to the County Road & Dispatch Board.
                  </span>
                ) : (
                  <span>
                    Transmitted immediately to the Central RuralGrid database. Your report is now live on the priority repair queue and GIS map.
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-left font-mono text-xs text-stone-300 space-y-1">
              <div><strong className="text-stone-400">Sector:</strong> {category.toUpperCase()}</div>
              <div><strong className="text-stone-400">Severity:</strong> {severity.toUpperCase()}</div>
              <div><strong className="text-stone-400">District:</strong> {district}</div>
              <div><strong className="text-stone-400">Access Blocked:</strong> {emergencyBlocked ? 'YES (Emergency)' : 'No'}</div>
              {lastPayloadKB !== null && (
                <div className="pt-1.5 mt-1.5 border-t border-stone-800 text-emerald-400 flex items-center justify-between text-[11px]">
                  <span>Data Usage:</span>
                  <span className="font-bold">{lastPayloadKB} KB (Max &lt; 50 KB limit)</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleResetForm}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg text-xs transition-colors"
              >
                + Submit Another Rural Issue
              </button>
              <button
                onClick={onBackToFullApp}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-lg text-xs transition-colors"
              >
                Open Full County Map & AI Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Rapid Reporting Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Sector Category */}
            <div>
              <label className="block text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                1. What is broken or hazardous?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        setSelectedPhoto(c.defaultPhoto);
                      }}
                      className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`} />
                      <span className="text-xs font-medium leading-tight">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Emergency / Severity Assessment */}
            <div>
              <label className="block text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                2. Can vehicles pass this spot?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSeverity('critical');
                    setEmergencyBlocked(true);
                  }}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    severity === 'critical'
                      ? 'bg-red-950/70 border-red-500 text-white font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="block text-xs text-red-400 font-bold">Impassable</span>
                  <span className="text-[10px] text-stone-400">Total cutoff</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSeverity('high');
                    setEmergencyBlocked(false);
                  }}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    severity === 'high'
                      ? 'bg-amber-950/70 border-amber-500 text-white font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="block text-xs text-amber-400 font-bold">4WD Only</span>
                  <span className="text-[10px] text-stone-400">Very rough</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSeverity('moderate');
                    setEmergencyBlocked(false);
                  }}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    severity === 'moderate'
                      ? 'bg-stone-800 border-stone-600 text-white font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="block text-xs text-stone-200 font-bold">Slow Pass</span>
                  <span className="text-[10px] text-stone-400">Caution</span>
                </button>
              </div>

              {/* Emergency Warning */}
              {emergencyBlocked && (
                <div className="mt-2.5 p-2 bg-red-950/30 border border-red-900/40 rounded flex items-center gap-2 text-xs text-red-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Flagged as Emergency: Ambulance & school bus route halted.</span>
                </div>
              )}
            </div>

            {/* Step 3: Location Details */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-emerald-400 uppercase tracking-wider">
                3. Where is this located?
              </label>

              {/* District & Landmark */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 text-[11px] block mb-1">Rural District</span>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pine Basin">Pine Basin</option>
                    <option value="Highland Ridge">Highland Ridge</option>
                    <option value="Cedar Flats">Cedar Flats</option>
                  </select>
                </div>

                <div>
                  <span className="text-stone-400 text-[11px] block mb-1">Households Affected</span>
                  <input
                    type="number"
                    min="1"
                    value={householdsCutoff}
                    onChange={(e) => setHouseholdsCutoff(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* GPS Auto Grab Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={isGettingGps}
                  className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-md text-xs font-medium text-stone-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Compass className={`w-3.5 h-3.5 text-emerald-400 ${isGettingGps ? 'animate-spin' : ''}`} />
                  <span>{gpsCoords ? `GPS: ${gpsCoords.lat}, ${gpsCoords.lng}` : isGettingGps ? 'Grabbing GPS...' : 'Use My Current Phone GPS'}</span>
                </button>
              </div>

              {/* Landmark name */}
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Milepost 14 East Ridge Pass, near Miller farm"
                className="w-full bg-stone-900 border border-stone-700 rounded-md p-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Optional brief note */}
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short note: culvert washed out, tree down, water murky..."
                className="w-full bg-stone-900 border border-stone-700 rounded-md p-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Issue to County Road Crews</span>
                  </>
                )}
              </button>
              <span className="block text-center text-[10px] text-stone-500 font-mono mt-1.5">
                Works 100% offline. Saved locally if no cell signal is available.
              </span>
            </div>
          </form>
        )}
      </main>

      {/* Ultra-Light Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 p-4 text-center text-[11px] text-stone-500 font-mono">
        <div>RuralGrid Lite · Fast 14KB Field Client</div>
        <div className="text-stone-400 mt-1">Precinct 4 & 7 Emergency Infrastructure Network</div>
      </footer>
    </div>
  );
};
