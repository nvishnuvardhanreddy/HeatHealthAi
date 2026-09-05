/**
 * HeatHealthAI Central Theme Configuration
 * Dark Violet & Lavender Intelligence System — Team Ground Zero
 */

export const THEME = {
  colors: {
    primaryBackground: '#0A080F',
    secondaryBackground: '#110D1A',
    card: '#160F22',
    input: '#0E0918',
    border: '#3B2D5A',
    borderLight: 'rgba(167, 139, 250, 0.22)',
    borderSubtle: 'rgba(167, 139, 250, 0.14)',

    primaryViolet: '#7C3AED',
    primaryLavender: '#A78BFA',
    brightLavender: '#C4B5FD',
    accentPurple: '#9333EA',
    hotCoral: '#DC2626',
    softWhite: '#EDE9FF',

    primaryText: '#EDE9FF',
    secondaryText: '#A094C0',
    mutedText: '#6B5F8A',
  },

  riskColors: {
    LOW: '#22C55E',
    MODERATE: '#A78BFA',
    HIGH: '#E58E26',
    VERY_HIGH: '#DC2626',
    'VERY HIGH': '#DC2626',
    EXTREME: '#9333EA',
  },

  gradients: {
    thermal: 'linear-gradient(90deg, #A78BFA 0%, #7C3AED 50%, #DC2626 100%)',
    thermalSubtle: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(124, 58, 237, 0.12) 50%, rgba(220, 38, 38, 0.12) 100%)',
    radialWarmGlow: 'radial-gradient(circle at 75% 20%, rgba(124, 58, 237, 0.12), transparent 35%)',
    primaryButton: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
  },

  borderRadius: {
    hero: '20px',
    card: '16px',
    button: '10px',
    pill: '9999px',
  },

  shadows: {
    card: '0 10px 40px rgba(0, 0, 0, 0.55)',
    dropdown: '0 25px 60px -10px rgba(0, 0, 0, 0.98), 0 0 35px rgba(124, 58, 237, 0.18)',
    buttonGlow: '0 0 20px rgba(124, 58, 237, 0.4)',
  },
};

/**
 * Standardized helper to get risk color by string or score
 */
export const getRiskColor = (riskOrHtsi) => {
  if (typeof riskOrHtsi === 'number') {
    if (riskOrHtsi < 20) return THEME.riskColors.LOW;
    if (riskOrHtsi < 40) return THEME.riskColors.MODERATE;
    if (riskOrHtsi < 60) return THEME.riskColors.HIGH;
    if (riskOrHtsi < 80) return THEME.riskColors.VERY_HIGH;
    return THEME.riskColors.EXTREME;
  }

  const norm = String(riskOrHtsi || 'LOW').toUpperCase().replace(/_/g, ' ');
  return THEME.riskColors[norm] || THEME.riskColors.LOW;
};

/**
 * Standardized helper to get risk background & border styling
 */
export const getRiskBadgeStyle = (risk) => {
  const norm = String(risk || 'LOW').toUpperCase().replace(/_/g, ' ');
  switch (norm) {
    case 'EXTREME':
      return {
        bg: 'rgba(147, 51, 234, 0.18)',
        border: '#9333EA',
        text: '#E9D5FF',
        dot: '#9333EA',
      };
    case 'VERY HIGH':
      return {
        bg: 'rgba(220, 38, 38, 0.18)',
        border: '#DC2626',
        text: '#FCA5A5',
        dot: '#DC2626',
      };
    case 'HIGH':
      return {
        bg: 'rgba(229, 142, 38, 0.18)',
        border: '#E58E26',
        text: '#FFEDD5',
        dot: '#E58E26',
      };
    case 'MODERATE':
      return {
        bg: 'rgba(167, 139, 250, 0.18)',
        border: '#A78BFA',
        text: '#DDD6FE',
        dot: '#A78BFA',
      };
    case 'LOW':
    default:
      return {
        bg: 'rgba(34, 197, 94, 0.18)',
        border: '#22C55E',
        text: '#BBF7D0',
        dot: '#22C55E',
      };
  }
};
