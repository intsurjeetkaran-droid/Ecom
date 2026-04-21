import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentByOrder } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function PaymentRecordPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { isDark } = useTheme();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getPaymentByOrder(orderId)
      .then(({ data }) => setPayment(data))
      .catch(() => setError('Could not load payment record.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loader />;

  if (error || !payment) return (
    <div style={{ ...pageStyle, maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
      <p style={{ fontSize: 18, fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, marginBottom: 8 }}>Payment record not found</p>
      <Button title="← Go Back" variant="outline" onClick={() => navigate(-1)} />
    </div>
  );

  return (
    <div style={{ ...pageStyle, maxWidth: 600 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: colors.primary600, cursor: 'pointer', fontSize: 13, fontWeight: '600', marginBottom: 20, padding: '6px 0' }}>
        ← Back
      </button>

      {/* Status banner */}
      <div style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border: '1px solid #6EE7B7', borderRadius: 16, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
        <span style={{ fontSize: 44, display: 'block', marginBottom: 10 }}>✅</span>
        <p style={{ color: colors.success600, fontSize: 28, fontWeight: '800', letterSpacing: '-0.02em' }}>₹{payment.amount?.toLocaleString()}</p>
        <p style={{ color: colors.success600, fontSize: 14, marginTop: 4 }}>Payment Confirmed</p>
        {payment.confirmedAt && (
          <p style={{ color: colors.success600, fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            {new Date(payment.confirmedAt).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Product */}
      <Card>
        <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 12 }}>PRODUCT</p>
        <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>{payment.product?.title}</p>
        <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 20 }}>₹{payment.product?.price?.toLocaleString()}</p>
      </Card>

      {/* Transaction details */}
      <Card>
        <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 14 }}>TRANSACTION DETAILS</p>
        {[
          { label: 'Payment ID',     value: `#${payment._id?.slice(-8).toUpperCase()}` },
          { label: 'Buyer',          value: payment.buyer?.name },
          { label: 'Seller',         value: payment.seller?.name },
          { label: 'Method',         value: payment.method?.toUpperCase().replace('_', ' ') },
          ...(payment.transactionId ? [{ label: 'Transaction ID', value: payment.transactionId, mono: true }] : []),
          ...(payment.sellerNote    ? [{ label: 'Seller Note',    value: payment.sellerNote }] : []),
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 10, borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none' }}>
            <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{row.label}</span>
            <span style={{ color: isDark ? colors.textOnDark : colors.slate800, fontSize: 13, fontWeight: '600', fontFamily: row.mono ? 'monospace' : 'inherit', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <Badge label="Payment Verified ✓" variant="success" style={{ fontSize: 13, padding: '6px 16px' }} />
      </div>
    </div>
  );
}
