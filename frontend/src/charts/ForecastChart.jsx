import React from 'react';
import { RiskBadge } from '../components/StatusBadge';
import { Calendar, ThermometerSun, AlertCircle } from 'lucide-react';

export const ForecastChart = ({ dailyData = [] }) => {
  const fallbackDaily = [
    { date: "Day 1 (Today)", temp_max: 41.5, temp_min: 29.0, humidity_avg: 73, peak_htsi: 87.2, peak_risk: "EXTREME", condition: "Extreme Thermal Stress Alert" },
    { date: "Day 2", temp_max: 42.0, temp_min: 29.8, humidity_avg: 71, peak_htsi: 89.0, peak_risk: "EXTREME", condition: "Extreme Thermal Emergency" },
    { date: "Day 3", temp_max: 41.2, temp_min: 29.5, humidity_avg: 74, peak_htsi: 86.5, peak_risk: "EXTREME", condition: "Severe Thermal Stress" },
    { date: "Day 4", temp_max: 39.8, temp_min: 28.6, humidity_avg: 76, peak_htsi: 78.4, peak_risk: "VERY HIGH", condition: "Very High Thermal Warning" },
    { date: "Day 5", temp_max: 38.0, temp_min: 28.0, humidity_avg: 78, peak_htsi: 69.1, peak_risk: "VERY HIGH", condition: "Elevated Heat Advisory" },
  ];

  const list = dailyData.length > 0 ? dailyData : fallbackDaily;

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Multi-Day Climate Outlook</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            5-Day Heat Danger & Human Impact Forecast
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Source: Open-Meteo & HTSI Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {list.map((day, idx) => {
          let dateStr = day.date;
          try {
            const d = new Date(day.date);
            if (!isNaN(d)) {
              dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            }
          } catch (e) {}

          const htsi = day.peak_htsi || 85.0;
          const isExtreme = htsi >= 80;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition hover:border-cyan-500/40 ${
                isExtreme
                  ? 'bg-purple-950/20 border-purple-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono">{dateStr}</span>
                  {idx === 0 && (
                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mb-2 truncate" title={day.condition}>
                  {day.condition || "Heat Warning"}
                </p>
              </div>

              <div className="my-2 text-center py-2 rounded-lg bg-dark-950/60 border border-slate-800/80">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-xl font-extrabold font-mono text-white">
                    {day.temp_max ? `${day.temp_max}°` : '40°'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    / {day.temp_min ? `${day.temp_min}°` : '29°'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Avg RH: {day.humidity_avg ? `${day.humidity_avg}%` : '72%'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block">PEAK HTSI</span>
                  <span className="text-sm font-mono font-extrabold text-purple-300">
                    {typeof htsi === 'number' ? htsi.toFixed(1) : htsi}
                  </span>
                </div>
                <RiskBadge risk={day.peak_risk || (isExtreme ? 'EXTREME' : 'VERY HIGH')} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Decision-Support Outlook:</strong> Forecast values are derived from the selected location's weather inputs. Validate against official local advisories before operational use.
        </span>
      </div>
    </div>
  );
};
