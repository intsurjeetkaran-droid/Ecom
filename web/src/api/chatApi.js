import api from './axios';
export const sendMessage      = (data)   => api.post('/chat/send', data);
export const getConversations = ()       => api.get('/chat/conversations');
export const getConversation  = (userId) => api.get(`/chat/${userId}`);
export const markAsRead       = (userId) => api.put(`/chat/${userId}/read`);
export const deleteMessage    = (id)     => api.delete(`/chat/${id}`);
