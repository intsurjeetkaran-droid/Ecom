/**
 * Global Theme — Colors & Spacing
 * Deep Teal primary · Amber accent · Rose danger · Emerald success
 */

export const colors = {
  // Primary: Deep Teal
  primary50:  '#F0FDFA',
  primary100: '#CCFBF1',
  primary200: '#99F6E4',
  primary400: '#2DD4BF',
  primary500: '#14B8A6',
  primary600: '#0D9488',
  primary700: '#0F766E',
  primary800: '#115E59',
  primary900: '#134E4A',

  // Accent: Amber
  accent50:  '#FFFBEB',
  accent100: '#FEF3C7',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',
  accent600: '#D97706',
  accent700: '#B45309',
  accent900: '#78350F',

  // Danger: Rose
  danger400: '#FB7185',
  danger500: '#F43F5E',
  danger600: '#E11D48',

  // Success: Emerald
  success400: '#34D399',
  success500: '#10B981',
  success600: '#059669',

  // Light surfaces
  bgLight:     '#F8FAFC',
  cardLight:   '#FFFFFF',
  borderLight: '#E2E8F0',
  mutedLight:  '#94A3B8',
  subtleLight: '#F1F5F9',
  textLight:   '#1E293B',
  textDark:    '#475569',

  // Dark surfaces
  bgDark:     '#0F172A',
  cardDark:   '#1E293B',
  borderDark: '#334155',
  mutedDark:  '#64748B',
  subtleDark: '#1E293B',
  textOnDark: '#F1F5F9',

  white: '#FFFFFF',
  black: '#000000',
  
  // Slate colors for text
  slate800: '#1E293B',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 9999,
};

export const fontSize = {
  xs:   11,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  huge: 32,
};

// Helper function to get role-specific styles
export const getRoleStyles = (role, isDark = false) => {
  const styles = {
    buyer: {
      bg: isDark ? colors.primary900 : colors.primary100,
      text: isDark ? colors.primary200 : colors.primary700,
    },
    seller: {
      bg: isDark ? colors.accent900 : colors.accent100,
      text: isDark ? colors.accent300 : colors.accent700,
    },
    admin: {
      bg: colors.danger500,
      text: colors.white,
    },
  };
  return styles[role] || styles.buyer;
};
