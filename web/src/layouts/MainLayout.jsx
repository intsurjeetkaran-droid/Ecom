import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, getRoleStyles } from '../styles/theme';
import ConfirmDialog from '../components/ConfirmDialog';

const SIDEBAR_W = 240;

const NAV = {
  buyer: [
    { to: '/',        label: 'Home'        },
    { to: '/chat',    label: 'Messages'    },
    { to: '/orders',  label: 'My Orders'   },
    { to: '/profile', label: 'Profile'     },
  ],
  seller: [
    { to: '/seller/products', label: 'My Products'   },
    { to: '/seller/add',      label: 'Add Product'   },
    { to: '/chat',            label: 'Messages'      },
    { to: '/seller/orders',   label: 'Orders'        },
    { to: '/payments/setup',  label: 'Payment Setup' },
    { to: '/profile',         label: 'Profile'       },
  ],
  admin: [
    { to: '/admin',          label: 'Dashboard' },
    { to: '/admin/users',    label: 'Users'     },
    { to: '/admin/products', label: 'Products'  },
    { to: '/admin/orders',   label: 'Orders'    },
    { to: '/admin/payments', label: 'Payments'  },
  ],
};

const ICONS = {
  home:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chat:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  orders:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  profile:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  products:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  add:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  payment:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevronL:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronR:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  sun:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

const ICON_MAP = {
  '/':                'home',
  '/chat':            'chat',
  '/orders':          'orders',
  '/profile':         'profile',
  '/seller/products': 'products',
  '/seller/add':      'add',
  '/seller/orders':   'orders',
  '/payments/setup':  'payment',
  '/admin':           'dashboard',
  '/admin/users':     'users',
  '/admin/products':  'products',
  '/admin/orders':    'orders',
  '/admin/payments':  'payment',
};

export default function MainLayout({ children }) {
  const { user, logout }    = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);
  const [themeHover,  setThemeHover]  = useState(false);
  const [dialog,      setDialog]      = useState(null);

  const role      = user?.role || 'buyer';
  const links     = NAV[role] || NAV.buyer;
  const roleStyle = getRoleStyles(role);

  // Dark mode surface colors
  const bg       = isDark ? colors.bgDark    : colors.bgLight;
  const cardBg   = isDark ? colors.cardDark  : colors.white;
  const border   = isDark ? colors.borderDark: colors.borderLight;
  const textMain = isDark ? colors.textOnDark: colors.slate800;

  const handleLogout = () => {
    setDialog({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmLabel: 'Logout',
      cancelLabel: 'Stay',
      variant: 'danger',
      icon: '🚪',
      onConfirm: async () => { await logout(); navigate('/login'); },
    });
  };

  const SidebarInner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10, flexShrink: 0,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: isDark ? colors.primary600 : colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          🛍️
        </div>
        {!collapsed && (
          <div>
            <p style={{ color: colors.white, fontWeight: '700', fontSize: 13, lineHeight: 1.3 }}>Chat Marketplace</p>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 }}>Web Platform</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {links.map(({ to, label }) => {
          const iconKey = ICON_MAP[to] || 'home';
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/' || to === '/admin'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: 10,
                padding: collapsed ? '11px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 2,
                textDecoration: 'none',
                backgroundColor: isActive
                  ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)')
                  : 'transparent',
                color: isActive ? colors.white : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.75)'),
                fontWeight: isActive ? '600' : '400',
                fontSize: 14,
                transition: 'all 0.12s ease',
                borderLeft: isActive
                  ? `3px solid ${isDark ? colors.primary400 : colors.white}`
                  : '3px solid transparent',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.borderLeft.includes('solid rgba') && !e.currentTarget.style.backgroundColor.includes('0.1'))
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.borderLeft.includes('solid rgba') && !e.currentTarget.style.backgroundColor.includes('0.1'))
                  e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{ICONS[iconKey]}</span>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: theme toggle + user + logout */}
      <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`, flexShrink: 0 }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setThemeHover(true)}
          onMouseLeave={() => setThemeHover(false)}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10, width: '100%',
            padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: themeHover
              ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.14)')
              : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'),
            border: 'none', borderRadius: 8,
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
            fontSize: 13, cursor: 'pointer', fontWeight: '500',
            transition: 'background-color 0.12s',
            marginBottom: 6,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {isDark ? ICONS.sun : ICONS.moon}
          </span>
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', marginBottom: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: roleStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleStyle.text, fontWeight: '700', fontSize: 13, flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: colors.white, fontSize: 13, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'capitalize', marginTop: 1 }}>{user?.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10, width: '100%',
            padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: logoutHover ? 'rgba(244,63,94,0.28)' : 'rgba(244,63,94,0.14)',
            border: 'none', borderRadius: 8,
            color: '#FCA5A5',
            fontSize: 13, cursor: 'pointer', fontWeight: '600',
            transition: 'background-color 0.12s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{ICONS.logout}</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: bg, transition: 'background-color 0.2s' }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />

      {/* Desktop Sidebar */}
      <div
        className="desktop-sidebar"
        style={{
          width: collapsed ? 64 : SIDEBAR_W,
          minWidth: collapsed ? 64 : SIDEBAR_W,
          backgroundColor: isDark ? '#1E293B' : '#0F766E',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), background-color 0.2s',
          overflow: 'visible',
          position: 'relative',
          zIndex: 10,
          boxShadow: '2px 0 16px rgba(0,0,0,0.1)',
        }}
      >
        <SidebarInner />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', top: 20, right: -14,
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: isDark ? colors.cardDark : colors.white,
            border: `2px solid ${border}`,
            color: colors.primary600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 30,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'box-shadow 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {collapsed ? ICONS.chevronR : ICONS.chevronL}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 50, animation: 'fadeIn 0.15s' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: SIDEBAR_W, height: '100%', backgroundColor: isDark ? '#1E293B' : '#0F766E', animation: 'slideIn 0.22s ease-out', overflow: 'hidden' }}>
            <SidebarInner />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="mobile-topbar" style={{ display: 'none', height: 52, backgroundColor: cardBg, borderBottom: `1px solid ${border}`, alignItems: 'center', paddingInline: 16, gap: 12, flexShrink: 0 }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: textMain, padding: 4 }}>☰</button>
          <span style={{ fontWeight: '700', color: textMain, fontSize: 16, flex: 1 }}>Chat Marketplace</span>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMain, display: 'flex', alignItems: 'center', padding: 6 }}>
            {isDark ? ICONS.sun : ICONS.moon}
          </button>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: bg, transition: 'background-color 0.2s', display: 'flex', flexDirection: 'column' }}>
          <div className="fade-in" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
