# Chat Marketplace

A full-stack marketplace with real-time chat, product listings, and manual UPI payment.

**One backend. Two frontends:**
- `frontend/` — React Native (Expo) mobile app for Android & iOS
- `web/` — React (Vite) web app for desktop browsers

> For a plain-English guide see [detail.txt](./detail.txt)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Roles & Access](#roles--access)
4. [Business Rules](#business-rules)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Setup Instructions](#setup-instructions)
8. [API Overview](#api-overview)
9. [Security](#security)
10. [Known Fixes](#known-fixes)
11. [Module Status](#module-status)

---

## Project Overview

Chat Marketplace lets users:
- **Browse and list products** (like OLX)
- **Chat in real-time** with buyers/sellers (like WhatsApp)
- **Pay manually via UPI** — no payment gateway needed
- **Admins control** product approvals, user management, and platform integrity

Available on:
- 📱 **Mobile** — Android & iOS via Expo Go
- 🌐 **Web** — any desktop browser at `http://localhost:5173`

---

## Features

### 🔐 Authentication
- Register with name, email, password (min 6 chars)
- Login with JWT session (7-day token)
- Blocked users cannot log in
- Rate limiting: 20 attempts / 15 min on auth endpoints

### 👤 User Management
- View and edit profile
- Buyer can upgrade to Seller (one-way, permanent)
- Admin can block/unblock any user instantly
- Dark/light mode toggle (persisted per device/browser)

### 🛍️ Product Management
- Sellers list products with up to 5 images (base64)
- All products require admin approval before going live
- Editing an approved product resets it to pending
- Search by keyword, filter by category, paginated results

### 💬 Chat / Messaging
- Real-time 1-to-1 chat via Socket.IO (buyer ↔ seller only)
- Send text, images, and product cards
- Typing indicators, read receipts (✓ / ✓✓)
- Soft-delete own messages
- Unread message count in inbox

### 🛒 Order Management
- Buyer places order → `initiated`
- Buyer submits UPI transaction ID → `payment_pending`
- Seller confirms or rejects → `paid` or `failed`
- Seller marks delivered → `completed`
- Buyer can cancel only before submitting payment
- One active order per product per buyer (no duplicates)

### 💳 Payment (Manual UPI)
- Seller sets up UPI ID, bank details, QR code image
- Buyer views seller's payment details in-app
- Buyer pays via external UPI app, submits proof
- Seller manually verifies — no auto-confirmation
- Permanent payment audit trail per order

### 🧑‍💼 Admin Panel
- Analytics dashboard: users, products, orders, revenue
- Pending actions banner
- User search with role filter + block/unblock
- Product approval with status filter tabs
- All orders and payments with pagination

---

## Roles & Access

| Feature | Buyer | Seller | Admin |
|---------|-------|--------|-------|
| Browse products | ✅ | ✅ | ✅ |
| Place orders | ✅ | ❌ | ❌ |
| List products | ❌ | ✅ | ❌ |
| Chat | ✅ with sellers | ✅ with buyers | ❌ |
| Verify payments | ❌ | ✅ | ❌ |
| Approve products | ❌ | ❌ | ✅ |
| Block users | ❌ | ❌ | ✅ |
| View all orders | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ |

---

## Business Rules

- Every product starts as `pending` — admin must approve before buyers see it
- Editing any product resets it to `pending` for re-review
- Only one active order per product per buyer
- Order can only be cancelled while in `initiated` status
- Status flow: `initiated → payment_pending → paid → completed` (or `failed` / `cancelled`)
- Payment happens outside the app (UPI app) — seller manually verifies
- Default role on registration: `buyer`
- Buyer → Seller upgrade is one-way and permanent
- Admin accounts are created manually in the database
- Blocked users cannot log in, chat, or place orders

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Node.js + Express.js | Express 5.x |
| **Database** | MongoDB + Mongoose | Mongoose 9.x |
| **Auth** | JWT (jsonwebtoken) | 9.x |
| **Password** | bcryptjs | 3.x |
| **Real-time** | Socket.IO | 4.x |
| **Security** | Helmet + express-rate-limit | — |
| **Mobile App** | React Native (Expo) | 0.74.5 / Expo 51 |
| **Mobile Nav** | React Navigation | v6 |
| **Mobile Style** | React Native StyleSheet (no Tailwind) | — |
| **Web App** | React + Vite | React 19 / Vite 5 |
| **Web Routing** | React Router DOM | v7 |
| **Web Style** | Inline styles (no CSS framework) | — |
| **HTTP Client** | Axios | 1.6.x |
| **Socket Client** | socket.io-client | 4.x |
| **Images** | Base64 data URIs stored in MongoDB | — |
| **Image Picker** | expo-image-picker (mobile) / FileReader API (web) | — |

---

## Project Structure

```
ecom/
├── backend/                        # Node.js + Express API server
│   ├── config/
│   │   └── db.js                   # MongoDB connection with retry
│   ├── controllers/
│   │   ├── adminController.js      # Analytics
│   │   ├── authController.js       # Register, login, logout
│   │   ├── chatController.js       # Messages, conversations
│   │   ├── orderController.js      # Order lifecycle
│   │   ├── paymentController.js    # Payment records, UPI details
│   │   ├── productController.js    # Product CRUD + approval
│   │   └── userController.js       # Profile, roles, block/unblock
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── roleMiddleware.js       # Role-based access control
│   ├── models/
│   │   ├── Message.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   └── User.js                 # bcryptjs pre-save hook (async, no next())
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── imageUtils.js           # Base64 validation
│   ├── seed.js                     # Database seed script
│   ├── .env
│   ├── package.json
│   └── server.js                   # Entry point + Socket.IO
│
├── frontend/                       # React Native (Expo) mobile app
│   ├── src/
│   │   ├── api/                    # Axios API modules
│   │   ├── components/             # Button, Card, Input, Screen, etc.
│   │   ├── context/                # AuthContext, ThemeContext
│   │   ├── navigation/             # AppNavigator (role-based)
│   │   ├── screens/
│   │   │   ├── admin/              # Dashboard, Users, Products, Orders, Payments
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── buyer/              # Home, ProductDetail, Orders
│   │   │   ├── chat/               # Conversations, Chat
│   │   │   ├── orders/             # OrderDetail (shared)
│   │   │   ├── payment/            # PaymentDetails, History, Setup
│   │   │   ├── seller/             # Products, AddProduct, EditProduct, Orders
│   │   │   └── shared/             # Profile, EditProfile, BecomeSeller
│   │   ├── styles/
│   │   │   └── theme.js            # Colors, spacing, radius, fontSize
│   │   └── utils/
│   │       ├── imageUtils.js       # Pick + convert to base64
│   │       └── socket.js           # Socket.IO singleton
│   ├── App.js
│   ├── index.js                    # registerRootComponent entry point
│   ├── babel.config.js
│   ├── metro.config.js
│   └── package.json
│
└── web/                            # React (Vite) web app
    ├── src/
    │   ├── api/                    # Axios API modules (same endpoints as mobile)
    │   │   ├── axios.js            # Base URL + JWT interceptor
    │   │   ├── authApi.js
    │   │   ├── userApi.js
    │   │   ├── productApi.js
    │   │   ├── chatApi.js
    │   │   ├── orderApi.js
    │   │   ├── paymentApi.js
    │   │   └── adminApi.js
    │   ├── components/             # Button, Card, Input, Modal, Badge, etc.
    │   ├── context/
    │   │   ├── AuthContext.jsx     # JWT in localStorage
    │   │   └── ThemeContext.jsx    # Dark/light mode (localStorage persisted)
    │   ├── layouts/
    │   │   └── MainLayout.jsx      # Sidebar + content area
    │   ├── pages/
    │   │   ├── admin/              # Dashboard, Users, Products, Orders, Payments
    │   │   ├── auth/               # Login, Register
    │   │   ├── buyer/              # Home, ProductDetail, Orders
    │   │   ├── chat/               # Conversations, Chat
    │   │   ├── orders/             # OrderDetail
    │   │   ├── payment/            # Setup, History, Details, Record
    │   │   ├── profile/            # Profile
    │   │   └── seller/             # Products, AddProduct, Orders
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx  # Auth + role guard
    │   ├── styles/
    │   │   └── theme.js            # Same color palette as mobile
    │   └── utils/
    │       └── socket.js           # Socket.IO singleton
    ├── config.js                   # API_URL = http://localhost:5000/api
    ├── overview.txt                # Plain-English guide for web app
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Expo Go app on your phone (for mobile)

---

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ECOM_DB?retryWrites=true&w=majority
JWT_SECRET=your_very_long_random_secret_key_at_least_32_chars
NODE_ENV=development
ALLOWED_ORIGINS=*
MAX_IMAGE_BYTES=1048576
MAX_IMAGES=5
```

Start:
```bash
npm run dev      # development (nodemon, auto-restart)
npm start        # production
```

Health check: `http://localhost:5000/health`

Seed database with test data:
```bash
node seed.js
```

---

### 2. Web App

```bash
cd web
npm install
npm run dev
```

Open: **http://localhost:5173**

> The web app uses `http://localhost:5000` as the backend URL.
> Backend must be running first.

---

### 3. Mobile App (Expo)

```bash
cd frontend
npm install --legacy-peer-deps
```

Update `frontend/src/config.js` with your machine's WiFi IP:
```js
export const SERVER_IP = '192.168.x.x';  // find with: ipconfig (Windows) or ifconfig (Mac)
```

Start:
```bash
npx expo start
```

- Scan the QR code with **Expo Go** on your phone
- Press `w` to open in web browser (uses localhost automatically)

> Phone and computer must be on the **same WiFi network**.

---

### 4. Create Admin Account

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourPassword123',10))"
```

Insert via MongoDB Atlas / Compass:
```json
{
  "name": "Admin",
  "email": "admin@yourapp.com",
  "password": "<bcrypt-hash>",
  "role": "admin",
  "isBlocked": false
}
```

---

### Test Credentials (after running seed.js)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Seller | seller1@test.com | Seller@123 |
| Buyer | buyer1@test.com | Buyer@123 |

---

## API Overview

### Authentication
```
POST /api/auth/register    Register new user (returns JWT + user)
POST /api/auth/login       Login (returns JWT + user)
POST /api/auth/logout      Logout (protected)
```

### Users
```
GET  /api/users/profile          Own profile
PUT  /api/users/profile          Update name/avatar
PUT  /api/users/become-seller    Upgrade to seller (buyer only)
GET  /api/users                  All users — search, role filter (admin)
PUT  /api/users/:id/block        Toggle block/unblock (admin)
```

### Products
```
GET    /api/products              Approved products — search, category, paginated
GET    /api/products/:id          Single product
GET    /api/products/my           Seller's own products
GET    /api/products/all          All products — status filter (admin)
POST   /api/products              Create product (seller)
PUT    /api/products/:id          Edit product — resets to pending (seller)
DELETE /api/products/:id          Delete product (seller)
PUT    /api/products/:id/status   Approve/reject (admin)
```

### Chat
```
POST   /api/chat/send              Send message (text/image/product)
GET    /api/chat/conversations     Inbox with unread counts
GET    /api/chat/:userId           Message thread (marks as read)
PUT    /api/chat/:userId/read      Mark messages as read
DELETE /api/chat/:messageId        Soft-delete own message
```

### Orders
```
POST /api/orders                       Place order (buyer)
GET  /api/orders/buyer                 Buyer's orders
GET  /api/orders/seller                Seller's orders (?status=)
GET  /api/orders/:id                   Order detail
POST /api/orders/:id/submit-payment    Submit payment proof (buyer)
PUT  /api/orders/:id/verify            Confirm/reject payment (seller)
PUT  /api/orders/:id/complete          Mark delivered (seller)
PUT  /api/orders/:id/cancel            Cancel order (buyer, initiated only)
GET  /api/orders                       All orders (admin)
```

### Payments
```
GET  /api/payments/my                  Own payment history
GET  /api/payments/order/:orderId      Payment for specific order
PUT  /api/payments/seller/details      Save UPI/bank/QR (seller)
GET  /api/payments/seller/:sellerId    Get seller's payment info (buyer)
GET  /api/payments                     All payments + revenue (admin)
```

### Admin
```
GET /api/admin/analytics    Full platform analytics
```

---

## Security

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens, verified on every protected request |
| Password storage | bcryptjs, salt rounds = 10, async pre-save hook |
| Rate limiting | 20 req/15min on auth, 500 req/15min on API |
| HTTP headers | Helmet.js (XSS, clickjacking, MIME sniffing) |
| Role enforcement | Middleware on every protected route |
| Input validation | Server-side validation on all endpoints |
| Blocked users | Checked on every authenticated request |
| CORS | Configurable via `ALLOWED_ORIGINS` env var |
| Startup validation | App exits if `JWT_SECRET` or `MONGO_URI` missing |

---

## Known Fixes

### bcryptjs v3 — Register 500 Error (Fixed)
**Problem:** `bcryptjs` v3.0.3 changed its internal API. Calling `next()` after
`await bcrypt.hash()` in a Mongoose async pre-save hook threw `next is not a function`,
causing all register attempts to return HTTP 500.

**Fix applied in `backend/models/User.js`:**
```js
// BEFORE (broken with bcryptjs v3):
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next(); // ← throws "next is not a function"
});

// AFTER (fixed):
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
  // Mongoose 6+ handles async middleware automatically — no next() needed
});
```

---

## Image Handling

All images stored as **base64 data URIs** in MongoDB — no file system, no multer.

- **Mobile:** `expo-image-picker` → base64 mode → sent as JSON
- **Web:** `FileReader API` → base64 → sent as JSON
- **Stored in:** `product.images[]`, `message.image`, `order.paymentProof.screenshotB64`, `user.paymentDetails.qrImageB64`
- **Max size:** 1MB per image (`MAX_IMAGE_BYTES` env var)
- **Max count:** 5 per product (`MAX_IMAGES` env var)
- **Formats:** JPEG, PNG, WebP

---

## Module Status

| # | Module | Mobile | Web |
|---|--------|--------|-----|
| 1 | Authentication | ✅ | ✅ |
| 2 | User Management | ✅ | ✅ |
| 3 | Product Management | ✅ | ✅ |
| 4 | Chat / Messaging | ✅ | ✅ |
| 5 | Order Management | ✅ | ✅ |
| 6 | Payment (Manual UPI) | ✅ | ✅ |
| 7 | Admin Panel | ✅ | ✅ |

**All 7 modules complete on both platforms.**
