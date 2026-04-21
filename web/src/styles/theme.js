// Web Theme — matches frontend/src/styles/theme.js exactly

export const colors = {
  primary50:  '#F0FDFA',
  primary100: '#CCFBF1',
  primary200: '#99F6E4',
  primary400: '#2DD4BF',
  primary500: '#14B8A6',
  primary600: '#0D9488',
  primary700: '#0F766E',
  primary800: '#115E59',
  primary900: '#134E4A',

  accent50:  '#FFFBEB',
  accent100: '#FEF3C7',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',
  accent600: '#D97706',
  accent700: '#B45309',
  accent900: '#78350F',

  danger400: '#FB7185',
  danger500: '#F43F5E',
  danger600: '#E11D48',

  success400: '#34D399',
  success500: '#10B981',
  success600: '#059669',

  bgLight:     '#F1F5F9',
  cardLight:   '#FFFFFF',
  borderLight: '#E2E8F0',
  mutedLight:  '#94A3B8',
  subtleLight: '#F8FAFC',
  textLight:   '#1E293B',
  textDark:    '#475569',

  bgDark:     '#0F172A',
  cardDark:   '#1E293B',
  borderDark: '#334155',
  mutedDark:  '#64748B',
  subtleDark: '#1E293B',
  textOnDark: '#F1F5F9',

  white: '#FFFFFF',
  black: '#000000',
  slate800: '#1E293B',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius  = { sm: 6, md: 10, lg: 14, xl: 18, xxl: 24, full: 9999 };
export const fontSize = { xs: 11, sm: 12, base: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 28, huge: 32 };

export const shadow = {
  sm:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md:  '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  lg:  '0 10px 28px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
  xl:  '0 20px 48px rgba(0,0,0,0.14)',
};

export const getRoleStyles = (role) => {
  const map = {
    buyer:  { bg: colors.primary100, text: colors.primary700 },
    seller: { bg: colors.accent100,  text: colors.accent700  },
    admin:  { bg: '#FEE2E2',         text: colors.danger600  },
  };
  return map[role] || map.buyer;
};

export const STATUS_CONFIG = {
  initiated:       { icon: '🛒', color: colors.mutedLight,  label: 'Initiated'            },
  payment_pending: { icon: '⏳', color: colors.accent600,   label: 'Pending Verification' },
  paid:            { icon: '✅', color: colors.success600,  label: 'Paid'                 },
  completed:       { icon: '🎉', color: colors.primary600,  label: 'Completed'            },
  failed:          { icon: '❌', color: colors.danger500,   label: 'Failed'               },
  cancelled:       { icon: '🚫', color: colors.mutedLight,  label: 'Cancelled'            },
};

// Shared page wrapper style
export const pageStyle = {
  padding: '28px 32px',
  maxWidth: 1200,
  margin: '0 auto',
};

export const pageTitleStyle = {
  fontSize: 24,
  fontWeight: '800',
  color: colors.slate800,
  letterSpacing: '-0.02em',
  marginBottom: 4,
};

export const pageSubtitleStyle = {
  color: colors.mutedLight,
  fontSize: 13,
  marginBottom: 24,
};
