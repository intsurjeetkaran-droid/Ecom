import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, submitPaymentProof, verifyPayment, completeOrder, cancelOrder } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, STATUS_CONFIG, pageStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';

const STATUS_VARIANT = { initiated: 'muted', payment_pending: 'warning', paid: 'success', completed: 'primary', failed: 'danger', cancelled: 'muted' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [txnId,         setTxnId]         = useState('');
  const [sellerNote,    setSellerNote]    = useState('');
  const [msg,           setMsg]           = useState({ type: '', text: '' });

  const isBuyer  = user?.role === 'buyer';
  const isSeller = user?.role === 'seller';

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data)).catch(() => navigate(-1)).finally(() => setLoading(false));
  }, [id]);

  const act = async (fn, successText) => {
    setActionLoading(true); setMsg({ type: '', text: '' });
    try {
      const { data } = await fn();
      setOrder(data.order || data);
      setMsg({ type: 'success', text: successText });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Action failed. Please try again.' });
    } finally { setActionLoading(false); }
  };

  if (loading) return <Loader />;
  if (!order)  return null;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;

  return (
    <div style={{ ...pageStyle, maxWidth: 720 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: colors.primary600, cursor: 'pointer', fontSize: 13, fontWeight: '600', marginBottom: 20, padding: '6px 0' }}>
        ← Back
      </button>

      {/* Status banner */}
      <Card style={{ textAlign: 'center', padding: '28px 24px', marginBottom: 16 }}>
        <span style={{ fontSize: 44, display: 'block', marginBottom: 10 }}>{cfg.icon}</span>
        <Badge label={cfg.label} variant={STATUS_VARIANT[order.status] || 'muted'} style={{ fontSize: 13, padding: '5px 14px', marginBottom: 8 }} />
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginTop: 6 }}>Order #{order._id?.slice(-8).toUpperCase()}</p>
        {order.sellerNote && (
          <div style={{ marginTop: 12, backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: radius.md, padding: '10px 14px', textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 4 }}>SELLER NOTE</p>
            <p style={{ color: isDark ? colors.mutedDark : colors.textDark, fontSize: 13 }}>{order.sellerNote}</p>
          </div>
        )}
      </Card>

      {/* Product */}
      <Card>
        <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 12 }}>PRODUCT</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>{order.product?.title}</p>
            <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 22 }}>₹{order.amount?.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{isBuyer ? 'Seller' : 'Buyer'}</p>
            <p style={{ fontWeight: '600', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 13 }}>{isBuyer ? order.seller?.name : order.buyer?.name}</p>
            <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </Card>

      {/* Payment proof */}
      {order.paymentProof?.transactionId && (
        <Card>
          <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 12 }}>PAYMENT PROOF</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 3 }}>Transaction ID</p>
              <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14, fontFamily: 'monospace' }}>{order.paymentProof.transactionId}</p>
            </div>
            {order.paymentProof.submittedAt && (
              <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12 }}>{new Date(order.paymentProof.submittedAt).toLocaleString()}</p>
            )}
          </div>
        </Card>
      )}

      {/* Feedback */}
      {msg.text && (
        <div style={{ padding: '11px 14px', borderRadius: radius.md, backgroundColor: msg.type === 'success' ? (isDark ? 'rgba(16,185,129,0.15)' : '#F0FDF4') : (isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2'), color: msg.type === 'success' ? colors.success600 : colors.danger600, fontSize: 13, marginBottom: 14, border: `1px solid ${msg.type === 'success' ? (isDark ? colors.success600 : '#BBF7D0') : (isDark ? colors.danger600 : '#FECACA')}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
        </div>
      )}

      {/* Buyer: submit proof */}
      {isBuyer && order.status === 'initiated' && (
        <Card>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>Submit Payment Proof</p>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            Pay ₹{order.amount?.toLocaleString()} to the seller via UPI, then enter your transaction ID below.
          </p>
          <Input label="UPI Transaction ID" placeholder="e.g. T2024041512345" value={txnId} onChange={e => setTxnId(e.target.value)} prefix="🔖" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <Button title="I Have Paid ✓" variant="accent" onClick={() => act(() => submitPaymentProof(order._id, { transactionId: txnId }), 'Payment proof submitted! Waiting for seller verification.')} loading={actionLoading} fullWidth size="lg" />
            <Button title="💳  View Seller Payment Details" variant="outline" onClick={() => navigate(`/payments/details/${order.seller?._id}`, { state: { orderId: order._id, amount: order.amount, sellerName: order.seller?.name } })} fullWidth />
            <Button title="Cancel Order" variant="subtle" onClick={() => act(() => cancelOrder(order._id), 'Order cancelled.')} loading={actionLoading} fullWidth />
          </div>
        </Card>
      )}

      {/* Seller: verify */}
      {isSeller && order.status === 'payment_pending' && (
        <Card>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 4 }}>Verify Payment</p>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            Check the payment proof above. Confirm if you received the payment, or reject if it's invalid.
          </p>
          <Input label="Note to buyer (optional)" placeholder="e.g. Payment received, thank you!" value={sellerNote} onChange={e => setSellerNote(e.target.value)} />
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Button title="✓  Confirm Payment" variant="success" onClick={() => act(() => verifyPayment(order._id, 'confirm', sellerNote), 'Payment confirmed!')} loading={actionLoading} fullWidth />
            <Button title="✕  Reject" variant="danger" onClick={() => act(() => verifyPayment(order._id, 'reject', sellerNote), 'Payment rejected.')} loading={actionLoading} fullWidth />
          </div>
        </Card>
      )}

      {/* Seller: complete */}
      {isSeller && order.status === 'paid' && (
        <Button title="Mark as Completed 🎉" onClick={() => act(() => completeOrder(order._id), 'Order marked as completed!')} loading={actionLoading} fullWidth size="lg" />
      )}

      {/* View payment record */}
      {(order.status === 'paid' || order.status === 'completed') && (
        <div style={{ marginTop: 12 }}>
          <Button title="📄  View Payment Record" variant="ghost" onClick={() => navigate(`/payments/record/${order._id}`)} fullWidth />
        </div>
      )}
    </div>
  );
}
