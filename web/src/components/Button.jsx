import { useState } from 'react';
import { colors, radius } from '../styles/theme';

const V = {
  primary: { bg: colors.primary600, hover: colors.primary700, text: colors.white,      border: 'none',                                  shadow: `0 2px 8px ${colors.primary600}40` },
  accent:  { bg: colors.accent500,  hover: colors.accent600,  text: colors.white,      border: 'none',                                  shadow: `0 2px 8px ${colors.accent500}40`  },
  danger:  { bg: colors.danger500,  hover: colors.danger600,  text: colors.white,      border: 'none',                                  shadow: `0 2px 8px ${colors.danger500}40`  },
  success: { bg: colors.success500, hover: colors.success600, text: colors.white,      border: 'none',                                  shadow: `0 2px 8px ${colors.success500}40` },
  outline: { bg: 'transparent',     hover: colors.primary50,  text: colors.primary600, border: `1.5px solid ${colors.primary600}`,      shadow: 'none' },
  ghost:   { bg: 'transparent',     hover: colors.subtleLight,text: colors.primary600, border: 'none',                                  shadow: 'none' },
  subtle:  { bg: colors.subtleLight,hover: colors.borderLight,text: colors.textDark,   border: `1px solid ${colors.borderLight}`,       shadow: 'none' },
};

const SIZES = {
  sm: { padding: '6px 14px',  fontSize: 12, height: 30, gap: 5 },
  md: { padding: '9px 18px',  fontSize: 14, height: 38, gap: 6 },
  lg: { padding: '12px 24px', fontSize: 15, height: 44, gap: 8 },
};

export default function Button({ title, onClick, variant = 'primary', loading = false, disabled = false, style = {}, fullWidth = false, size = 'md', icon }) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const v  = V[variant] || V.primary;
  const sz = SIZES[size] || SIZES.md;
  const off = disabled || loading;

  return (
    <button
      onClick={!off ? onClick : undefined}
      disabled={off}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => setAct(true)}
      onMouseUp={() => setAct(false)}
      style={{
        backgroundColor: act && !off ? v.hover : hov && !off ? v.hover : v.bg,
        color: v.text,
        border: v.border || 'none',
        borderRadius: radius.md,
        padding: sz.padding,
        fontSize: sz.fontSize,
        fontWeight: '600',
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        transition: 'background-color 0.12s, box-shadow 0.12s, transform 0.1s',
        boxShadow: hov && !off ? v.shadow : 'none',
        transform: act && !off ? 'scale(0.98)' : 'scale(1)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...style,
      }}
    >
      {loading
        ? <span style={{ width: sz.fontSize, height: sz.fontSize, border: `2px solid ${v.text}40`, borderTopColor: v.text, borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block', flexShrink: 0 }} />
        : icon
          ? <><span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span><span>{title}</span></>
          : title
      }
    </button>
  );
}
