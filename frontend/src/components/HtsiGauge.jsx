import React from 'react';
import { RiskBadge } from './StatusBadge';
import { ArrowUpRight, ArrowDownRight, Flame } from 'lucide-react';
import { THEME, getRiskColor } from '../theme';

export const HtsiGauge = ({ htsi = 87.2, riskLevel = 'EXTREME', previousHtsi = 82.5, indices = {} }) => {
  const numericHtsi = Number(htsi ?? 0);
  const diff = (numericHtsi - Number(previousHtsi ?? numericHtsi)).toFixed(1);
  const isIncrease = Number(diff) > 0;

  // Calculate SVG circular stroke offset
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, numericHtsi));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get standardized risk color from central theme
  const activeColor = getRiskColor(riskLevel || numericHtsi);

  return (
    <div className="mission-card p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Background ambient subtle glow */}
      <div
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: activeColor }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A59F95]">
            Core Biometeorological Metric
          </span>
          <h3 className="text-base font-bold text-[#F5F0E8]">
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
              stroke="#1C1815"
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
          <div className="absolute text-center flex flex-col items-center font-mono">
            <span className="text-4xl font-extrabold tracking-tight text-[#F5F0E8]">
              {numericHtsi.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-[#A59F95]">/ 100</span>
            <div className="mt-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${activeColor}22`, color: activeColor }}
              >
                {riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown of Secondary Metrics */}
        <div className="w-full sm:w-auto flex-1 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-[#100E0D] border border-[#4F3100] flex items-center justify-between shadow-sm">
            <span className="text-xs text-[#A59F95]">Trend vs Prev Reading</span>
            <div className={`flex items-center gap-1 text-xs font-mono font-bold ${isIncrease ? 'text-[#EF4444]' : 'text-[#16C784]'}`}>
              {isIncrease ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {isIncrease ? `+${diff}` : diff} pts
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-[#100E0D] border border-[#4F3100] shadow-sm">
              <div className="text-[10px] text-[#706A62]">HEAT INDEX</div>
              <div className="text-xs font-bold text-[#F5F0E8]">{indices.heat_index != null ? `${indices.heat_index}°C` : '—'}</div>
            </div>
            <div className="p-2 rounded-xl bg-[#100E0D] border border-[#4F3100] shadow-sm">
              <div className="text-[10px] text-[#706A62]">WBGT</div>
              <div className="text-xs font-bold text-[#F5F0E8]">{indices.wbgt != null ? `${indices.wbgt}°C` : '—'}</div>
            </div>
            <div className="p-2 rounded-xl bg-[#100E0D] border border-[#4F3100] shadow-sm">
              <div className="text-[10px] text-[#706A62]">UTCI</div>
              <div className="text-xs font-bold text-[#F5F0E8]">{indices.utci != null ? `${indices.utci}°C` : '—'}</div>
            </div>
          </div>

          <p className="text-[11px] text-[#A59F95] leading-relaxed">
            Composite thermal stress derived from: <strong className="text-[#F5F0E8]">Temperature, Humidity, Wind, Solar Radiation</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
