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
import { THEME } from '../theme';

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
    <div className="mission-card p-6 border border-[#4F3100]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A59F95]">
            Diurnal Thermal Profile
          </span>
          <h3 className="text-base font-bold text-[#F5F0E8]">Next 48 Hours Heat Stress Trajectory</h3>
        </div>
        <span className="text-xs font-mono text-[#FFD34D] bg-[rgba(245,169,0,0.12)] px-2.5 py-1 rounded-lg border border-[#4F3100]">
          Peak Window: 12:00 – 16:00
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="htsiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7518" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF7518" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D241E" vertical={false} />
            <XAxis dataKey="time" stroke="#706A62" tick={{ fontSize: 11 }} />
            <YAxis stroke="#706A62" tick={{ fontSize: 11 }} domain={[20, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#14110F',
                border: '1px solid #4F3100',
                borderRadius: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#F5F0E8'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Area
              type="monotone"
              dataKey="htsi"
              name="HTSI Stress Index"
              stroke="#7C3AED"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#htsiGrad)"
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Ambient Temp (°C)"
              stroke="#FF7518"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#A59F95] font-mono">
        <span>Danger Threshold: HTSI &ge; 60 (High) | &ge; 80 (Extreme)</span>
        <span className="text-purple-400 font-semibold">● Midday Solar-Humidity Peak</span>
      </div>
    </div>
  );
};
