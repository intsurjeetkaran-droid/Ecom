import { useState, useEffect } from 'react';
import { getProfile } from '../../api/userApi';
import { updatePaymentDetails } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function PaymentSetupPage() {
  const [upiId,     setUpiId]     = useState('');
  const [bankName,  setBankName]  = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode,  setIfscCode]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });
  const { isDark } = useTheme();

  useEffect(() => {
    getProfile().then(({ data }) => {
      const pd = data.paymentDetails || {};
      setUpiId(pd.upiId || '');
      setBankName(pd.bankName || '');
      setAccountNo(pd.accountNo || '');
      setIfscCode(pd.ifscCode || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!upiId.trim() && !bankName.trim() && !accountNo.trim()) {
      setMsg({ type: 'error', text: 'Please enter at least a UPI ID or bank account details.' });
      return;
    }
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await updatePaymentDetails({ upiId: upiId.trim(), bankName: bankName.trim(), accountNo: accountNo.trim(), ifscCode: ifscCode.trim() });
      setMsg({ type: 'success', text: 'Payment details saved! Buyers can now see where to pay.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save payment details.' });
    } finally { setSaving(false); }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ ...pageStyle, maxWidth: 680 }}>
      <h1 style={{ ...pageTitleStyle, marginBottom: 4, color: isDark ? colors.textOnDark : colors.slate800 }}>Payment Setup</h1>
      <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13, marginBottom: 24 }}>
        Add your UPI ID or bank details so buyers know where to send payment.
      </p>

      {msg.text && (
        <div style={{ padding: '11px 14px', borderRadius: radius.md, backgroundColor: msg.type === 'success' ? (isDark ? 'rgba(16,185,129,0.15)' : '#F0FDF4') : (isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2'), color: msg.type === 'success' ? colors.success600 : colors.danger600, fontSize: 13, marginBottom: 16, border: `1px solid ${msg.type === 'success' ? (isDark ? colors.success600 : '#BBF7D0') : (isDark ? colors.danger600 : '#FECACA')}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
        </div>
      )}

      <Card>
        <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 16 }}>📱 UPI Details</p>
        <Input label="UPI ID" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} hint="e.g. yourname@okaxis, yourname@ybl" />
      </Card>

      <Card>
        <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 16 }}>🏦 Bank Transfer Details</p>
        <Input label="Bank Name"    placeholder="e.g. State Bank of India" value={bankName}  onChange={e => setBankName(e.target.value)} />
        <Input label="Account No."  placeholder="Account number"            value={accountNo} onChange={e => setAccountNo(e.target.value)} />
        <Input label="IFSC Code"    placeholder="e.g. SBIN0001234"          value={ifscCode}  onChange={e => setIfscCode(e.target.value)} />
      </Card>

      <div style={{ padding: '12px 16px', backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, borderRadius: radius.md, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: isDark ? colors.mutedDark : colors.mutedLight, lineHeight: 1.6 }}>
          ℹ️ These details are shown to buyers when they place an order. Keep them accurate to receive payments correctly.
        </p>
      </div>

      <Button title="Save Payment Details" onClick={handleSave} loading={saving} fullWidth size="lg" />
    </div>
  );
}
