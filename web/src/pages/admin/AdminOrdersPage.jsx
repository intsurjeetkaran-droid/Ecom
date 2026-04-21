import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, STATUS_CONFIG, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';

const FILTERS = ['all', 'payment_pending', 'paid', 'completed', 'failed', 'cancelled'];
const FILTER_LABELS = { all: 'All', payment_pending: 'Pending', paid: 'Paid', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled' };
const STATUS_VARIANT = { initiated: 'muted', payment_pending: 'warning', paid: 'success', completed: 'primary', failed: 'danger', cancelled: 'muted' };

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchOrders = (f = filter) => {
    setLoading(true);
    const params = { page: 1, limit: 50, ...(f !== 'all' && { status: f }) };
    getAllOrders(params).then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);
  const handleFilter = f => { setFilter(f); fetchOrders(f); };

  return (
    <div style={{ ...pageStyle }}>
      <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>All Orders</h1>
      <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{orders.length} orders</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilter(f)} style={{ padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer', backgroundColor: filter === f ? colors.primary600 : (isDark ? colors.cardDark : colors.white), color: filter === f ? colors.white : (isDark ? colors.mutedDark : colors.textDark), border: `1.5px solid ${filter === f ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`, transition: 'all 0.12s' }}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState emoji="🛒" title="No orders found" />
      ) : (
        <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;
            return (
              <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < orders.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none', cursor: 'pointer', transition: 'background-color 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? colors.subtleDark : colors.subtleLight}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                  <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{order.product?.title}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{order.buyer?.name} → {order.seller?.name}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 16, marginBottom: 6 }}>₹{order.amount?.toLocaleString()}</p>
                  <Badge label={cfg.label} variant={STATUS_VARIANT[order.status] || 'muted'} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
