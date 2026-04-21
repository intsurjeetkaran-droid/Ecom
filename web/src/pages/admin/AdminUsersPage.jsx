import { useState, useEffect, useRef } from 'react';
import { getAllUsers, toggleBlock } from '../../api/userApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const ROLE_VARIANT = { buyer: 'primary', seller: 'accent', admin: 'danger' };
const ROLE_FILTERS = ['all', 'buyer', 'seller'];

export default function AdminUsersPage() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [total,       setTotal]       = useState(0);
  const [blockingId,  setBlockingId]  = useState(null);
  const [dialog,      setDialog]      = useState(null);
  const { isDark } = useTheme();
  const timer = useRef(null);

  const fetchUsers = ({ s = search, role = roleFilter } = {}) => {
    setLoading(true);
    const params = { page: 1, limit: 50, ...(s && { search: s }), ...(role !== 'all' && { role }) };
    getAllUsers(params).then(({ data }) => { setUsers(data.users); setTotal(data.total); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = val => {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchUsers({ s: val }), 400);
  };

  const handleRoleFilter = r => { setRoleFilter(r); fetchUsers({ role: r }); };

  const handleToggleBlock = (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    setDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.name}?`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'block' ? 'danger' : 'success',
      icon: action === 'block' ? '🚫' : '✅',
      onConfirm: async () => {
        setBlockingId(user._id);
        try {
          const { data } = await toggleBlock(user._id);
          setUsers(p => p.map(u => u._id === user._id ? { ...u, isBlocked: data.user.isBlocked } : u));
        } catch (err) {
          setDialog({
            title: 'Error',
            message: err.response?.data?.message || `Failed to ${action} user.`,
            confirmLabel: 'OK',
            cancelLabel: null,
            variant: 'danger',
            icon: '⚠️',
            onConfirm: () => {},
          });
        } finally { setBlockingId(null); }
      },
    });
  };

  return (
    <div style={{ ...pageStyle }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
      <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>All Users</h1>
      <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{total} total</p>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: isDark ? colors.cardDark : colors.white, border: `1.5px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: radius.lg, padding: '9px 14px', marginBottom: 16, gap: 10 }}>
        <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight }}>🔍</span>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name or email..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: isDark ? colors.textOnDark : colors.slate800, backgroundColor: 'transparent' }} />
        {search && <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 18 }}>✕</button>}
      </div>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {ROLE_FILTERS.map(r => (
          <button key={r} onClick={() => handleRoleFilter(r)} style={{ padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer', backgroundColor: roleFilter === r ? colors.primary600 : (isDark ? colors.cardDark : colors.white), color: roleFilter === r ? colors.white : (isDark ? colors.mutedDark : colors.textDark), border: `1.5px solid ${roleFilter === r ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`, transition: 'all 0.12s' }}>
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : users.length === 0 ? (
        <EmptyState emoji="👥" title="No users found" subtitle={search ? `No results for "${search}"` : 'No users yet'} />
      ) : (
        <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {users.map((u, i) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < users.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none', opacity: u.isBlocked ? 0.65 : 1 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: '700', fontSize: 17, flexShrink: 0, marginRight: 14 }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14 }}>{u.name}</p>
                  <Badge label={u.role} variant={ROLE_VARIANT[u.role] || 'muted'} />
                  {u.isBlocked && <Badge label="Blocked" variant="danger" />}
                </div>
                <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{u.email}</p>
                <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {u.role !== 'admin' && (
                <Button title={u.isBlocked ? 'Unblock' : 'Block'} variant={u.isBlocked ? 'success' : 'danger'} size="sm" loading={blockingId === u._id} onClick={() => handleToggleBlock(u)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
