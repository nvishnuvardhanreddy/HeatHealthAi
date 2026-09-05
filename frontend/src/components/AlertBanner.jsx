import React from 'react';
import { AlertOctagon, CheckCircle2, Bell, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './StatusBadge';
import { THEME, getRiskColor } from '../theme';

export const AlertBanner = ({ alert = null, onEnableNotifications }) => {
  if (!alert) {
    return (
      <div className="p-4 rounded-2xl bg-[#14110F] border border-[#4F3100] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#161311] border border-[#16C784]/40 flex items-center justify-center text-[#16C784]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F5F0E8]">Thermal Monitoring Active</h4>
            <p className="text-[11px] text-[#A59F95]">Continuous localized early warning monitoring enabled for your area.</p>
          </div>
        </div>
        {onEnableNotifications && (
          <button
            onClick={onEnableNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#161311] hover:bg-[#1E1915] border border-[#4F3100] hover:border-[#F5A900] text-[#FFD34D] transition"
          >
            <Bell className="h-3.5 w-3.5" />
            Enable Alerts
          </button>
        )}
      </div>
    );
  }

  const riskKey = (alert.risk_level || 'HIGH').toUpperCase();
  const isExtreme = riskKey === 'EXTREME' || (alert.htsi && alert.htsi >= 80);
  const isCritical = riskKey === 'EXTREME' || riskKey === 'VERY HIGH';
  const riskColor = getRiskColor(riskKey);

  return (
    <div
      className={`p-5 rounded-2xl border relative overflow-hidden shadow-xl bg-[#14110F] transition-all duration-300 ${
        isCritical ? 'border-[#EF4444]/60 animate-pulse-slow' : 'border-[#4F3100]'
      }`}
      style={{
        boxShadow: `0 10px 30px rgba(0,0,0,0.4), 0 0 20px ${riskColor}15`,
      }}
    >
      {/* Beacon top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: riskColor }}
      />

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="p-2.5 rounded-xl mt-0.5 border shadow-sm"
            style={{
              backgroundColor: `${riskColor}15`,
              borderColor: `${riskColor}40`,
              color: riskColor,
            }}
          >
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-extrabold text-[#F5F0E8] tracking-wide">
                {alert.title || 'THERMAL STRESS EMERGENCY ALERT'}
              </h3>
              <RiskBadge risk={alert.risk_level || 'EXTREME'} size="sm" />
            </div>
            <p className="text-xs text-[#A59F95] leading-relaxed max-w-2xl">
              {alert.message || 'Current location is experiencing severe thermal stress conditions. Immediate biometeorological protective protocols recommended.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 font-mono">
          <span className="text-[10px] text-[#A59F95] uppercase font-bold">LOCALIZED HTSI</span>
          <span className="text-2xl font-extrabold" style={{ color: riskColor }}>
            {alert.htsi ? alert.htsi.toFixed(1) : '87.2'}
            <span className="text-xs text-[#A59F95] font-sans">/100</span>
          </span>
        </div>
      </div>

      {/* Recommended Actions */}
      {alert.recommended_actions && alert.recommended_actions.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-[#4F3100]">
          <span className="text-[11px] font-mono uppercase font-semibold text-[#FFD34D] tracking-wider mb-2 block">
            Recommended Immediate Actions:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A59F95]">
            {alert.recommended_actions.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-[#161311] p-2.5 rounded-xl border border-[#4F3100] text-[#F5F0E8]"
              >
                <span className="text-[#F5A900] font-bold">•</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
