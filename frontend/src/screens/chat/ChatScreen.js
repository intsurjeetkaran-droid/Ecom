/**
 * Chat Screen  –  Module 4: Chat/Messaging
 * Real-time 1-to-1 messaging via Socket.io
 * Styled with inline styles.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Image, Pressable, StyleSheet,
} from 'react-native';
import { getConversation, sendMessage, deleteMessage, markAsRead } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import socket from '../../utils/socket';
import EmptyState from '../../components/EmptyState';
import { pickImage } from '../../utils/imageUtils';
import { colors } from '../../styles/theme';

export default function ChatScreen({ route, navigation }) {
  const { userId, userName, shareProduct } = route.params;
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [messages,      setMessages]      = useState([]);
  const [text,          setText]          = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [isTyping,      setIsTyping]      = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const flatListRef  = useRef();
  const typingTimer  = useRef(null);
  const isTypingRef  = useRef(false);

  useEffect(() => {
    navigation.setOptions({ title: userName, headerShown: true });
  }, [userName]);

  useEffect(() => {
    socket.emit('join', user.id);

    getConversation(userId)
      .then(({ data }) => {
        setMessages(data);
        setLoading(false);
        socket.emit('messagesRead', { senderId: userId, readerId: user.id });
      })
      .catch(() => setLoading(false));

    const onReceiveMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (senderId === userId || senderId === user.id) {
        setMessages((prev) => [...prev, msg]);
        markAsRead(userId).catch(() => {});
        socket.emit('messagesRead', { senderId: userId, readerId: user.id });
      }
    };

    const onTyping = ({ senderId }) => {
      if (senderId === userId) setIsTyping(true);
    };

    const onStopTyping = ({ senderId }) => {
      if (senderId === userId) setIsTyping(false);
    };

    const onMessagesRead = ({ readerId }) => {
      if (readerId === userId) {
        setMessages((prev) =>
          prev.map((m) => {
            const sid = m.sender?._id || m.sender;
            return sid === user.id ? { ...m, isRead: true } : m;
          })
        );
      }
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, deleted: true, text: '', image: '', product: null } : m)
      );
    };

    socket.on('receiveMessage',  onReceiveMessage);
    socket.on('typing',          onTyping);
    socket.on('stopTyping',      onStopTyping);
    socket.on('messagesRead',    onMessagesRead);
    socket.on('messageDeleted',  onMessageDeleted);

    if (shareProduct) {
      handleSendProduct(shareProduct);
    }

    return () => {
      socket.off('receiveMessage',  onReceiveMessage);
      socket.off('typing',          onTyping);
      socket.off('stopTyping',      onStopTyping);
      socket.off('messagesRead',    onMessagesRead);
      socket.off('messageDeleted',  onMessageDeleted);
    };
  }, [userId]);

  const handleTextChange = (val) => {
    setText(val);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { receiverId: userId, senderId: user.id });
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stopTyping', { receiverId: userId, senderId: user.id });
    }, 1500);
  };

  const handlePickImage = async () => {
    const dataUri = await pickImage({ quality: 0.7 });
    if (dataUri) setSelectedImage(dataUri);
  };

  const handleSendProduct = async (product) => {
    try {
      const { data } = await sendMessage({ receiverId: userId, productId: product._id });
      setMessages((prev) => [...prev, data]);
      socket.emit('sendMessage', { receiverId: userId, message: data });
    } catch (err) {
      console.error('[ChatScreen] Failed to share product:', err.message);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !selectedImage) return;
    setSending(true);

    clearTimeout(typingTimer.current);
    isTypingRef.current = false;
    socket.emit('stopTyping', { receiverId: userId, senderId: user.id });

    try {
      const payload = { receiverId: userId };
      if (text.trim())    payload.text  = text.trim();
      if (selectedImage)  payload.image = selectedImage;

      const { data } = await sendMessage(payload);
      setMessages((prev) => [...prev, data]);
      socket.emit('sendMessage', { receiverId: userId, message: data });
      setText('');
      setSelectedImage(null);
    } catch (err) {
      Alert.alert('Send Failed', err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleLongPress = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    if (senderId !== user.id) return;

    Alert.alert('Delete Message', 'Delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(msg._id);
            setMessages((prev) =>
              prev.map((m) => m._id === msg._id ? { ...m, deleted: true, text: '', image: '', product: null } : m)
            );
            socket.emit('deleteMessage', { receiverId: userId, messageId: msg._id });
          } catch (err) {
            Alert.alert('Error', 'Could not delete message');
          }
        },
      },
    ]);
  };

  const isMine = (msg) => {
    const sid = msg.sender?._id || msg.sender;
    return sid === user.id;
  };

  const renderMessage = ({ item }) => {
    const mine    = isMine(item);
    const deleted = item.deleted;

    return (
      <Pressable
        onLongPress={() => handleLongPress(item)}
        style={[styles.messageBubble, mine ? styles.messageMine : styles.messageTheirs]}
      >
        {deleted ? (
          <View style={[
            styles.deletedBubble,
            { borderColor: isDark ? colors.borderDark : colors.borderLight },
            mine ? styles.bubbleMineRadius : styles.bubbleTheirsRadius
          ]}>
            <Text style={[styles.deletedText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              🗑 Message deleted
            </Text>
          </View>
        ) : (
          <View style={[
            styles.bubble,
            mine ? [styles.bubbleMine, styles.bubbleMineRadius] : [
              styles.bubbleTheirs,
              styles.bubbleTheirsRadius,
              { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }
            ]
          ]}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : null}

            {item.product ? (
              <View style={[styles.productCard, item.image && styles.productCardBorder]}>
                <View style={styles.productRow}>
                  <Text style={styles.productIcon}>📦</Text>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productTitle, { color: mine ? colors.white : (isDark ? colors.textOnDark : colors.slate800) }]} numberOfLines={1}>
                      {item.product.title}
                    </Text>
                    <Text style={[styles.productPrice, { color: mine ? colors.primary200 : (isDark ? colors.primary400 : colors.primary600) }]}>
                      ₹{item.product.price}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {item.text ? (
              <View style={styles.textContainer}>
                <Text style={[styles.messageText, { color: mine ? colors.white : (isDark ? colors.textOnDark : colors.slate800) }]}>
                  {item.text}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={[styles.timestampRow, mine ? styles.timestampMine : styles.timestampTheirs]}>
          <Text style={[styles.timestamp, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {mine && !deleted && (
            <Text style={[styles.readReceipt, { color: item.isRead ? colors.primary400 : (isDark ? colors.mutedDark : colors.mutedLight) }]}>
              {item.isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen safe={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary600} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <EmptyState
                emoji="👋"
                title={`Say hello to ${userName}!`}
                subtitle="Start the conversation"
              />
            }
            renderItem={renderMessage}
          />
        )}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={[
              styles.typingBubble,
              {
                backgroundColor: isDark ? colors.cardDark : colors.cardLight,
                borderColor: isDark ? colors.borderDark : colors.borderLight,
              }
            ]}>
              <Text style={[styles.typingText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                {userName} is typing…
              </Text>
            </View>
          </View>
        )}

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity onPress={() => setSelectedImage(null)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[
          styles.inputBar,
          {
            backgroundColor: isDark ? colors.cardDark : colors.cardLight,
            borderTopColor: isDark ? colors.borderDark : colors.borderLight,
          }
        ]}>
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}
            onPress={handlePickImage}
            disabled={sending}
          >
            <Text style={styles.imageButtonIcon}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? colors.subtleDark : colors.subtleLight,
                color: isDark ? colors.textOnDark : colors.slate800,
              }
            ]}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedLight}
            multiline
            maxLength={2000}
            editable={!sending}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: (text.trim() || selectedImage) && !sending
                  ? colors.primary600
                  : (isDark ? colors.subtleDark : colors.subtleLight)
              }
            ]}
            onPress={handleSend}
            disabled={(!text.trim() && !selectedImage) || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primary600} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '78%',
    marginBottom: 8,
  },
  messageMine: {
    alignSelf: 'flex-end',
  },
  messageTheirs: {
    alignSelf: 'flex-start',
  },
  deletedBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleMineRadius: {
    borderBottomRightRadius: 4,
  },
  bubbleTheirsRadius: {
    borderBottomLeftRadius: 4,
  },
  deletedText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bubble: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bubbleMine: {
    backgroundColor: colors.primary600,
  },
  bubbleTheirs: {
    borderWidth: 1,
  },
  messageImage: {
    width: 208,
    height: 208,
  },
  productCard: {
    padding: 12,
  },
  productCardBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 11,
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  timestampMine: {
    justifyContent: 'flex-end',
  },
  timestampTheirs: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 11,
  },
  readReceipt: {
    fontSize: 11,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 14,
  },
  imagePreview: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 8,
  },
  removeText: {
    color: colors.danger500,
    fontWeight: '500',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  imageButtonIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 112,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendIcon: {
    color: colors.white,
    fontSize: 16,
  },
});
