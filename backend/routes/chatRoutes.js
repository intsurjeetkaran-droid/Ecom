/**
 * Chat Routes  –  Module 4: Chat/Messaging
 * -------------------------------------------------
 * All routes accept JSON (application/json).
 * Images are sent as base64 data URIs in the request body.
 * No file upload middleware — multer removed.
 *
 * POST   /api/chat/send              → Send message (text / base64 image / product)
 * GET    /api/chat/conversations     → Inbox: list of chat partners + last msg + unread
 * GET    /api/chat/:userId           → Full message thread with a user
 * PUT    /api/chat/:userId/read      → Mark all messages from :userId as read
 * DELETE /api/chat/:messageId        → Soft-delete own message
 *
 * NOTE: Static routes (/send, /conversations) must be defined
 * BEFORE dynamic routes (/:userId).
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getConversations,
  getConversation,
  markAsRead,
  deleteMessage,
} = require('../controllers/chatController');

// ── Static routes first ──
router.post('/send',         protect, sendMessage);
router.get('/conversations', protect, getConversations);

// ── Dynamic routes ──
router.get('/:userId',       protect, getConversation);
router.put('/:userId/read',  protect, markAsRead);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
