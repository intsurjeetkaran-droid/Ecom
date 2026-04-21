/**
 * Conversations Screen  –  Module 4: Chat/Messaging
 * -------------------------------------------------
 * Inbox: shows all chat partners with last message preview.
 * Real-time: new messages update the list via socket.
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getConversations } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import socket from '../../utils/socket';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/theme';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = now - date;

  if (diff < 60_000)          return 'now';
  if (diff < 3_600_000)       return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000)      return `${Math.floor(diff / 3_600_000)}h`;
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const preview = (msg) => {
  if (!msg) return '';
  if (msg.deleted)  return '🗑 Message deleted';
  if (msg.image)    return '📷 Image';
  if (msg.product)  return '📦 Product shared';
  return msg.text?.length > 40 ? msg.text.slice(0, 40) + '…' : msg.text;
};

export default function ConversationsScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const fetchConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('[Conversations] Failed to load:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchConversations();
  }, []));

  useEffect(() => {
    socket.emit('join', user.id);

    const handleNewMessage = (msg) => {
      setConversations((prev) => {
        const senderId = msg.sender?._id || msg.sender;
        const existing = prev.find((c) => c.partner._id === senderId);

        if (existing) {
          return [
            { ...existing, lastMessage: msg, unreadCount: existing.unreadCount + 1 },
            ...prev.filter((c) => c.partner._id !== senderId),
          ];
        }
        fetchConversations();
        return prev;
      });
    };

    socket.on('receiveMessage', handleNewMessage);
    return () => socket.off('receiveMessage', handleNewMessage);
  }, [user.id]);

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
          Messages
        </Text>
        {conversations.length > 0 && (
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.partner._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />}
        ListEmptyComponent={
          <EmptyState
            emoji="💬"
            title="No messages yet"
            subtitle="Start a conversation by tapping 'Chat with Seller' on any product"
          />
        }
        renderItem={({ item }) => {
          const { partner, lastMessage, unreadCount } = item;
          const hasUnread = unreadCount > 0;

          return (
            <TouchableOpacity
              style={[styles.conversationItem, { borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}
              onPress={() => navigation.navigate('Chat', {
                userId:   partner._id,
                userName: partner.name,
              })}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {partner.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.onlineDot, { borderColor: isDark ? colors.bgDark : colors.bgLight }]} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={[
                    styles.partnerName,
                    hasUnread && styles.partnerNameUnread,
                    { color: hasUnread ? (isDark ? colors.white : colors.slate800) : (isDark ? colors.textOnDark : colors.slate800) }
                  ]}>
                    {partner.name}
                  </Text>
                  <Text style={[styles.time, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    {formatTime(lastMessage?.createdAt)}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text
                    style={[
                      styles.preview,
                      hasUnread && styles.previewUnread,
                      { color: hasUnread ? (isDark ? colors.textOnDark : colors.textDark) : (isDark ? colors.mutedDark : colors.mutedLight) }
                    ]}
                    numberOfLines={1}
                  >
                    {preview(lastMessage)}
                  </Text>

                  {hasUnread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.role, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  {partner.role}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success500,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  partnerNameUnread: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 11,
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  preview: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  previewUnread: {
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.primary600,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
