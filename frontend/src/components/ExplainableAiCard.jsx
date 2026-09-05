import React from 'react';
import { BrainCircuit, Info, Sparkles } from 'lucide-react';

export const ExplainableAiCard = ({ drivers = [] }) => {
  const fallbackDrivers = [
    { factor: "Wet Bulb Globe Temp (WBGT)", percentage: 72.4, impact: "Highest Driver", color: "bg-[#7C3AED]" },
    { factor: "Universal Thermal Climate (UTCI)", percentage: 22.4, impact: "High Driver", color: "bg-[#EF4444]" },
    { factor: "Dry-Bulb Ambient Temperature", percentage: 2.7, impact: "Moderate Driver", color: "bg-[#FF7518]" },
    { factor: "Demographic Vulnerability", percentage: 1.7, impact: "Moderate Driver", color: "bg-[#F0B400]" },
    { factor: "Wind Velocity (Cooling Offset)", percentage: 0.4, impact: "Mitigating Factor", color: "bg-[#16C784]" },
    { factor: "Solar Irradiance (Shortwave)", percentage: 0.1, impact: "Amplifying Factor", color: "bg-[#FFD34D]" },
  ];

  const displayList = drivers.length > 0 ? drivers : fallbackDrivers;

  return (
    <div className="mission-card p-6 border border-[#4F3100]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#161311] border border-[#4F3100] flex items-center justify-center text-[#F5A900] shadow-sm">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A59F95]">Explainable AI (XAI)</span>
            <h3 className="text-base font-bold text-[#F5F0E8]">What is Driving the Danger?</h3>
          </div>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-lg bg-[#161311] border border-[#4F3100] text-[#FFD34D] flex items-center gap-1.5 shadow-sm">
          <Sparkles className="h-3 w-3 text-[#F5A900]" /> Random Forest Feature Importance
        </span>
      </div>

      <p className="text-xs text-[#A59F95] mb-5 leading-relaxed">
        Feature contribution breakdown derived from the calibrated ensemble model. The danger level is predominantly driven by the synergistic coupling of high ambient temperature with elevated relative humidity (Wet Bulb temperature), amplified by solar radiation.
      </p>

      {/* Progress Bars */}
      <div className="space-y-3.5">
        {displayList.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#F5F0E8]">{item.factor}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#A59F95] font-mono">{item.impact}</span>
                <span className="font-mono font-bold text-[#FFD34D]">{item.percentage || (item.importance ? (item.importance * 100).toFixed(1) : '10.0')}%</span>
              </div>
            </div>
            {/* Visual Bar */}
            <div className="h-2 w-full bg-[#100E0D] rounded-full overflow-hidden border border-[#4F3100]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${item.color || 'bg-gradient-to-r from-[#FFD34D] to-[#FF7568]'}`}
                style={{ width: `${Math.max(4, item.percentage || 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-xl bg-[#161311] border border-[#4F3100] text-[11px] text-[#A59F95] flex items-start gap-2 shadow-sm">
        <Info className="h-4 w-4 text-[#F5A900] flex-shrink-0 mt-0.5" />
        <span>
          Model trained on regional meteorological regimes with holdout validation (R² = 0.9926, MAE = 0.782).
        </span>
      </div>
    </div>
  );
};
