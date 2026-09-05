/**
 * HeatHealthAI Central Theme Configuration
 * Mission-Control Dark Thermal Intelligence System
 */

export const THEME = {
  colors: {
    primaryBackground: '#0C0A09',
    secondaryBackground: '#161311',
    card: '#14110F',
    input: '#100E0D',
    border: '#4F3100',
    borderLight: 'rgba(245, 169, 0, 0.18)',
    borderSubtle: 'rgba(245, 169, 0, 0.12)',

    primaryAmber: '#F5A900',
    brightYellow: '#FFD34D',
    heatOrange: '#FF9F3D',
    hotCoral: '#FF7568',

    primaryText: '#F5F0E8',
    secondaryText: '#A59F95',
    mutedText: '#706A62',
  },

  riskColors: {
    LOW: '#16C784',
    MODERATE: '#F0B400',
    HIGH: '#FF7518',
    VERY_HIGH: '#EF4444',
    'VERY HIGH': '#EF4444',
    EXTREME: '#7C3AED',
  },

  gradients: {
    thermal: 'linear-gradient(90deg, #FFD34D 0%, #FF9F3D 50%, #FF7568 100%)',
    thermalSubtle: 'linear-gradient(135deg, rgba(255, 211, 77, 0.12) 0%, rgba(255, 159, 61, 0.12) 50%, rgba(255, 117, 104, 0.12) 100%)',
    radialWarmGlow: 'radial-gradient(circle at 75% 20%, rgba(245, 169, 0, 0.08), transparent 35%)',
    primaryButton: 'linear-gradient(135deg, #F5A900 0%, #FFB300 100%)',
  },

  borderRadius: {
    hero: '20px',
    card: '16px',
    button: '10px',
    pill: '9999px',
  },

  shadows: {
    card: '0 10px 40px rgba(0, 0, 0, 0.25)',
    dropdown: '0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 169, 0, 0.1)',
    buttonGlow: '0 0 20px rgba(245, 169, 0, 0.3)',
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
        bg: 'rgba(124, 58, 237, 0.18)',
        border: '#7C3AED',
        text: '#DDD6FE',
        dot: '#7C3AED',
      };
    case 'VERY HIGH':
      return {
        bg: 'rgba(239, 68, 68, 0.18)',
        border: '#EF4444',
        text: '#FECACA',
        dot: '#EF4444',
      };
    case 'HIGH':
      return {
        bg: 'rgba(255, 117, 24, 0.18)',
        border: '#FF7518',
        text: '#FFEDD5',
        dot: '#FF7518',
      };
    case 'MODERATE':
      return {
        bg: 'rgba(240, 180, 0, 0.18)',
        border: '#F0B400',
        text: '#FEF08A',
        dot: '#F0B400',
      };
    case 'LOW':
    default:
      return {
        bg: 'rgba(22, 199, 132, 0.18)',
        border: '#16C784',
        text: '#A7F3D0',
        dot: '#16C784',
      };
  }
};
