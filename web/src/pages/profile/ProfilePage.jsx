import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, becomeSeller } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, getRoleStyles } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ type: '', text: '' });
  const [dialog,  setDialog]  = useState(null);
  const { user, login, token } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then(({ data }) => { setProfile(data); setName(data.name); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data } = await updateProfile({ name: name.trim() });
      setProfile(p => ({ ...p, name: data.name }));
      login({ ...user, name: data.name }, token);
      setEditing(false);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch { setMsg({ type: 'error', text: 'Failed to update profile.' }); }
    finally { setSaving(false); }
  };

  const handleBecomeSeller = () => {
    setDialog({
      title: 'Become a Seller',
      message: 'Upgrade your account to Seller? This cannot be undone.',
      confirmLabel: 'Upgrade',
      cancelLabel: 'Cancel',
      variant: 'primary',
      icon: '🛍️',
      onConfirm: async () => {
        try {
          const { data } = await becomeSeller();
          login({ ...user, role: data.user.role }, token);
          setProfile(p => ({ ...p, role: data.user.role }));
          setMsg({ type: 'success', text: '🎉 You are now a Seller! Refresh to see seller features.' });
        } catch (err) {
          setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upgrade.' });
        }
      },
    });
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  const roleStyle = getRoleStyles(profile.role);
  const roleVariant = { buyer: 'primary', seller: 'accent', admin: 'danger' }[profile.role] || 'primary';

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
      <h1 style={{ fontSize: 26, fontWeight: '800', color: isDark ? colors.textOnDark : colors.slate800, letterSpacing: '-0.02em', marginBottom: 24 }}>My Profile</h1>

      {msg.text && (
        <div style={{ padding: '12px 16px', borderRadius: radius.md, marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: msg.type === 'success' ? (isDark ? 'rgba(16,185,129,0.15)' : '#F0FDF4') : (isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2'), color: msg.type === 'success' ? colors.success600 : colors.danger600, border: `1px solid ${msg.type === 'success' ? (isDark ? colors.success600 : '#BBF7D0') : (isDark ? colors.danger600 : '#FECACA')}` }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
        </div>
      )}

      {/* Profile header */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${colors.primary700} 0%, ${colors.primary500} 100%)`, border: 'none', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '32px 28px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 'bold', color: colors.white, flexShrink: 0, border: '3px solid rgba(255,255,255,0.3)' }}>
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ color: colors.primary200, fontSize: 14, marginBottom: 10 }}>{profile.email}</p>
            <Badge label={profile.role.toUpperCase()} variant={roleVariant} style={{ fontSize: 11, letterSpacing: '0.05em' }} />
          </div>
          {!editing && (
            <Button title="Edit Profile" variant="ghost" onClick={() => setEditing(true)} style={{ color: colors.white, backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }} />
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Info card */}
        <Card style={{ marginBottom: 0 }}>
          <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 16 }}>Account Details</p>
          {[['Full Name', profile.name], ['Email', profile.email], ['Role', profile.role], ['Member Since', new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })]].map(([label, value], i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 11, borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none' }}>
              <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{label}</span>
              <span style={{ color: isDark ? colors.textOnDark : colors.slate800, fontSize: 13, fontWeight: '600', textTransform: 'capitalize', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
            </div>
          ))}
        </Card>

        {/* Actions card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {editing ? (
            <Card style={{ marginBottom: 0 }}>
              <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 16 }}>Edit Profile</p>
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <Button title="Save Changes" onClick={handleSave} loading={saving} fullWidth />
                <Button title="Cancel" variant="subtle" onClick={() => setEditing(false)} fullWidth />
              </div>
            </Card>
          ) : (
            <Card style={{ marginBottom: 0 }}>
              <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, marginBottom: 16 }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profile.role === 'seller' && (
                  <Button title="💳  Payment Setup" variant="outline" onClick={() => navigate('/payments/setup')} fullWidth />
                )}
                {(profile.role === 'buyer' || profile.role === 'seller') && (
                  <Button title="📄  Payment History" variant="outline" onClick={() => navigate('/payments/history')} fullWidth />
                )}
                {profile.role === 'buyer' && (
                  <Button title="🛍️  Become a Seller" variant="accent" onClick={handleBecomeSeller} fullWidth />
                )}
                <Button title="🛒  My Orders" variant="subtle" onClick={() => navigate(profile.role === 'seller' ? '/seller/orders' : '/orders')} fullWidth />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
