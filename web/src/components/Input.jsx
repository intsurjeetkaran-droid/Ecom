import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, radius } from '../styles/theme';

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Input({
  label, error, hint,
  type = 'text',
  style = {}, containerStyle = {},
  prefix, suffix, rows,
  ...props
}) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { isDark } = useTheme();

  const isPassword  = type === 'password';
  const resolvedType = isPassword ? (showPass ? 'text' : 'password') : type;

  // padding: left for prefix, right for eye-toggle or suffix
  const paddingLeft  = prefix ? '36px' : '12px';
  const paddingRight = isPassword || suffix ? '40px' : '12px';

  const borderColor = error ? colors.danger500 : focused ? colors.primary500 : (isDark ? colors.borderDark : colors.borderLight);
  const boxShadow   = focused ? `0 0 0 3px ${error ? colors.danger500 : colors.primary500}18` : 'none';

  const baseStyle = {
    width: '100%',
    padding: `9px ${paddingRight} 9px ${paddingLeft}`,
    fontSize: 14,
    borderRadius: radius.md,
    border: `1.5px solid ${borderColor}`,
    outline: 'none',
    backgroundColor: isDark ? colors.cardDark : colors.white,
    color: isDark ? colors.textOnDark : colors.slate800,
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
    boxShadow,
    lineHeight: 1.5,
    ...style,
  };

  return (
    <div style={{ marginBottom: 16, ...containerStyle }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: isDark ? colors.mutedDark : colors.textDark, marginBottom: 5, letterSpacing: '0.01em' }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: rows ? 'flex-start' : 'center' }}>
        {/* Left prefix icon */}
        {prefix && (
          <span style={{ position: 'absolute', left: 11, color: colors.mutedLight, fontSize: 14, pointerEvents: 'none', top: rows ? 10 : '50%', transform: rows ? 'none' : 'translateY(-50%)', zIndex: 1 }}>
            {prefix}
          </span>
        )}

        {/* Input / Textarea */}
        {rows ? (
          <textarea
            rows={rows}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ ...baseStyle, resize: 'vertical', minHeight: rows * 24 + 18 }}
            {...props}
          />
        ) : (
          <input
            type={resolvedType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={baseStyle}
            {...props}
          />
        )}

        {/* Right: password toggle OR custom suffix */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            tabIndex={-1}
            style={{
              position: 'absolute', right: 11,
              top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 2,
              color: focused ? colors.primary500 : (isDark ? colors.mutedDark : colors.mutedLight),
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.primary500}
            onMouseLeave={e => e.currentTarget.style.color = focused ? colors.primary500 : (isDark ? colors.mutedDark : colors.mutedLight)}
            title={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff /> : <EyeOpen />}
          </button>
        ) : suffix ? (
          <span style={{ position: 'absolute', right: 11, color: colors.mutedLight, fontSize: 14, pointerEvents: 'none' }}>
            {suffix}
          </span>
        ) : null}
      </div>

      {error && (
        <p style={{ color: colors.danger500, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}
