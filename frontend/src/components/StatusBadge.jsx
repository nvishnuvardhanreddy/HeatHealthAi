import React from 'react';

export const RiskBadge = ({ risk, size = 'md' }) => {
  const normalized = (risk || 'LOW').toUpperCase();

  const styles = {
    LOW: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10',
    MODERATE: 'bg-amber-950/70 text-amber-400 border-amber-500/40 shadow-amber-500/10',
    HIGH: 'bg-orange-950/70 text-orange-400 border-orange-500/40 shadow-orange-500/10',
    'VERY HIGH': 'bg-red-950/70 text-red-400 border-red-500/40 shadow-red-500/10',
    EXTREME: 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-purple-500/20 animate-pulse-slow',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide',
  };

  const currentStyle = styles[normalized] || styles.LOW;
  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${currentStyle} ${currentSize}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        normalized === 'EXTREME' ? 'bg-purple-400 animate-ping' :
        normalized === 'VERY HIGH' ? 'bg-red-400' :
        normalized === 'HIGH' ? 'bg-orange-400' :
        normalized === 'MODERATE' ? 'bg-amber-400' : 'bg-emerald-400'
      }`} />
      {normalized}
    </span>
  );
};

export const GovStatusBadge = ({ status }) => {
  const norm = (status || 'PENDING').toUpperCase();

  const map = {
    VERIFIED: {
      text: 'VERIFIED GOVERNMENT AUTHORITY',
      classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      icon: '✓'
    },
    PENDING: {
      text: 'PENDING ADMINISTRATIVE REVIEW',
      classes: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      icon: '⏳'
    },
    REJECTED: {
      text: 'VERIFICATION REJECTED',
      classes: 'bg-red-950/80 text-red-300 border-red-500/50',
      icon: '✕'
    },
    NOT_APPLICABLE: {
      text: 'CITIZEN ACCOUNT',
      classes: 'bg-slate-800/80 text-slate-300 border-slate-700',
      icon: '•'
    }
  };

  const config = map[norm] || map.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.classes}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};
