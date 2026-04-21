import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPayments } from '../../api/paymentApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

export default function PaymentHistoryPage() {
  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isSeller = user?.role === 'seller';

  useEffect(() => {
    getMyPayments({ page: 1, limit: 50 }).then(({ data }) => {
      setPayments(data.payments);
      const sum = data.payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
      setTotalAmount(sum);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ ...pageStyle }}>
      <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>{isSeller ? 'Payments Received' : 'Payment History'}</h1>
      <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{payments.length} transactions</p>

      {/* Summary */}
      {payments.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary500})`, borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: colors.primary200, fontSize: 13, marginBottom: 4 }}>{isSeller ? 'Total Received' : 'Total Paid'}</p>
            <p style={{ color: colors.white, fontSize: 28, fontWeight: '800', letterSpacing: '-0.02em' }}>₹{totalAmount.toLocaleString()}</p>
          </div>
          <span style={{ fontSize: 40, opacity: 0.8 }}>💰</span>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState emoji="💳" title="No payments yet" subtitle={isSeller ? 'Confirmed payments will appear here' : 'Your payment history will appear here'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => (
            <div key={p._id} onClick={() => navigate(`/orders/${p.order}`)} style={{
              backgroundColor: isDark ? colors.cardDark : colors.white,
              border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`,
              borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
              transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>{p.product?.title}</p>
                  <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 20 }}>₹{p.amount?.toLocaleString()}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginTop: 3 }}>
                    {isSeller ? `From: ${p.buyer?.name}` : `To: ${p.seller?.name}`}
                  </p>
                  {p.transactionId && <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>Txn: {p.transactionId}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 26 }}>✅</span>
                  <div style={{ marginTop: 6 }}>
                    <Badge label="Paid" variant="success" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
                <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{new Date(p.confirmedAt || p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ color: colors.primary600, fontSize: 12, fontWeight: '600' }}>View Order →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
