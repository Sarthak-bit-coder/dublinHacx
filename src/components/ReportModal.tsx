import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Check, 
  Mic, 
  Loader2,
  Users,
  ShieldAlert,
  HardHat,
  Droplet,
  Zap,
  Radio,
  Hospital
} from 'lucide-react';
import { IssueCategory, IssueReport, SeverityLevel } from '../types';
import { requestAIAssistReport } from '../services/geminiService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<IssueReport, 'id' | 'dateReported' | 'upvotes' | 'verifiedCount'>) => void;
  initialCoords?: { x: number; y: number; lat: number; lng: number } | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  initialCoords,
}) => {
  const [naturalInput, setNaturalInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('road');
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [districtId, setDistrictId] = useState('district-pine-basin');
  const [districtName, setDistrictName] = useState('Pine Basin');
  const [locationName, setLocationName] = useState('');
  const [affectedHouseholds, setAffectedHouseholds] = useState<number>(35);
  const [infrastructureType, setInfrastructureType] = useState('Unpaved Rural Road');
  const [reporterType, setReporterType] = useState<IssueReport['reporterType']>('resident');
  const [emergencyAccessBlocked, setEmergencyAccessBlocked] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/rural_road_damage_1791058378160.jpg');

  if (!isOpen) return null;

  // Quick category switch with default photo and label
  const handleSelectCategory = (cat: IssueCategory) => {
    setCategory(cat);
    if (cat === 'road') {
      setInfrastructureType('Unpaved Rural Road & Culvert');
      setPhotoUrl('/src/assets/images/rural_road_damage_1791058378160.jpg');
      if (!title) setTitle('Road Pothole or Culvert Washout');
    } else if (cat === 'bridge') {
      setInfrastructureType('Timber/Concrete Bridge Span');
      setPhotoUrl('/src/assets/images/rural_bridge_degradation_1791058386354.jpg');
      if (!title) setTitle('Bridge Foundation Scour / Deck Damage');
    } else if (cat === 'water') {
      setInfrastructureType('Solar Deep Well Station');
      setPhotoUrl('/src/assets/images/rural_water_pump_1791058405622.jpg');
      if (!title) setTitle('Drinking Water Borehole Outage');
    } else if (cat === 'power') {
      setInfrastructureType('Rural Power Line & Transformer');
      if (!title) setTitle('Downed Feeder Line / Transformer Failure');
    } else if (cat === 'health') {
      setInfrastructureType('Rural Health Access Corridor');
      setPhotoUrl('/src/assets/images/rural_health_clinic_1791058396931.jpg');
      if (!title) setTitle('Clinic Access Blockade or Medicine Shortage');
    } else if (cat === 'telecom') {
      setInfrastructureType('Emergency Radio Repeater');
      if (!title) setTitle('Cellular & VHF Radio Tower Down');
    }
  };

  // Use Gemini AI to parse unstructured audio/voice transcript or resident description
  const handleAiAutoFill = async () => {
    if (!naturalInput.trim()) return;
    setIsAiParsing(true);
    try {
      const result = await requestAIAssistReport(naturalInput);
      if (result) {
        if (result.title) setTitle(result.title);
        if (result.category) handleSelectCategory(result.category as IssueCategory);
        if (result.severity) setSeverity(result.severity as SeverityLevel);
        if (result.estimatedHouseholds) setAffectedHouseholds(result.estimatedHouseholds);
        if (!description) setDescription(naturalInput);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrictId(val);
    if (val === 'district-pine-basin') setDistrictName('Pine Basin');
    else if (val === 'district-highland-ridge') setDistrictName('Highland Ridge');
    else setDistrictName('Cedar Flats');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Coordinates default or from pin drop
    const coords = initialCoords || {
      x: 35 + Math.floor(Math.random() * 30),
      y: 30 + Math.floor(Math.random() * 35),
      lat: 44.18 + (Math.random() - 0.5) * 0.1,
      lng: -116.42 + (Math.random() - 0.5) * 0.1,
    };

    onSubmitReport({
      title,
      description,
      category,
      severity,
      status: 'pending_review',
      coordinates: coords,
      districtId,
      districtName,
      locationName: locationName || `${districtName} Sector Milepost`,
      affectedHouseholds: Number(affectedHouseholds) || 10,
      infrastructureType,
      reporterType,
      emergencyAccessBlocked,
      photoUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Community Hazard Reporting
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Report Rural Issue or Hazard
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Takes under a minute. Feeds directly to county repair crews and the AI repair priority queue.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Easy Category Selector (Big Tap Targets) */}
        <div className="mt-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2 font-semibold">
            1. What type of problem is it?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'road', label: 'Road', icon: AlertTriangle, color: 'text-amber-400' },
              { id: 'bridge', label: 'Bridge', icon: HardHat, color: 'text-rose-400' },
              { id: 'water', label: 'Water', icon: Droplet, color: 'text-sky-400' },
              { id: 'power', label: 'Power', icon: Zap, color: 'text-yellow-400' },
              { id: 'health', label: 'Clinic', icon: Hospital, color: 'text-emerald-400' },
              { id: 'telecom', label: 'Radio/Cell', icon: Radio, color: 'text-indigo-400' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id as IssueCategory)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-sm ring-1 ring-emerald-500' 
                      : 'border-stone-800 bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                  <span className="text-[11px] font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. AI Voice & Quick Input Assistant */}
        <div className="mt-4 p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Voice & Rapid Text Assistant
            </span>
            <span className="text-[11px] text-stone-400 font-mono">Optional</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g. Flash flood eroded bridge abutment near Mill Creek, bus stopped and 40 homes cut off..."
              className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAiAutoFill();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAiParsing || !naturalInput.trim()}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-stone-950 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isAiParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Structured Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Title */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Washout on North Pass Road"
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Describe What Happened</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the damage, whether cars or trucks can pass, and how many neighbors are affected..."
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Severity & Affected Households */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Urgency Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="critical">🔴 Critical (Total Blockage / Danger)</option>
                <option value="high">🟠 High (Major Slowdown / 4x4 Only)</option>
                <option value="moderate">🟡 Moderate (Passable with caution)</option>
                <option value="minor">🟢 Minor (Surface wear or pothole)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Homes / Families Cut Off</label>
              <input
                type="number"
                min="0"
                value={affectedHouseholds}
                onChange={(e) => setAffectedHouseholds(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Reporter Role</label>
              <select
                value={reporterType}
                onChange={(e) => setReporterType(e.target.value as IssueReport['reporterType'])}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="resident">Local Resident</option>
                <option value="farmer">Farmer / Rancher</option>
                <option value="school_bus_driver">School Bus Driver</option>
                <option value="health_worker">Community Health Worker</option>
                <option value="technician">Utility Field Worker</option>
              </select>
            </div>
          </div>

          {/* District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">District</label>
              <select
                value={districtId}
                onChange={handleDistrictChange}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="district-pine-basin">Pine Basin & Blackwood Valley</option>
                <option value="district-highland-ridge">Highland Ridge & Timber Pass</option>
                <option value="district-cedar-flats">Cedar Flats & South Prairie</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Road Name or Landmark</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Milepost 18 near Miller Silo"
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Emergency Block Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-900/50 rounded-xl">
            <input
              type="checkbox"
              id="emergencyBlock"
              checked={emergencyAccessBlocked}
              onChange={(e) => setEmergencyAccessBlocked(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 bg-stone-950 border-stone-700 focus:ring-0"
            />
            <label htmlFor="emergencyBlock" className="text-xs text-red-300 font-medium cursor-pointer">
              Emergency Block: Ambulances, fire trucks, or school buses cannot pass this point.
            </label>
          </div>

          {/* Photo Reference Selection */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-stone-400" />
              Evidence Photo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Road Erosion', url: '/src/assets/images/rural_road_damage_1791058378160.jpg' },
                { label: 'Bridge Wear', url: '/src/assets/images/rural_bridge_degradation_1791058386354.jpg' },
                { label: 'Health Post', url: '/src/assets/images/rural_health_clinic_1791058396931.jpg' },
                { label: 'Water Station', url: '/src/assets/images/rural_water_pump_1791058405622.jpg' },
              ].map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => setPhotoUrl(item.url)}
                  className={`p-1.5 rounded-xl border text-left transition-all ${
                    photoUrl === item.url ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500' : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <span className="block text-[10px] text-stone-300 mt-1 truncate font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <span className="text-[11px] font-mono text-stone-400">
              {initialCoords ? `GPS Pinned: ${initialCoords.lat.toFixed(4)}, ${initialCoords.lng.toFixed(4)}` : 'Stored locally if offline'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Submit Report
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
