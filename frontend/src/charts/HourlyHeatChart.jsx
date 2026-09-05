import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const HourlyHeatChart = ({ hourlyData = [] }) => {
  // Format times for display
  const formattedData = hourlyData.slice(0, 16).map((item) => {
    let timeLabel = item.time;
    try {
      const d = new Date(item.time);
      timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {}

    return {
      time: timeLabel,
      temperature: item.temperature,
      htsi: item.htsi || (item.temperature > 38 ? 85 : (item.temperature > 34 ? 68 : 45)),
      humidity: item.humidity,
      wbgt: item.wbgt || (item.temperature * 0.85),
    };
  });

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Diurnal Thermal Profile</span>
          <h3 className="text-base font-bold text-cream-50">Next 48 Hours Heat Stress Trajectory</h3>
        </div>
        <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
          Peak Window: 12:00 – 16:00
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="htsiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis dataKey="time" stroke="#78716C" tick={{ fontSize: 11 }} />
            <YAxis stroke="#78716C" tick={{ fontSize: 11 }} domain={[20, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1917',
                border: '1px solid #44403C',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#FEF3C7'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Area
              type="monotone"
              dataKey="htsi"
              name="HTSI Stress Index"
              stroke="#A855F7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#htsiGrad)"
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Ambient Temp (°C)"
              stroke="#F97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-stone-400 font-mono">
        <span>Danger Threshold: HTSI &ge; 60 (High) | &ge; 80 (Extreme)</span>
        <span className="text-purple-400 font-semibold">● Severe Radiation Peak expected midday</span>
      </div>
    </div>
  );
};
