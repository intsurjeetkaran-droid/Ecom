/**
 * Chat Controller  –  Module 4: Chat/Messaging
 * -------------------------------------------------
 * Routes:
 *   POST /api/chat/send              → sendMessage()        [authenticated]
 *   GET  /api/chat/conversations     → getConversations()   [authenticated]
 *   GET  /api/chat/:userId           → getConversation()    [authenticated]
 *   PUT  /api/chat/:userId/read      → markAsRead()         [authenticated]
 *   DELETE /api/chat/:messageId      → deleteMessage()      [sender only]
 *
 * Rules (from guide):
 *   - Only buyer ↔ seller chat is allowed
 *   - Admin cannot participate in chats
 *   - Messages stored in DB
 * -------------------------------------------------
 */

const Message = require('../models/Message');
const User    = require('../models/User');
const { validateBase64Image } = require('../utils/imageUtils');

// ─── Helper: validate buyer↔seller rule ──────────
/**
 * Returns an error string if the chat is not allowed,
 * or null if it's valid.
 */
const validateChatParticipants = (senderRole, receiverRole) => {
  // Admins cannot participate in chats
  if (senderRole === 'admin' || receiverRole === 'admin') {
    return 'Admins cannot participate in chats';
  }
  if (senderRole === receiverRole) {
    return `${senderRole}s cannot chat with other ${senderRole}s`;
  }
  return null;
};

// ─── Send Message ─────────────────────────────────
/**
 * POST /api/chat/send
 * Body: { receiverId, text?, image?, productId? }
 *   image: optional base64 data URI (e.g. "data:image/jpeg;base64,...")
 *
 * - Validates buyer↔seller rule
 * - Validates base64 image if provided
 * - At least one of text/image/product must be present
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, image, productId } = req.body;

    // ── Receiver must exist ──
    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    const receiver = await User.findById(receiverId).select('role name isBlocked');
    if (!receiver) {
      console.warn(`[Chat] sendMessage: receiver not found → id: ${receiverId}`);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // ── Blocked user check ──
    if (receiver.isBlocked) {
      return res.status(403).json({ message: 'Cannot send message to a blocked user' });
    }

    // ── Buyer↔seller rule ──
    const roleError = validateChatParticipants(req.user.role, receiver.role);
    if (roleError) {
      console.warn(`[Chat] sendMessage blocked: ${req.user.role} → ${receiver.role} | ${roleError}`);
      return res.status(403).json({ message: roleError });
    }

    // ── Validate base64 image if provided ──
    let validatedImage = '';
    if (image) {
      const imgResult = validateBase64Image(image);
      if (!imgResult.valid) {
        return res.status(400).json({ message: imgResult.error });
      }
      validatedImage = image; // store full data URI
    }

    // ── At least one content type required ──
    if (!text?.trim() && !validatedImage && !productId) {
      return res.status(400).json({ message: 'Message must contain text, an image, or a product' });
    }

    const message = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      text:     text?.trim() || '',
      image:    validatedImage,
      product:  productId || null,
    });

    await message.populate('product', 'title price images');

    console.log(`[Chat] Message sent → from: ${req.user._id} (${req.user.role}), to: ${receiverId} (${receiver.role}), type: ${validatedImage ? 'image' : productId ? 'product' : 'text'}`);
    res.status(201).json(message);
  } catch (err) {
    console.error('[Chat] sendMessage error:', err.message);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// ─── Get Conversations (Inbox) ────────────────────
/**
 * GET /api/chat/conversations
 *
 * Returns a list of unique chat partners with:
 *   - partner user info (name, avatar, role)
 *   - last message preview
 *   - unread message count
 *
 * Sorted by most recent message first.
 */
const getConversations = async (req, res) => {
  try {
    // Get all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender receiver', 'name avatar role');

    // Build conversation map: partnerId → { partner, lastMessage, unreadCount }
    const convMap = new Map();

    for (const msg of messages) {
      // Guard against deleted/null users
      if (!msg.sender || !msg.receiver) continue;

      const isSender = msg.sender._id.toString() === req.user._id.toString();
      const partner  = isSender ? msg.receiver : msg.sender;
      if (!partner?._id) continue; // skip if partner was deleted

      const pid = partner._id.toString();

      if (!convMap.has(pid)) {
        // First (most recent) message for this partner
        convMap.set(pid, {
          partner,
          lastMessage:  msg,
          unreadCount:  0,
        });
      }

      // Count unread messages sent TO the current user
      if (!isSender && !msg.isRead) {
        convMap.get(pid).unreadCount += 1;
      }
    }

    const conversations = Array.from(convMap.values());
    console.log(`[Chat] Conversations fetched → userId: ${req.user._id}, count: ${conversations.length}`);
    res.json(conversations);
  } catch (err) {
    console.error('[Chat] getConversations error:', err.message);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// ─── Get Conversation (Message Thread) ───────────
/**
 * GET /api/chat/:userId
 *
 * Returns all messages between the current user and :userId,
 * sorted oldest → newest (for chat display).
 * Also marks all received messages as read.
 */
const getConversation = async (req, res) => {
  try {
    const otherId = req.params.userId;

    // Verify the other user exists
    const other = await User.findById(otherId).select('name role');
    if (!other) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch messages in both directions
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherId },
        { sender: otherId,      receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 }) // oldest first for chat display
      .populate('product', 'title price images status');

    // Mark all unread messages from the other user as read
    const unreadCount = await Message.countDocuments({
      sender:   otherId,
      receiver: req.user._id,
      isRead:   false,
    });

    if (unreadCount > 0) {
      await Message.updateMany(
        { sender: otherId, receiver: req.user._id, isRead: false },
        { isRead: true }
      );
      console.log(`[Chat] Marked ${unreadCount} messages as read → from: ${otherId}, to: ${req.user._id}`);
    }

    console.log(`[Chat] Conversation fetched → between: ${req.user._id} ↔ ${otherId}, messages: ${messages.length}`);
    res.json(messages);
  } catch (err) {
    console.error('[Chat] getConversation error:', err.message);
    res.status(500).json({ message: 'Server error fetching conversation' });
  }
};

// ─── Mark Messages as Read ────────────────────────
/**
 * PUT /api/chat/:userId/read
 * Marks all messages from :userId to current user as read.
 * Called when user opens a conversation.
 */
const markAsRead = async (req, res) => {
  try {
    const result = await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    console.log(`[Chat] markAsRead → from: ${req.params.userId}, to: ${req.user._id}, updated: ${result.modifiedCount}`);
    res.json({ message: 'Messages marked as read', count: result.modifiedCount });
  } catch (err) {
    console.error('[Chat] markAsRead error:', err.message);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
};

// ─── Delete Message ───────────────────────────────
/**
 * DELETE /api/chat/:messageId
 * Only the sender can delete their own message.
 * Soft-delete: replaces content with a "deleted" marker.
 */
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id:    req.params.messageId,
      sender: req.user._id,
    });

    if (!message) {
      console.warn(`[Chat] deleteMessage: not found or unauthorized → id: ${req.params.messageId}`);
      return res.status(404).json({ message: 'Message not found or you are not the sender' });
    }

    // Soft delete — preserve the message shell so conversation history stays intact
    message.text    = '';
    message.image   = '';
    message.product = null;
    message.deleted = true;
    await message.save();

    console.log(`[Chat] Message deleted → id: ${message._id}, sender: ${req.user._id}`);
    res.json({ message: 'Message deleted', id: message._id });
  } catch (err) {
    console.error('[Chat] deleteMessage error:', err.message);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

module.exports = { sendMessage, getConversations, getConversation, markAsRead, deleteMessage };
