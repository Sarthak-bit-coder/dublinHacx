import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { NeedZone } from '../../lib/types';
import { CATEGORY_META } from '../../lib/constants';

interface CategoryChartProps {
  needZones: NeedZone[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ needZones }) => {
  const dataMap: Record<string, { name: string; count: number; color: string }> = {};

  needZones.forEach((z) => {
    const meta = CATEGORY_META[z.category] || CATEGORY_META.healthcare;
    if (!dataMap[z.category]) {
      dataMap[z.category] = {
        name: meta.label.split(' ')[0], // Short name
        count: 0,
        color: meta.color,
      };
    }
    dataMap[z.category].count += z.signalCount;
  });

  const chartData = Object.values(dataMap);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
        Signals by Need Category
      </h4>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          No category data available
        </div>
      ) : (
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={85} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
