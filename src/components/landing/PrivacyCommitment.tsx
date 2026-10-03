import React from 'react';
import { ShieldCheck, EyeOff, Lock, UserX, AlertTriangle } from 'lucide-react';

export const PrivacyCommitment: React.FC = () => {
  const privacyPillars = [
    {
      icon: EyeOff,
      title: 'Aggregate Zones Only',
      description: 'Individual home addresses or exact report pinpoints are never displayed. Data is generalized into multi-square-kilometer hex cells.',
    },
    {
      icon: UserX,
      title: 'Zero PII Storage',
      description: 'No personal names, phone numbers, emails, or free-text details are stored or mapped.',
    },
    {
      icon: Lock,
      title: 'Client-Side Safety Check',
      description: 'Uploaded CSVs pass through client-side PII scanners before parsing. Sensitive headers trigger instant warning alerts.',
    },
    {
      icon: ShieldCheck,
      title: 'Synthetic Demo Data',
      description: 'Built-in scenarios use fictional Redwood Valley County data to safely demonstrate analytical features without real resident data.',
    },
  ];

  return (
    <section id="privacy" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Safety Framework</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Designed for Dignity and Data Privacy
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Community mapping must protect the people it serves. NeedMap enforces strict privacy boundaries by design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {privacyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{pillar.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Callout Box */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex items-start gap-4 text-amber-200 text-sm max-w-4xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Analytical Disclaimer: </span>
            NeedMap uses aggregated signals to identify candidate areas for review, not confirmed proof of service deficits. Results are intended to support human decision-making and must be validated with community organizations, survey outreach, and local officials.
          </div>
        </div>
      </div>
    </section>
  );
};
