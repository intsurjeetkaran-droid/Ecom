import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getConversation, sendMessage, deleteMessage, markAsRead } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import socket from '../../utils/socket';
import { colors, radius } from '../../styles/theme';
import { Spinner } from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ChatPage() {
  const { userId } = useParams();
  const { state }  = useLocation();
  const { user }   = useAuth();
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const userName   = state?.userName || 'User';

  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [isTyping,  setIsTyping]  = useState(false);
  const [dialog,    setDialog]    = useState(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  const myId = user?.id || user?._id;

  // Theme colors
  const bg       = isDark ? colors.bgDark    : colors.bgLight;
  const cardBg   = isDark ? colors.cardDark  : colors.white;
  const border   = isDark ? colors.borderDark: colors.borderLight;
  const textMain = isDark ? colors.textOnDark: colors.slate800;
  const muted    = isDark ? colors.mutedDark : colors.mutedLight;
  const subtle   = isDark ? colors.subtleDark: colors.subtleLight;

  useEffect(() => {
    socket.emit('join', myId);
    getConversation(userId)
      .then(({ data }) => {
        setMessages(data);
        markAsRead(userId).catch(() => {});
        socket.emit('messagesRead', { senderId: userId, readerId: myId });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const onMsg     = msg => {
      const sid = msg.sender?._id || msg.sender;
      if (sid === userId || sid === myId) {
        setMessages(p => [...p, msg]);
        markAsRead(userId).catch(() => {});
        socket.emit('messagesRead', { senderId: userId, readerId: myId });
      }
    };
    const onTyping  = ({ senderId }) => { if (senderId === userId) setIsTyping(true); };
    const onStop    = ({ senderId }) => { if (senderId === userId) setIsTyping(false); };
    const onRead    = ({ readerId }) => { if (readerId === userId) setMessages(p => p.map(m => (m.sender?._id || m.sender) === myId ? { ...m, isRead: true } : m)); };
    const onDeleted = ({ messageId }) => setMessages(p => p.map(m => m._id === messageId ? { ...m, deleted: true, text: '', image: '' } : m));

    socket.on('receiveMessage', onMsg);
    socket.on('typing',         onTyping);
    socket.on('stopTyping',     onStop);
    socket.on('messagesRead',   onRead);
    socket.on('messageDeleted', onDeleted);
    return () => {
      socket.off('receiveMessage', onMsg);
      socket.off('typing',         onTyping);
      socket.off('stopTyping',     onStop);
      socket.off('messagesRead',   onRead);
      socket.off('messageDeleted', onDeleted);
    };
  }, [userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleTextChange = val => {
    setText(val);
    if (!isTypingRef.current) { isTypingRef.current = true; socket.emit('typing', { receiverId: userId, senderId: myId }); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { isTypingRef.current = false; socket.emit('stopTyping', { receiverId: userId, senderId: myId }); }, 1500);
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    clearTimeout(typingTimer.current);
    isTypingRef.current = false;
    socket.emit('stopTyping', { receiverId: userId, senderId: myId });
    try {
      const { data } = await sendMessage({ receiverId: userId, text: text.trim() });
      setMessages(p => [...p, data]);
      socket.emit('sendMessage', { receiverId: userId, message: data });
      setText('');
      inputRef.current?.focus();
    } catch {}
    finally { setSending(false); }
  };

  const handleDelete = msg => {
    if ((msg.sender?._id || msg.sender) !== myId) return;
    setDialog({
      title: 'Delete Message',
      message: 'This message will be deleted for everyone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: '🗑️',
      onConfirm: async () => {
        try {
          await deleteMessage(msg._id);
          setMessages(p => p.map(m => m._id === msg._id ? { ...m, deleted: true, text: '', image: '' } : m));
          socket.emit('deleteMessage', { receiverId: userId, messageId: msg._id });
        } catch {}
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: bg, overflow: 'hidden' }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />

      {/* Header */}
      <div style={{ padding: '12px 20px', backgroundColor: cardBg, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)', zIndex: 1 }}>
        <button onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: 20, padding: '2px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: '700', fontSize: 17, flexShrink: 0 }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '700', color: textMain, fontSize: 15, lineHeight: 1.2 }}>{userName}</p>
          <p style={{ fontSize: 12, color: isTyping ? colors.primary500 : colors.success500, marginTop: 2, fontWeight: isTyping ? '500' : '400' }}>
            {isTyping ? 'typing...' : '● Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, backgroundColor: bg }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>👋</p>
            <p style={{ fontWeight: '700', color: textMain, fontSize: 16, marginBottom: 6 }}>Say hello to {userName}!</p>
            <p style={{ color: muted, fontSize: 13 }}>Start the conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const mine    = (msg.sender?._id || msg.sender) === myId;
            const prevMine = idx > 0 && (messages[idx - 1].sender?._id || messages[idx - 1].sender) === myId;
            const showGap  = mine !== prevMine;

            return (
              <div key={msg._id} style={{ marginTop: showGap ? 12 : 2 }}>
                <div onDoubleClick={() => handleDelete(msg)} title={mine ? 'Double-click to delete' : ''} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  {/* Avatar for received */}
                  {!mine && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: '700', fontSize: 12, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end', marginBottom: 2 }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div style={{ maxWidth: '68%' }}>
                    <div style={{
                      padding: msg.deleted ? '8px 12px' : '10px 14px',
                      borderRadius: 16,
                      borderBottomRightRadius: mine ? 4 : 16,
                      borderBottomLeftRadius:  mine ? 16 : 4,
                      backgroundColor: msg.deleted
                        ? (isDark ? colors.subtleDark : colors.subtleLight)
                        : mine
                          ? colors.primary600
                          : (isDark ? colors.cardDark : colors.white),
                      border: msg.deleted || mine ? 'none' : `1px solid ${border}`,
                      boxShadow: msg.deleted ? 'none' : mine ? `0 2px 8px ${colors.primary600}30` : (isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'),
                    }}>
                      {msg.deleted ? (
                        <p style={{ color: muted, fontSize: 13, fontStyle: 'italic' }}>🗑 Message deleted</p>
                      ) : (
                        <>
                          {msg.product && (
                            <div style={{ backgroundColor: mine ? 'rgba(255,255,255,0.15)' : subtle, borderRadius: radius.sm, padding: '8px 10px', marginBottom: msg.text ? 8 : 0, border: mine ? 'none' : `1px solid ${border}` }}>
                              <p style={{ fontSize: 11, fontWeight: '700', color: mine ? colors.white : textMain, marginBottom: 2 }}>📦 {msg.product.title}</p>
                              <p style={{ fontSize: 12, color: mine ? colors.primary200 : colors.primary600, fontWeight: '600' }}>₹{msg.product.price?.toLocaleString()}</p>
                            </div>
                          )}
                          {msg.text && (
                            <p style={{ color: mine ? colors.white : textMain, fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.text}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Timestamp + read receipt */}
                    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'center', gap: 4, marginTop: 3, paddingInline: 2 }}>
                      <p style={{ fontSize: 11, color: muted }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {mine && !msg.deleted && (
                        <span style={{ fontSize: 12, color: msg.isRead ? colors.primary400 : muted, fontWeight: '600' }}>
                          {msg.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: '700', fontSize: 12, flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${border}`, borderRadius: 16, borderBottomLeftRadius: 4, padding: '10px 14px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: muted, display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Input bar — pinned at bottom */}
      <div style={{ padding: '12px 16px', backgroundColor: cardBg, borderTop: `1px solid ${border}`, display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, zIndex: 1 }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          style={{
            flex: 1, padding: '10px 14px',
            borderRadius: 20,
            border: `1.5px solid ${border}`,
            outline: 'none', fontSize: 14,
            resize: 'none', maxHeight: 120, overflowY: 'auto',
            fontFamily: 'inherit',
            color: isDark ? colors.textOnDark : colors.slate800,
            backgroundColor: isDark ? colors.subtleDark : colors.subtleLight,
            lineHeight: 1.5,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = colors.primary500}
          onBlur={e => e.target.style.borderColor = isDark ? colors.borderDark : colors.borderLight}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0,
            backgroundColor: text.trim() && !sending ? colors.primary600 : (isDark ? colors.subtleDark : colors.borderLight),
            color: text.trim() && !sending ? colors.white : muted,
            cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.15s, transform 0.1s',
            boxShadow: text.trim() && !sending ? `0 2px 8px ${colors.primary600}40` : 'none',
          }}
          onMouseEnter={e => text.trim() && !sending && (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {sending
            ? <Spinner size={18} color={colors.white} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          }
        </button>
      </div>
    </div>
  );
}
