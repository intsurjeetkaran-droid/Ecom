/**
 * Message Model  –  Module 4: Chat/Messaging
 * -------------------------------------------------
 * Represents a single message in a 1-to-1 conversation.
 *
 * A message can contain:
 *   - text    → plain text content
 *   - image   → path to uploaded image (under /uploads/chat/)
 *   - product → reference to a shared product card
 *
 * Rules:
 *   - Only buyer ↔ seller chat is allowed (enforced in controller)
 *   - isRead tracks whether receiver has seen the message
 *   - deleted flag for soft-delete (content cleared, shell kept)
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    // Plain text content
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    // Base64 data URI of the image (e.g. "data:image/jpeg;base64,...")
    // Empty string when no image is attached
    image: {
      type: String,
      default: '',
    },
    // Shared product card — populated on fetch
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    // Whether the receiver has read this message
    isRead: {
      type: Boolean,
      default: false,
    },
    // Soft-delete flag — content is cleared but record is kept
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Compound index for fast conversation queries ──
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 }); // for unread count queries

module.exports = mongoose.model('Message', messageSchema);
