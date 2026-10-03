import React from 'react';
import { Database, Grid, Map, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Aggregate Anonymized Signals',
      description: 'Ingest public service requests, community survey responses, or anonymized signal data without personal identifiers.',
      icon: Database,
      color: 'bg-blue-500',
    },
    {
      step: '02',
      title: 'Detect Spatial Need Zones',
      description: 'Group signals into privacy-preserving hexagonal cells (H3 grid) and calculate facility distance & recent growth trends.',
      icon: Grid,
      color: 'bg-teal-500',
    },
    {
      step: '03',
      title: 'Visualize Access Patterns',
      description: 'Interactively explore high-priority review areas on Leaflet maps with filter controls by category, urgency, and time.',
      icon: Map,
      color: 'bg-indigo-500',
    },
    {
      step: '04',
      title: 'Support Human Evaluation',
      description: 'Review clear explanations and recommended next steps to coordinate targeted mobile outreach or survey validation.',
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Workflow & Engine</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            How NeedMap Identifies Access Signals
          </p>
          <p className="mt-4 text-base text-slate-600">
            A simple 4-step analytical workflow built to assist planners, not replace community relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-slate-50/80 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
