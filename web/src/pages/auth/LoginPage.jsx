import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius } from '../../styles/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate  = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const { data } = await loginApi({ email: email.trim().toLowerCase(), password });
      login(data.user, data.token);
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'seller' ? '/seller/products' : '/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const bg     = isDark ? colors.bgDark    : colors.bgLight;
  const text   = isDark ? colors.textOnDark: colors.slate800;
  const muted  = isDark ? colors.mutedDark : colors.mutedLight;
  const border = isDark ? colors.borderDark: colors.borderLight;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: bg }}>
      {/* Left branding panel */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: `linear-gradient(135deg, ${colors.primary700} 0%, ${colors.primary500} 100%)`, padding: 60, position: 'relative', overflow: 'hidden' }} className="auth-left">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🛍️</div>
          <h1 style={{ color: colors.white, fontSize: 36, fontWeight: 'bold', marginBottom: 16, letterSpacing: '-0.02em' }}>Chat Marketplace</h1>
          <p style={{ color: colors.primary200, fontSize: 16, lineHeight: 1.7, maxWidth: 340 }}>Buy and sell products, chat with buyers and sellers, and manage payments — all in one place.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40, textAlign: 'left' }}>
            {['🛒 Browse thousands of products', '💬 Real-time chat with sellers', '💳 Secure manual UPI payments', '📦 Track your orders easily'].map(f => (
              <span key={f} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 56, height: 56, borderRadius: radius.xl, background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16, boxShadow: `0 8px 24px ${colors.primary600}40` }}>🛍️</div>
            <h2 style={{ fontSize: 26, fontWeight: 'bold', color: text, letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ color: muted, marginTop: 6, fontSize: 14 }}>Sign in to your account to continue</p>
          </div>

          {apiError && (
            <div style={{ backgroundColor: isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2', border: `1px solid ${isDark ? colors.danger600 : '#FECACA'}`, borderRadius: radius.md, padding: '12px 16px', marginBottom: 20, color: colors.danger500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} error={errors.email} prefix="✉️" />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} error={errors.password} prefix="🔒" />
            <Button title="Sign In" onClick={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: border }} />
            <span style={{ color: muted, fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: border }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: muted }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: colors.primary600, fontWeight: '700', textDecoration: 'none' }}>Create one free →</Link>
          </p>
        </div>
      </div>
      <style>{`@media (min-width: 900px) { .auth-left { display: flex !important; } }`}</style>
    </div>
  );
}
