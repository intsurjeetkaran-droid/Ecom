import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSellerPaymentDetails } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function PaymentDetailsPage() {
  const { sellerId } = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { isDark } = useTheme();
  const { orderId, amount, sellerName } = state || {};

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState('');

  useEffect(() => {
    getSellerPaymentDetails(sellerId)
      .then(({ data }) => setDetails(data.paymentDetails))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sellerId]);

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <Loader />;

  const hasUpi  = details?.upiId;
  const hasBank = details?.bankName || details?.accountNo;

  if (!details || (!hasUpi && !hasBank)) {
    return (
      <div style={{ ...pageStyle, maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ fontSize: 18, fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, marginBottom: 8 }}>Seller hasn't set up payment details yet</p>
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14, marginBottom: 24 }}>Please contact the seller via chat to arrange payment.</p>
        <Button title="← Go Back" variant="outline" onClick={() => navigate(-1)} />
      </div>
    );
  }

  return (
    <div style={{ ...pageStyle, maxWidth: 600 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: colors.primary600, cursor: 'pointer', fontSize: 13, fontWeight: '600', marginBottom: 20, padding: '6px 0' }}>
        ← Back
      </button>

      {/* Amount banner */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary500})`, borderRadius: 16, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
        <p style={{ color: colors.primary200, fontSize: 14, marginBottom: 6 }}>Amount to Pay</p>
        <p style={{ color: colors.white, fontSize: 36, fontWeight: '800', letterSpacing: '-0.02em' }}>₹{amount?.toLocaleString()}</p>
        <p style={{ color: colors.primary200, fontSize: 14, marginTop: 4 }}>to {sellerName}</p>
      </div>

      {/* How to pay */}
      <div style={{ backgroundColor: '#FFFBEB', border: `1px solid #FDE68A`, borderRadius: radius.md, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <div>
          <p style={{ fontWeight: '700', color: colors.accent700, fontSize: 14, marginBottom: 4 }}>How to pay</p>
          <p style={{ color: colors.accent600, fontSize: 13, lineHeight: 1.6 }}>
            1. Copy UPI ID or scan QR code<br />
            2. Pay ₹{amount?.toLocaleString()} using any UPI app<br />
            3. Come back and submit your transaction ID
          </p>
        </div>
      </div>

      {/* UPI */}
      {hasUpi && (
        <Card>
          <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 14 }}>UPI PAYMENT</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, borderRadius: radius.md, padding: '12px 16px', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 3 }}>UPI ID</p>
              <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 16, fontFamily: 'monospace' }}>{details.upiId}</p>
            </div>
            <button onClick={() => copy(details.upiId, 'UPI ID')} style={{ backgroundColor: copied === 'UPI ID' ? colors.success600 : colors.primary600, color: colors.white, border: 'none', borderRadius: radius.md, padding: '8px 16px', fontSize: 13, fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.15s' }}>
              {copied === 'UPI ID' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </Card>
      )}

      {/* Bank */}
      {hasBank && (
        <Card>
          <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 14 }}>BANK TRANSFER</p>
          {[
            { label: 'Bank Name',   value: details.bankName,  key: 'bank' },
            { label: 'Account No.', value: details.accountNo, key: 'acc', copyable: true },
            { label: 'IFSC Code',   value: details.ifscCode,  key: 'ifsc', copyable: true },
          ].filter(r => r.value).map((row, i, arr) => (
            <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 10, borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none' }}>
              <div>
                <p style={{ fontSize: 12, color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 2 }}>{row.label}</p>
                <p style={{ fontWeight: '600', color: isDark ? colors.textOnDark : colors.slate800, fontFamily: row.copyable ? 'monospace' : 'inherit' }}>{row.value}</p>
              </div>
              {row.copyable && (
                <button onClick={() => copy(row.value, row.key)} style={{ backgroundColor: copied === row.key ? colors.success600 : (isDark ? colors.subtleDark : colors.subtleLight), color: copied === row.key ? colors.white : colors.primary600, border: `1px solid ${copied === row.key ? colors.success600 : (isDark ? colors.borderDark : colors.borderLight)}`, borderRadius: radius.md, padding: '6px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {copied === row.key ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {orderId && <Button title="I've Paid — Submit Proof" onClick={() => navigate(`/orders/${orderId}`)} fullWidth size="lg" />}
        <Button title="Back to Order" variant="outline" onClick={() => navigate(-1)} fullWidth />
      </div>
    </div>
  );
}
