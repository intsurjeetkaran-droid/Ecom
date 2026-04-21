/**
 * Chat API  –  Module 4: Chat/Messaging
 * -------------------------------------------------
 * sendMessage(data)       → POST /api/chat/send        (text / image / product)
 * getConversations()      → GET  /api/chat/conversations
 * getConversation(userId) → GET  /api/chat/:userId
 * markAsRead(userId)      → PUT  /api/chat/:userId/read
 * deleteMessage(msgId)    → DELETE /api/chat/:messageId
 * -------------------------------------------------
 */

import api from './axios';

/**
 * Send a message.
 * @param {object} data — { receiverId, text?, image?, productId? }
 *   image: optional base64 data URI string
 */
export const sendMessage = (data) => api.post('/chat/send', data);

/**
 * Get inbox: list of chat partners with last message + unread count.
 */
export const getConversations = () => api.get('/chat/conversations');

/**
 * Get full message thread with a specific user.
 * Also marks all their messages to us as read on the backend.
 */
export const getConversation = (userId) => api.get(`/chat/${userId}`);

/**
 * Explicitly mark all messages from userId as read.
 */
export const markAsRead = (userId) => api.put(`/chat/${userId}/read`);

/**
 * Soft-delete own message.
 */
export const deleteMessage = (messageId) => api.delete(`/chat/${messageId}`);
