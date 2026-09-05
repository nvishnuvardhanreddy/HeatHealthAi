import React from 'react';
import { RiskBadge } from './StatusBadge';
import { ArrowUpRight, ArrowDownRight, Flame, ShieldAlert } from 'lucide-react';

export const HtsiGauge = ({ htsi = 87.2, riskLevel = 'EXTREME', previousHtsi = 82.5, indices = {} }) => {
  const diff = (htsi - previousHtsi).toFixed(1);
  const isIncrease = diff > 0;

  // Calculate SVG circular stroke offset
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, htsi));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine accent color
  const getColor = (val) => {
    if (val <= 20) return '#10B981'; // green
    if (val <= 40) return '#FBBF24'; // amber yellow
    if (val <= 60) return '#F97316'; // orange
    if (val <= 80) return '#EF4444'; // red
    return '#A855F7'; // purple
  };

  const activeColor = getColor(htsi);

  return (
    <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient radial glow */}
      <div
        className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: activeColor }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Core Biometeorological Metric</span>
          <h3 className="text-base font-bold text-cream-50 flex items-center gap-2">
            Human Thermal Stress Index (HTSI)
          </h3>
        </div>
        <RiskBadge risk={riskLevel} size="lg" />
      </div>

      {/* Circular Gauge Centerpiece */}
      <div className="flex flex-col sm:flex-row items-center justify-around my-3 gap-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#292524"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke={activeColor}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Digital Reading */}
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-cream-50">
              {htsi.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-400 font-mono">/ 100</span>
            <div className="mt-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${activeColor}25`, color: activeColor }}
              >
                {riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown of Secondary Metrics */}
        <div className="w-full sm:w-auto flex-1 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-sm">
            <span className="text-xs text-stone-400">Trend vs Prev Reading</span>
            <div className={`flex items-center gap-1 text-xs font-mono font-bold ${isIncrease ? 'text-red-400' : 'text-emerald-400'}`}>
              {isIncrease ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {isIncrease ? `+${diff}` : diff} pts
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-stone-900/70 border border-stone-800 shadow-sm">
              <div className="text-[10px] text-stone-400">HEAT INDEX</div>
              <div className="text-xs font-bold text-cream-100">{indices.heat_index != null ? `${indices.heat_index}°C` : '—'}</div>
            </div>
            <div className="p-2 rounded-xl bg-stone-900/70 border border-stone-800 shadow-sm">
              <div className="text-[10px] text-stone-400">WBGT</div>
              <div className="text-xs font-bold text-cream-100">{indices.wbgt != null ? `${indices.wbgt}°C` : '—'}</div>
            </div>
            <div className="p-2 rounded-xl bg-stone-900/70 border border-stone-800 shadow-sm">
              <div className="text-[10px] text-stone-400">UTCI</div>
              <div className="text-xs font-bold text-cream-100">{indices.utci != null ? `${indices.utci}°C` : '—'}</div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 italic">
            Composite index synthesized from ambient temp, humidity, solar irradiance, convective wind, and demographic vulnerability.
          </p>
        </div>
      </div>
    </div>
  );
};
