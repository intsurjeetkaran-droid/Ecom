import { useState, useEffect } from 'react';
import { getAllPayments } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';

export default function AdminPaymentsPage() {
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filter,       setFilter]       = useState('all');
  const { isDark } = useTheme();

  const fetchPayments = (f = filter) => {
    setLoading(true);
    const params = { page: 1, limit: 50, ...(f !== 'all' && { status: f }) };
    getAllPayments(params).then(({ data }) => {
      setPayments(data.payments);
      if (data.totalRevenue !== undefined) setTotalRevenue(data.totalRevenue);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);
  const handleFilter = f => { setFilter(f); fetchPayments(f); };

  return (
    <div style={{ ...pageStyle }}>
      <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>All Payments</h1>
      <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{payments.length} transactions</p>

      {/* Revenue summary */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary500})`, borderRadius: 14, padding: '18px 22px' }}>
            <p style={{ color: colors.primary200, fontSize: 13, marginBottom: 4 }}>Total Revenue</p>
            <p style={{ color: colors.white, fontSize: 26, fontWeight: '800', letterSpacing: '-0.02em' }}>₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginBottom: 4 }}>Transactions</p>
            <p style={{ color: isDark ? colors.textOnDark : colors.slate800, fontSize: 26, fontWeight: '800', letterSpacing: '-0.02em' }}>{payments.length}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'paid', 'failed', 'refunded'].map(f => (
          <button key={f} onClick={() => handleFilter(f)} style={{ padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer', backgroundColor: filter === f ? colors.primary600 : (isDark ? colors.cardDark : colors.white), color: filter === f ? colors.white : (isDark ? colors.mutedDark : colors.textDark), border: `1.5px solid ${filter === f ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`, transition: 'all 0.12s', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : payments.length === 0 ? (
        <EmptyState emoji="💳" title="No payments found" />
      ) : (
        <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {payments.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < payments.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none' }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{p.product?.title}</p>
                <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{p.buyer?.name} → {p.seller?.name}</p>
                {p.transactionId && <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2, fontFamily: 'monospace' }}>Txn: {p.transactionId}</p>}
                <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>{new Date(p.confirmedAt || p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: colors.success600, fontWeight: '800', fontSize: 16, marginBottom: 6 }}>₹{p.amount?.toLocaleString()}</p>
                <Badge label={p.status} variant={p.status === 'paid' ? 'success' : p.status === 'failed' ? 'danger' : 'muted'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
