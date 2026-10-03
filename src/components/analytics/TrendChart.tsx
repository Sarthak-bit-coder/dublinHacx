import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Report } from '../../lib/types';

interface TrendChartProps {
  reports: Report[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ reports }) => {
  // Aggregate reports by month over past 6 months
  const monthsMap: Record<string, number> = {};

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  months.forEach((m) => (monthsMap[m] = 0));

  reports.forEach((r) => {
    const d = new Date(r.occurredAt);
    const monthName = d.toLocaleString('default', { month: 'short' });
    if (monthsMap[monthName] !== undefined) {
      monthsMap[monthName]++;
    }
  });

  const chartData = Object.entries(monthsMap).map(([month, count]) => ({
    month,
    signals: count,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
        Signal Trend Over Time (Past 6 Months)
      </h4>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="signals" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignals)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
