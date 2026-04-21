import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius } from '../../styles/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function RegisterPage() {
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const { login }  = useAuth();
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const set = k => e => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name     = 'Name is required';
    if (!form.email.trim())             e.email    = 'Email is required';
    if (!form.password)                 e.password = 'Password is required';
    else if (form.password.length < 6)  e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm  = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const { data } = await registerApi({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const bg     = isDark ? colors.bgDark    : colors.bgLight;
  const text   = isDark ? colors.textOnDark: colors.slate800;
  const muted  = isDark ? colors.mutedDark : colors.mutedLight;
  const border = isDark ? colors.borderDark: colors.borderLight;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: bg }}>

      {/* ── Left branding panel ── */}
      <div
        className="auth-left"
        style={{
          flex: 1, display: 'none', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.primary700} 0%, ${colors.primary500} 100%)`,
          padding: 60, position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✨</div>
          <h1 style={{ color: colors.white, fontSize: 36, fontWeight: 'bold', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Join Chat Marketplace
          </h1>
          <p style={{ color: colors.primary200, fontSize: 16, lineHeight: 1.7, maxWidth: 340 }}>
            Create your free account and start buying or selling in minutes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40, textAlign: 'left' }}>
            {[
              '🆓 Free to join — no hidden fees',
              '🛒 Start as a buyer instantly',
              '📦 Upgrade to seller anytime',
              '💬 Chat directly with buyers/sellers',
            ].map(f => (
              <span key={f} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56, borderRadius: radius.xl,
              background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 16,
              boxShadow: `0 8px 24px ${colors.primary600}40`,
            }}>✨</div>
            <h2 style={{ fontSize: 26, fontWeight: 'bold', color: text, letterSpacing: '-0.02em' }}>
              Create your account
            </h2>
            <p style={{ color: muted, marginTop: 6, fontSize: 14 }}>
              Join as a buyer — upgrade to seller anytime
            </p>
          </div>

          {/* API error */}
          {apiError && (
            <div style={{
              backgroundColor: isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2',
              border: `1px solid ${isDark ? colors.danger600 : '#FECACA'}`,
              borderRadius: radius.md, padding: '12px 16px', marginBottom: 20,
              color: colors.danger500, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠️</span> {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              prefix="👤"
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              prefix="✉️"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              prefix="🔒"
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              prefix="🔒"
            />
            <Button
              title="Create Account"
              onClick={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: border }} />
            <span style={{ color: muted, fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: border }} />
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: muted }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: colors.primary600, fontWeight: '700', textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      <style>{`@media (min-width: 900px) { .auth-left { display: flex !important; } }`}</style>
    </div>
  );
}
