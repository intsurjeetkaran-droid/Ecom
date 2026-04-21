import { colors } from '../styles/theme';

export function Spinner({ size = 28, color = colors.primary600 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      border: `3px solid ${color}22`,
      borderTopColor: color,
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export default function Loader({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', gap: 14 }}>
      <Spinner size={36} />
      <p style={{ color: colors.mutedLight, fontSize: 13 }}>{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.borderLight}`, borderRadius: 14, overflow: 'hidden' }}>
      <div className="shimmer" style={{ height: 180 }} />
      <div style={{ padding: '12px 14px' }}>
        <div className="shimmer" style={{ height: 13, borderRadius: 6, marginBottom: 8 }} />
        <div className="shimmer" style={{ height: 11, borderRadius: 6, width: '55%' }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
      <div className="shimmer" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="shimmer" style={{ height: 13, borderRadius: 6, marginBottom: 6, width: '60%' }} />
        <div className="shimmer" style={{ height: 11, borderRadius: 6, width: '40%' }} />
      </div>
    </div>
  );
}
