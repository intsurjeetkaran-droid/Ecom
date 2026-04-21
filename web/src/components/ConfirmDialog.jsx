import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadow } from '../styles/theme';
import Button from './Button';

export default function ConfirmDialog({ dialog, onClose }) {
  const { isDark } = useTheme();

  if (!dialog) return null;

  const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, icon } = dialog;

  const cardBg = isDark ? colors.cardDark : colors.white;
  const textMain = isDark ? colors.textOnDark : colors.slate800;
  const textMuted = isDark ? colors.mutedDark : colors.mutedLight;

  const iconBg = variant === 'danger' ? (isDark ? '#7F1D1D' : '#FEE2E2') :
                 variant === 'success' ? (isDark ? '#14532D' : '#D1FAE5') :
                 variant === 'warning' ? (isDark ? '#78350F' : '#FEF3C7') :
                 isDark ? colors.primary900 : colors.primary100;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: 16,
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: cardBg,
          borderRadius: radius.xl,
          padding: '26px 26px 22px',
          width: '100%', maxWidth: 400,
          boxShadow: shadow.xl,
          animation: 'fadeIn 0.18s ease',
          border: isDark ? `1px solid ${colors.borderDark}` : 'none',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: '50%',
          backgroundColor: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 23, margin: '0 auto 14px',
        }}>
          {icon || (variant === 'danger' ? '🗑️' : variant === 'success' ? '✅' : variant === 'warning' ? '⚠️' : 'ℹ️')}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 17, fontWeight: '700', color: textMain,
          textAlign: 'center', marginBottom: 7, letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p style={{
            fontSize: 14, color: textMuted,
            textAlign: 'center', lineHeight: 1.6, marginBottom: 22,
          }}>
            {message}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {cancelLabel && (
            <Button
              title={cancelLabel}
              variant="subtle"
              onClick={onClose}
              fullWidth
            />
          )}
          <Button
            title={confirmLabel}
            variant={variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : 'primary'}
            onClick={handleConfirm}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
