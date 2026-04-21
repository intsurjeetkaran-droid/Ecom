import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, STATUS_CONFIG, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

const FILTERS = ['all', 'payment_pending', 'paid', 'completed', 'failed'];
const FILTER_LABELS = { all: 'All', payment_pending: 'Pending', paid: 'Paid', completed: 'Completed', failed: 'Failed' };
const STATUS_VARIANT = { initiated: 'muted', payment_pending: 'warning', paid: 'success', completed: 'primary', failed: 'danger', cancelled: 'muted' };

export default function SellerOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchOrders = (f = filter) => {
    setLoading(true);
    const params = f !== 'all' ? { status: f } : {};
    getSellerOrders(params).then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleFilter = f => { setFilter(f); fetchOrders(f); };
  const pendingCount = orders.filter(o => o.status === 'payment_pending').length;

  return (
    <div style={{ ...pageStyle }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>Orders</h1>
          {pendingCount > 0 && filter === 'all' && (
            <Badge label={`${pendingCount} need action`} variant="warning" dot />
          )}
        </div>
        <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{orders.length} orders</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilter(f)} style={{
            padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer',
            backgroundColor: filter === f ? colors.primary600 : (isDark ? colors.cardDark : colors.white),
            color: filter === f ? colors.white : (isDark ? colors.mutedDark : colors.textDark),
            border: `1.5px solid ${filter === f ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`,
            transition: 'all 0.12s',
          }}>{FILTER_LABELS[f]}</button>
        ))}
      </div>

      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState emoji="📋" title="No orders yet" subtitle="Orders for your products will appear here" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;
            const needsAction = order.status === 'payment_pending';
            return (
              <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} style={{
                backgroundColor: isDark ? colors.cardDark : colors.white,
                border: `1.5px solid ${needsAction ? colors.accent400 : (isDark ? colors.borderDark : colors.borderLight)}`,
                borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                transition: 'all 0.15s', boxShadow: needsAction ? `0 2px 12px ${colors.accent400}20` : '0 1px 4px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = needsAction ? `0 2px 12px ${colors.accent400}20` : '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                {needsAction && (
                  <div style={{ backgroundColor: '#FEF3C7', borderRadius: radius.sm, padding: '6px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>⚠️</span>
                    <span style={{ color: colors.accent700, fontSize: 12, fontWeight: '600' }}>Action required — verify payment</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, marginRight: 16 }}>
                    <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>{order.product?.title}</p>
                    <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 20 }}>₹{order.amount?.toLocaleString()}</p>
                    <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginTop: 3 }}>Buyer: {order.buyer?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 26 }}>{cfg.icon}</span>
                    <div style={{ marginTop: 6 }}>
                      <Badge label={cfg.label} variant={STATUS_VARIANT[order.status] || 'muted'} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
                  <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ color: colors.primary600, fontSize: 12, fontWeight: '600' }}>{needsAction ? 'Verify Now →' : 'View Details →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
