import { useTheme } from '../context/ThemeContext';
import { colors, radius } from '../styles/theme';
import Button from './Button';

export default function EmptyState({ emoji = '📭', title = 'Nothing here yet', subtitle = '', action, actionLabel }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 18 }}>
        {emoji}
      </div>
      <p style={{ fontSize: 17, fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 22, maxWidth: 300, lineHeight: 1.65 }}>{subtitle}</p>}
      {action && actionLabel && <Button title={actionLabel} onClick={action} />}
    </div>
  );
}
