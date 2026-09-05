/**
 * HeatHealthAI Central Theme Configuration
 * Nothing Tech Minimalist Gold, Yellow & Cream Intelligence System
 */

export const THEME = {
  colors: {
    primaryBackground: '#080808',
    secondaryBackground: '#121110',
    card: '#171513',
    input: '#100E0D',
    border: '#4F3E1B',
    borderLight: 'rgba(212, 175, 55, 0.22)',
    borderSubtle: 'rgba(212, 175, 55, 0.14)',

    primaryGold: '#D4AF37',
    primaryAmber: '#D4AF37',
    brightYellow: '#F5C842',
    heatOrange: '#E58E26',
    hotCoral: '#DC2626',
    warmCream: '#F7F4EB',

    primaryText: '#F7F4EB',
    secondaryText: '#A39C8E',
    mutedText: '#6B6457',
  },

  riskColors: {
    LOW: '#22C55E',
    MODERATE: '#F5C842',
    HIGH: '#E58E26',
    VERY_HIGH: '#DC2626',
    'VERY HIGH': '#DC2626',
    EXTREME: '#9333EA',
  },

  gradients: {
    thermal: 'linear-gradient(90deg, #F5C842 0%, #E58E26 50%, #DC2626 100%)',
    thermalSubtle: 'linear-gradient(135deg, rgba(245, 200, 66, 0.12) 0%, rgba(229, 142, 38, 0.12) 50%, rgba(220, 38, 38, 0.12) 100%)',
    radialWarmGlow: 'radial-gradient(circle at 75% 20%, rgba(212, 175, 55, 0.09), transparent 35%)',
    primaryButton: 'linear-gradient(135deg, #D4AF37 0%, #F5C842 100%)',
  },

  borderRadius: {
    hero: '20px',
    card: '16px',
    button: '10px',
    pill: '9999px',
  },

  shadows: {
    card: '0 10px 40px rgba(0, 0, 0, 0.45)',
    dropdown: '0 25px 60px -10px rgba(0, 0, 0, 0.98), 0 0 35px rgba(212, 175, 55, 0.15)',
    buttonGlow: '0 0 20px rgba(212, 175, 55, 0.3)',
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
        bg: 'rgba(245, 200, 66, 0.18)',
        border: '#F5C842',
        text: '#FEF08A',
        dot: '#F5C842',
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
