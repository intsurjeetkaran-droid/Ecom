import { colors, radius } from '../styles/theme';

const V = {
  primary: { bg: colors.primary100, text: colors.primary700 },
  accent:  { bg: colors.accent100,  text: colors.accent700  },
  danger:  { bg: '#FEE2E2',         text: colors.danger600  },
  success: { bg: '#D1FAE5',         text: colors.success600 },
  muted:   { bg: colors.subtleLight,text: colors.mutedLight },
  warning: { bg: '#FEF3C7',         text: colors.accent700  },
};

export default function Badge({ label, variant = 'primary', icon, dot, style = {} }) {
  const v = V[variant] || V.primary;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: v.bg, color: v.text,
      padding: '3px 9px', borderRadius: radius.full,
      fontSize: 11, fontWeight: '700',
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: v.text, flexShrink: 0 }} />}
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
