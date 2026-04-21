/**
 * Server Entry Point  –  Chat Marketplace App
 * -------------------------------------------------
 * - Validates required environment variables on startup
 * - Connects to MongoDB
 * - Applies security middleware (helmet, rate limiting, CORS)
 * - Mounts all API routes
 * - Initializes Socket.io for real-time chat
 * - Starts HTTP server
 * -------------------------------------------------
 */

require('dotenv').config();

// ─── Startup Validation ───────────────────────────
// Fail fast if critical env vars are missing
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[Server] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('[Server] WARNING: JWT_SECRET is too short. Use at least 32 characters for security.');
}

const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');

const app    = express();
const server = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS === '*'
  ? '*'
  : process.env.ALLOWED_ORIGINS?.split(',') || '*';

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

// ─── Database ─────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────
// Auth endpoints: stricter limit to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API: generous limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api',      apiLimiter);

// ─── Body Parsing ─────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────
// Serve uploaded images (products, chat, payments, QR codes)
app.use('/uploads', express.static('uploads'));

// ─── API Routes ───────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat',     require('./routes/chatRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// ─── Health Check ─────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// ─── 404 Handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// ─── Socket.io – Real-time Chat ───────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] User connected → socketId: ${socket.id}`);

  // User joins their own room (userId as room name)
  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(String(userId));
    console.log(`[Socket] User joined room → userId: ${userId}`);
  });

  // Relay message to receiver's room
  socket.on('sendMessage', ({ receiverId, message }) => {
    if (!receiverId || !message) return;
    io.to(String(receiverId)).emit('receiveMessage', message);
  });

  // Typing indicator
  socket.on('typing', ({ receiverId, senderId }) => {
    if (!receiverId || !senderId) return;
    io.to(String(receiverId)).emit('typing', { senderId });
  });

  // Stop typing
  socket.on('stopTyping', ({ receiverId, senderId }) => {
    if (!receiverId || !senderId) return;
    io.to(String(receiverId)).emit('stopTyping', { senderId });
  });

  // Read receipt — notify sender their messages were read
  socket.on('messagesRead', ({ senderId, readerId }) => {
    if (!senderId || !readerId) return;
    io.to(String(senderId)).emit('messagesRead', { readerId });
  });

  // Message soft-deleted — notify other party
  socket.on('deleteMessage', ({ receiverId, messageId }) => {
    if (!receiverId || !messageId) return;
    io.to(String(receiverId)).emit('messageDeleted', { messageId });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected → socketId: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
