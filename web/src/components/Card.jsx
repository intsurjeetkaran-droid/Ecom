import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadow } from '../styles/theme';

export default function Card({ children, style = {}, onClick, noPad = false }) {
  const { isDark } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isDark ? colors.cardDark  : colors.white,
        border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`,
        borderRadius: radius.lg,
        padding: noPad ? 0 : '18px 20px',
        marginBottom: 14,
        boxShadow: isDark ? 'none' : shadow.sm,
        overflow: noPad ? 'hidden' : 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow 0.15s, transform 0.15s' : 'none',
        ...style,
      }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = isDark ? 'none' : shadow.sm; e.currentTarget.style.transform = 'none'; } : undefined}
    >
      {children}
    </div>
  );
}
