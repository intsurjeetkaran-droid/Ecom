import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../../api/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        borderRadius: radius.xl, padding: '22px 24px',
        boxShadow: `0 2px 8px ${color}30`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>{label}</p>
          <p style={{ color: colors.white, fontSize: 32, fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>{sub}</p>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ icon, label, value, color, last, isDark }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 12, borderBottom: last ? 'none' : `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: isDark ? colors.mutedDark : colors.textDark, fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ fontWeight: '700', fontSize: 16, color: color || colors.primary600 }}>{value}</span>
    </div>
  );
}

function RecentItem({ title, sub, right, rightSub, last, isDark }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 12, borderBottom: last ? 'none' : `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
      <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <p style={{ fontWeight: '600', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>{sub}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {right && <p style={{ fontWeight: '700', color: colors.primary600, fontSize: 14 }}>{right}</p>}
        {rightSub && <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 11, marginTop: 2 }}>{rightSub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    getAnalytics().then(({ data }) => setAnalytics(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!analytics) return null;

  const { users, products, orders, payments, recent } = analytics;

  const pendingActions = [
    { label: 'Products awaiting approval', count: products.pending,       icon: '📦', screen: '/admin/products', color: colors.accent500 },
    { label: 'Payment verifications',      count: orders.payment_pending, icon: '⏳', screen: '/admin/orders',   color: colors.primary600 },
    { label: 'Blocked users',              count: users.blocked,          icon: '🚫', screen: '/admin/users',    color: colors.danger500  },
  ].filter(a => a.count > 0);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: '800', color: isDark ? colors.textOnDark : colors.slate800, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14, marginTop: 4 }}>Platform overview and analytics</p>
      </div>

      {/* Pending actions */}
      {pendingActions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>⚠️ Needs Attention</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingActions.map(a => (
              <div key={a.screen} onClick={() => navigate(a.screen)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: a.color, borderRadius: radius.lg, padding: '14px 20px',
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>{a.label}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.full, padding: '4px 14px' }}>
                  <span style={{ color: colors.white, fontWeight: '800', fontSize: 15 }}>{a.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Users"    value={users.total}    icon="👥" color={colors.primary600}  sub={`${users.buyers} buyers · ${users.sellers} sellers`} />
        <StatCard label="Total Products" value={products.total} icon="📦" color={colors.accent500}   sub={`${products.pending} pending approval`} />
        <StatCard label="Total Orders"   value={orders.total}   icon="🛒" color={colors.success500}  sub={`${orders.completed} completed`} />
        <StatCard label="Total Revenue"  value={`₹${payments.revenue?.toLocaleString()}`} icon="💰" color={colors.primary800} sub="From confirmed payments" />
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        <Card style={{ marginBottom: 0 }}>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>User Breakdown</p>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginBottom: 16 }}>By role</p>
          <BreakdownRow icon="🛍️" label="Buyers"  value={users.buyers}  color={colors.primary600} isDark={isDark} />
          <BreakdownRow icon="🏪" label="Sellers" value={users.sellers} color={colors.accent600}  isDark={isDark} />
          <BreakdownRow icon="🚫" label="Blocked" value={users.blocked} color={colors.danger500}  last isDark={isDark} />
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>Product Breakdown</p>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginBottom: 16 }}>By status</p>
          <BreakdownRow icon="⏳" label="Pending"  value={products.pending}  color={colors.accent600}  isDark={isDark} />
          <BreakdownRow icon="✅" label="Approved" value={products.approved} color={colors.success600} isDark={isDark} />
          <BreakdownRow icon="❌" label="Rejected" value={products.rejected} color={colors.danger500}  last isDark={isDark} />
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>Order Breakdown</p>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginBottom: 16 }}>By status</p>
          <BreakdownRow icon="🛒" label="Initiated"  value={orders.initiated}       color={isDark ? colors.mutedDark : colors.mutedLight}  isDark={isDark} />
          <BreakdownRow icon="⏳" label="Pending"    value={orders.payment_pending} color={colors.accent600}   isDark={isDark} />
          <BreakdownRow icon="✅" label="Paid"       value={orders.paid}            color={colors.success600}  isDark={isDark} />
          <BreakdownRow icon="🎉" label="Completed"  value={orders.completed}       color={colors.primary600}  last isDark={isDark} />
        </Card>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Recent users */}
        <Card style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15 }}>Recent Users</p>
            <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', color: colors.primary600, fontSize: 13, fontWeight: '600', cursor: 'pointer' }}>View all →</button>
          </div>
          {recent?.users?.length === 0 ? <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14 }}>No users yet</p> :
            recent?.users?.map((u, i) => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBlock: 10, borderBottom: i < recent.users.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: colors.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary700, fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14 }}>{u.name}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{u.email}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: '600', color: colors.primary600, textTransform: 'capitalize', backgroundColor: colors.primary50, padding: '2px 8px', borderRadius: radius.full }}>{u.role}</span>
              </div>
            ))
          }
        </Card>

        {/* Recent orders */}
        <Card style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15 }}>Recent Orders</p>
            <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: colors.primary600, fontSize: 13, fontWeight: '600', cursor: 'pointer' }}>View all →</button>
          </div>
          {recent?.orders?.length === 0 ? <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14 }}>No orders yet</p> :
            recent?.orders?.map((o, i) => (
              <RecentItem key={o._id} title={o.product?.title || 'Product'} sub={`${o.buyer?.name} → ${o.seller?.name}`} right={`₹${o.amount?.toLocaleString()}`} rightSub={o.status} last={i === recent.orders.length - 1} isDark={isDark} />
            ))
          }
        </Card>

        {/* Recent payments */}
        <Card style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15 }}>Recent Payments</p>
            <button onClick={() => navigate('/admin/payments')} style={{ background: 'none', border: 'none', color: colors.primary600, fontSize: 13, fontWeight: '600', cursor: 'pointer' }}>View all →</button>
          </div>
          {recent?.payments?.length === 0 ? <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14 }}>No payments yet</p> :
            recent?.payments?.map((p, i) => (
              <RecentItem key={p._id} title={p.product?.title || 'Product'} sub={`${p.buyer?.name} → ${p.seller?.name}`} right={`₹${p.amount?.toLocaleString()}`} rightSub="✅ Paid" last={i === recent.payments.length - 1} isDark={isDark} />
            ))
          }
        </Card>
      </div>
    </div>
  );
}
