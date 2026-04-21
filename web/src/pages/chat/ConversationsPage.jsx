import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getConversations } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import socket from '../../utils/socket';
import { colors, radius } from '../../styles/theme';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const formatTime = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  if (diff < 60000)    return 'now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const preview = (msg) => {
  if (!msg) return 'No messages yet';
  if (msg.deleted) return '🗑 Message deleted';
  if (msg.image)   return '📷 Image';
  if (msg.product) return '📦 Product shared';
  return msg.text?.length > 50 ? msg.text.slice(0, 50) + '…' : msg.text;
};

export default function ConversationsPage() {
  const [convs,   setConvs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchConvs = () => getConversations().then(({ data }) => setConvs(data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    fetchConvs();
    socket.emit('join', user?.id || user?._id);
    const handler = (msg) => {
      const sid = msg.sender?._id || msg.sender;
      setConvs(prev => {
        const ex = prev.find(c => c.partner._id === sid);
        if (ex) return [{ ...ex, lastMessage: msg, unreadCount: ex.unreadCount + 1 }, ...prev.filter(c => c.partner._id !== sid)];
        fetchConvs(); return prev;
      });
    };
    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, []);

  useEffect(() => {
    if (location.state?.userId) {
      navigate(`/chat/${location.state.userId}`, { state: { userName: location.state.userName } });
    }
  }, [location.state]);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: '800', color: isDark ? colors.textOnDark : colors.slate800, letterSpacing: '-0.02em' }}>Messages</h1>
        <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 14, marginTop: 4 }}>
          {convs.length > 0 ? `${convs.length} conversation${convs.length !== 1 ? 's' : ''}` : 'Your conversations'}
        </p>
      </div>

      {convs.length === 0 ? (
        <EmptyState emoji="💬" title="No messages yet" subtitle="Start a conversation by tapping 'Chat with Seller' on any product" action={user?.role === 'buyer' ? () => navigate('/') : undefined} actionLabel={user?.role === 'buyer' ? 'Browse Products' : undefined} />
      ) : (
        <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: radius.xl, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {convs.map(({ partner, lastMessage, unreadCount }, i) => (
            <div
              key={partner._id}
              onClick={() => navigate(`/chat/${partner._id}`, { state: { userName: partner.name } })}
              style={{
                display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer',
                borderBottom: i < convs.length - 1 ? `1px solid ${isDark ? colors.borderDark : colors.borderLight}` : 'none',
                transition: 'background-color 0.1s',
                backgroundColor: unreadCount > 0 ? `${colors.primary50}` : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? colors.subtleDark : colors.subtleLight}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = unreadCount > 0 ? colors.primary50 : 'transparent'}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', marginRight: 14, flexShrink: 0 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: 'bold', fontSize: 20 }}>
                  {partner.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: '50%', backgroundColor: colors.success500, border: `2px solid ${isDark ? colors.cardDark : colors.white}` }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <p style={{ fontWeight: unreadCount > 0 ? '700' : '600', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15 }}>{partner.name}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{formatTime(lastMessage?.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: unreadCount > 0 ? (isDark ? colors.mutedDark : colors.textDark) : (isDark ? colors.mutedDark : colors.mutedLight), fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8, fontWeight: unreadCount > 0 ? '500' : '400' }}>
                    {preview(lastMessage)}
                  </p>
                  {unreadCount > 0 && (
                    <span style={{ backgroundColor: colors.primary600, color: colors.white, borderRadius: radius.full, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: '700', padding: '0 7px', flexShrink: 0 }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 11, marginTop: 3, textTransform: 'capitalize' }}>{partner.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
