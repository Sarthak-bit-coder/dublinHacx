import React, { useState } from 'react';
import { X, Send, ShieldCheck, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { NeedCategory, SeverityLevel, Report } from '../../lib/types';
import { getH3IndexFromCoordinates } from '../../lib/hexGrid';
import { TOWNS } from '../../data/redwoodCountyData';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: Report) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmitReport }) => {
  const [category, setCategory] = useState<NeedCategory>('healthcare');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [selectedTown, setSelectedTown] = useState<string>(TOWNS[0].name);
  const [summary, setSummary] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const townObj = TOWNS.find((t) => t.name === selectedTown) || TOWNS[0];
    
    // Add small random jitter to coordinates within town area for privacy
    const latJitter = (Math.random() - 0.5) * 0.02;
    const lngJitter = (Math.random() - 0.5) * 0.02;
    const lat = townObj.lat + latJitter;
    const lng = townObj.lng + lngJitter;

    const gridId = getH3IndexFromCoordinates(lat, lng);

    const newReport: Report = {
      id: `resident-${Date.now()}`,
      category,
      subcategory: category,
      severity,
      sourceType: 'community_survey',
      summary: summary.trim(),
      approximateLatitude: lat,
      approximateLongitude: lng,
      locationGridId: gridId,
      town: selectedTown,
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isSynthetic: false,
      status: 'active',
      tags: ['resident_report', category],
    };

    onSubmitReport(newReport);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setSummary('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-base tracking-tight">Report a Community Need</h3>
              <p className="text-xs text-blue-100">Simple, anonymous reporting for rural residents</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Signal Submitted Successfully!</h4>
            <p className="text-xs text-slate-600">
              Your anonymized report has been added to the map and live priority calculations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Privacy Alert */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Strict Privacy Protection:</strong> Do not include your name, phone number, or exact street address. Your location will be generalized into a 5 km² hex area.
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. What service access issue are you experiencing?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('healthcare')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    category === 'healthcare'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏥 Healthcare / Pharmacy
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('water_sanitation')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    category === 'water_sanitation'
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  💧 Safe Water / Utilities
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('transportation_emergency')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    category === 'transportation_emergency'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🚌 Transit / Emergency Access
                </button>
              </div>
            </div>

            {/* Town location selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Which general town/area are you located in?
              </label>
              <select
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {TOWNS.map((town) => (
                  <option key={town.name} value={town.name}>
                    {town.name} Area
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as SeverityLevel[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      severity === sev
                        ? sev === 'high'
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : sev === 'medium'
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'bg-slate-200 border-slate-400 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Brief Description (No names or home addresses)
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                placeholder="Example: Long travel required to reach an open pharmacy during evening hours..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Anonymous Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
