import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBuyerOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, STATUS_CONFIG } from '../../styles/theme';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

const STATUS_VARIANT = {
  initiated:       'muted',
  payment_pending: 'warning',
  paid:            'success',
  completed:       'primary',
  failed:          'danger',
  cancelled:       'muted',
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    getBuyerOrders().then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: '800', color: isDark ? colors.textOnDark : colors.slate800, letterSpacing: '-0.02em' }}>My Orders</h1>
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14, marginTop: 4 }}>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState emoji="🛒" title="No orders yet" subtitle="Browse products and place your first order" action={() => navigate('/')} actionLabel="Browse Products" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;
            return (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                style={{
                  backgroundColor: isDark ? colors.cardDark : colors.white,
                  border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`,
                  borderRadius: radius.lg, padding: '18px 20px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = colors.primary200; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = isDark ? colors.borderDark : colors.borderLight; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 16 }}>
                    <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>{order.product?.title}</p>
                    <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 20 }}>₹{order.amount?.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                    <div style={{ marginTop: 6 }}>
                      <Badge label={cfg.label} variant={STATUS_VARIANT[order.status] || 'muted'} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>Seller: <strong style={{ color: isDark ? colors.mutedDark : colors.textDark }}>{order.seller?.name}</strong></span>
                    <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span style={{ color: colors.primary600, fontSize: 13, fontWeight: '600' }}>View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
