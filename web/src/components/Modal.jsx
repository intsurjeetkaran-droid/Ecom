import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadow } from '../styles/theme';

export default function Modal({ open, onClose, title, children, width = 500 }) {
  const { isDark } = useTheme();
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: isDark ? colors.cardDark : colors.white, borderRadius: radius.xl, padding: 28, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: shadow.xl, border: isDark ? `1px solid ${colors.borderDark}` : 'none', animation: 'fadeIn 0.18s ease' }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
            <h2 style={{ fontSize: 17, fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800 }}>{title}</h2>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: isDark ? colors.subtleDark : colors.subtleLight, border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.mutedLight }} onMouseEnter={e => e.currentTarget.style.background = isDark ? colors.borderDark : colors.borderLight} onMouseLeave={e => e.currentTarget.style.background = isDark ? colors.subtleDark : colors.subtleLight}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
