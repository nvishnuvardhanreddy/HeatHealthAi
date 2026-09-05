import React from 'react';
import { AlertOctagon, CheckCircle2, Bell, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './StatusBadge';

export const AlertBanner = ({ alert = null, onEnableNotifications }) => {
  if (!alert) {
    return (
      <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-cream-100">Thermal Monitoring Active</h4>
            <p className="text-[11px] text-stone-400">Continuous localized early warning monitoring enabled for your area.</p>
          </div>
        </div>
        {onEnableNotifications && (
          <button
            onClick={onEnableNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 transition"
          >
            <Bell className="h-3.5 w-3.5" />
            Enable Alerts
          </button>
        )}
      </div>
    );
  }

  const isExtreme = alert.risk_level === 'EXTREME' || alert.htsi >= 80;

  return (
    <div className={`p-5 rounded-2xl border relative overflow-hidden shadow-xl ${
      isExtreme
        ? 'bg-purple-950/40 border-purple-500/50 shadow-purple-900/20 animate-pulse-slow'
        : 'bg-orange-950/40 border-orange-500/40 shadow-orange-900/20'
    }`}>
      {/* Beacon bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isExtreme ? 'bg-purple-500' : 'bg-orange-500'}`} />

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl mt-0.5 ${
            isExtreme ? 'bg-purple-900/60 text-purple-300 border border-purple-400/40' : 'bg-orange-900/60 text-orange-300 border border-orange-400/40'
          }`}>
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-extrabold text-cream-50 tracking-wide">
                {alert.title || 'EXTREME HEAT EMERGENCY ALERT'}
              </h3>
              <RiskBadge risk={alert.risk_level || 'EXTREME'} size="sm" />
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
              {alert.message || 'Your current location is experiencing extreme thermal stress conditions. Immediate biometeorological protective protocols recommended.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 font-mono">
          <span className="text-[10px] text-stone-400 uppercase">LOCALIZED HTSI</span>
          <span className="text-2xl font-extrabold text-cream-50">
            {alert.htsi ? alert.htsi.toFixed(1) : '87.2'}
            <span className="text-xs text-stone-400 font-sans">/100</span>
          </span>
        </div>
      </div>

      {/* Recommended Actions */}
      {alert.recommended_actions && alert.recommended_actions.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-stone-800/80">
          <span className="text-[11px] font-mono uppercase font-semibold text-cream-200 tracking-wider mb-2 block">
            Recommended Immediate Actions:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
            {alert.recommended_actions.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-stone-900/70 p-2.5 rounded-xl border border-stone-800/80">
                <span className="text-amber-400 font-bold">•</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
