import React from 'react';
import { THEME, getRiskBadgeStyle } from '../theme';

/**
 * Reusable RiskBadge supporting level or risk prop
 * Low: #16C784, Moderate: #F0B400, High: #FF7518, Very High: #EF4444, Extreme: #7C3AED
 */
export const RiskBadge = ({ risk, level, size = 'md', className = '' }) => {
  const targetLevel = (level || risk || 'LOW').toString().toUpperCase().replace(/_/g, ' ');
  const style = getRiskBadgeStyle(targetLevel);

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-wider',
    sm: 'text-xs px-2.5 py-0.5 font-mono font-bold tracking-wider',
    md: 'text-xs px-3 py-1 font-mono font-bold tracking-wider',
    lg: 'text-sm px-4 py-1.5 font-mono font-bold tracking-widest',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${currentSize} ${className}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          targetLevel === 'EXTREME' || targetLevel === 'CRITICAL'
            ? 'animate-ping-slow'
            : ''
        }`}
        style={{ backgroundColor: style.dot }}
      />
      <span>{targetLevel}</span>
    </span>
  );
};

export const GovStatusBadge = ({ status }) => {
  const norm = (status || 'PENDING').toUpperCase();

  const map = {
    VERIFIED: {
      text: 'VERIFIED GOVERNMENT AUTHORITY',
      bg: 'rgba(22, 199, 132, 0.15)',
      border: '#16C784',
      textCol: '#A7F3D0',
      icon: '✓'
    },
    PENDING: {
      text: 'PENDING ADMINISTRATIVE REVIEW',
      bg: 'rgba(240, 180, 0, 0.15)',
      border: '#F0B400',
      textCol: '#FEF08A',
      icon: '⏳'
    },
    REJECTED: {
      text: 'VERIFICATION REJECTED',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: '#EF4444',
      textCol: '#FECACA',
      icon: '✕'
    },
    NOT_APPLICABLE: {
      text: 'CITIZEN ACCOUNT',
      bg: 'rgba(112, 106, 98, 0.15)',
      border: '#4F3100',
      textCol: '#A59F95',
      icon: '•'
    }
  };

  const config = map[norm] || map.PENDING;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-full border"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.textCol,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};
