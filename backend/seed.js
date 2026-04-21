/**
 * Database Seed Script  –  Chat Marketplace
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User    = require('./models/User');
const Product = require('./models/Product');
const Order   = require('./models/Order');
const Payment = require('./models/Payment');
const Message = require('./models/Message');

const PLACEHOLDER_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const fakeTxnId = () => {
  const prefix = ['T', 'UPI', 'GPY', 'PPE', 'PTM'][Math.floor(Math.random() * 5)];
  return prefix + Date.now().toString().slice(-10) + Math.floor(Math.random() * 1000);
};

const daysAgo = (n) => new Date(Date.now() - Math.random() * n * 86400000);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🗑  Collections cleared');

  // ── Pre-hash passwords (bypass pre-save hook via insertMany) ──
  const adminHash  = bcrypt.hashSync('Admin@123',  10);
  const sellerHash = bcrypt.hashSync('Seller@123', 10);
  const buyerHash  = bcrypt.hashSync('Buyer@123',  10);

  // ── Admin ──
  const [admin] = await User.insertMany([{
    name: 'Admin User', email: 'admin@test.com',
    password: adminHash, role: 'admin', isBlocked: false,
  }]);

  // ── Sellers ──
  const sellers = await User.insertMany([
    {
      name: 'Rahul Sharma', email: 'seller1@test.com',
      password: sellerHash, role: 'seller', isBlocked: false,
      paymentDetails: { upiId: 'rahul.sharma@upi', bankName: 'State Bank of India', accountNo: '31245678901', ifscCode: 'SBIN0001234' },
    },
    {
      name: 'Priya Patel', email: 'seller2@test.com',
      password: sellerHash, role: 'seller', isBlocked: false,
      paymentDetails: { upiId: 'priya.patel@upi', bankName: 'HDFC Bank', accountNo: '50100234567890', ifscCode: 'HDFC0001234' },
    },
    {
      name: 'Amit Kumar', email: 'seller3@test.com',
      password: sellerHash, role: 'seller', isBlocked: false,
      paymentDetails: { upiId: 'amit.kumar@upi', bankName: 'ICICI Bank', accountNo: '123456789012', ifscCode: 'ICIC0001234' },
    },
  ]);

  // ── Buyers ──
  const buyers = await User.insertMany([
    { name: 'Sneha Gupta',    email: 'buyer1@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Vikram Singh',   email: 'buyer2@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Anjali Mehta',   email: 'buyer3@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Rohan Verma',    email: 'buyer4@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Pooja Nair',     email: 'buyer5@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Karan Malhotra', email: 'buyer6@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
    { name: 'Divya Reddy',    email: 'buyer7@test.com', password: buyerHash, role: 'buyer', isBlocked: false },
  ]);

  console.log('👥 Users created  →  1 admin, 3 sellers, 7 buyers');

  // ════════════════════════════════════════════════
  // PRODUCTS
  // ════════════════════════════════════════════════
  const products = await Product.insertMany([
    // Seller 1 — Electronics
    { seller: sellers[0]._id, title: 'Samsung Galaxy S21 - 128GB', description: 'Used Samsung Galaxy S21 in excellent condition. 128GB storage, 8GB RAM. Minor scratches on back. Battery health 89%. Comes with original charger and box.', price: 28000, category: 'Electronics', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[0]._id, title: 'Sony WH-1000XM4 Headphones', description: 'Premium noise-cancelling wireless headphones. Used for 6 months. Excellent sound quality. 30-hour battery life. Comes with carrying case and cables.', price: 12500, category: 'Electronics', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[0]._id, title: 'Dell Inspiron 15 Laptop - i5 11th Gen', description: 'Dell Inspiron 15 laptop with Intel i5 11th Gen processor, 8GB RAM, 512GB SSD. Windows 11 installed. 1 year old, in great condition. Charger included.', price: 42000, category: 'Electronics', images: [PLACEHOLDER_IMG, PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[0]._id, title: 'Canon EOS 1500D DSLR Camera', description: 'Canon EOS 1500D with 18-55mm kit lens. 24.1MP sensor. Perfect for beginners. Shutter count: 8500. Comes with bag, extra battery, and 32GB SD card.', price: 22000, category: 'Electronics', images: [PLACEHOLDER_IMG], status: 'approved' },
    // Seller 2 — Furniture + Clothing
    { seller: sellers[1]._id, title: 'Wooden Study Table with Bookshelf', description: 'Solid wood study table with attached bookshelf. Dimensions: 4ft x 2ft. Light brown finish. Minor wear on edges. Self-pickup only from Pune.', price: 4500, category: 'Furniture', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[1]._id, title: 'Office Chair - Ergonomic with Lumbar Support', description: 'High-back ergonomic office chair with adjustable height and lumbar support. Used for 1 year. Mesh back for breathability. Very comfortable for long hours.', price: 3800, category: 'Furniture', images: [PLACEHOLDER_IMG, PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[1]._id, title: 'Branded Formal Shirts (Pack of 5)', description: 'Pack of 5 formal shirts - Arrow and Van Heusen brands. Size: 40 (L). Colors: white, blue, grey, light pink, and checks. Worn 2-3 times each.', price: 1800, category: 'Clothing', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[1]._id, title: 'IKEA Kallax Shelf Unit - White', description: 'IKEA Kallax 4x4 shelf unit in white. Perfect for books, decor, or storage boxes. Dimensions: 147x147cm. All hardware included.', price: 5500, category: 'Furniture', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[1]._id, title: 'Nike Running Shoes - Size 9', description: 'Nike Air Zoom Pegasus 38 running shoes. Size 9 (UK). Used for 3 months. Still in great shape. Original box included.', price: 3200, category: 'Clothing', images: [PLACEHOLDER_IMG], status: 'approved' },
    // Seller 3 — Vehicles + Books + General
    { seller: sellers[2]._id, title: 'Honda Activa 6G - 2021 Model', description: '2021 Honda Activa 6G scooter. 12,000 km driven. Single owner. All documents clear. Recently serviced. New tyres. Color: Pearl Precious White.', price: 68000, category: 'Vehicles', images: [PLACEHOLDER_IMG, PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[2]._id, title: 'UPSC Civil Services Complete Book Set', description: 'Complete set of UPSC preparation books including NCERT (6-12), Laxmikanth Polity, Spectrum Modern History, GC Leong Geography, and 5 years PYQ papers.', price: 2800, category: 'Books', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[2]._id, title: 'Whirlpool 1.5 Ton 3 Star Split AC', description: 'Whirlpool 1.5 Ton 3 Star Inverter Split AC. 2 years old. Works perfectly. Comes with remote. Installation not included.', price: 18500, category: 'Electronics', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[2]._id, title: 'Yoga Mat + Resistance Bands Set', description: 'Premium 6mm thick yoga mat (non-slip) with set of 5 resistance bands. Used for 4 months. Perfect for home workouts. Includes carry bag.', price: 850, category: 'General', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[2]._id, title: 'Prestige Induction Cooktop', description: 'Prestige PIC 6.0 induction cooktop. 2000W. 8 preset cooking modes. Touch panel. 1.5 years old. Works perfectly.', price: 1600, category: 'General', images: [PLACEHOLDER_IMG], status: 'approved' },
    { seller: sellers[2]._id, title: 'MTB Cycle - Firefox Bikes 21 Speed', description: 'Firefox Bikes Typhoon 26T mountain bike. 21-speed Shimano gears. Dual disc brakes. Ridden for 8 months. Excellent condition. Helmet included.', price: 9500, category: 'Vehicles', images: [PLACEHOLDER_IMG, PLACEHOLDER_IMG], status: 'approved' },
  ]);

  console.log(`📦 Products created  →  ${products.length} products (all approved)`);

  // ════════════════════════════════════════════════
  // ORDERS
  // ════════════════════════════════════════════════
  const orderDefs = [
    // INITIATED (2)
    { buyer: buyers[0], product: products[0],  seller: sellers[0], status: 'initiated' },
    { buyer: buyers[1], product: products[4],  seller: sellers[1], status: 'initiated' },
    // PAYMENT_PENDING (2)
    { buyer: buyers[2], product: products[1],  seller: sellers[0], status: 'payment_pending', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(1) } },
    { buyer: buyers[3], product: products[9],  seller: sellers[2], status: 'payment_pending', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(2) } },
    // PAID (3)
    { buyer: buyers[4], product: products[2],  seller: sellers[0], status: 'paid', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(5) }, paidAt: daysAgo(4) },
    { buyer: buyers[5], product: products[5],  seller: sellers[1], status: 'paid', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(6) }, paidAt: daysAgo(5) },
    { buyer: buyers[6], product: products[11], seller: sellers[2], status: 'paid', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(7) }, paidAt: daysAgo(6) },
    // COMPLETED (3)
    { buyer: buyers[0], product: products[6],  seller: sellers[1], status: 'completed', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(12) }, paidAt: daysAgo(11), completedAt: daysAgo(9) },
    { buyer: buyers[1], product: products[10], seller: sellers[2], status: 'completed', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(15) }, paidAt: daysAgo(14), completedAt: daysAgo(12) },
    { buyer: buyers[2], product: products[3],  seller: sellers[0], status: 'completed', paymentProof: { transactionId: fakeTxnId(), screenshotB64: '', submittedAt: daysAgo(20) }, paidAt: daysAgo(19), completedAt: daysAgo(17) },
    // FAILED (2)
    { buyer: buyers[3], product: products[7],  seller: sellers[1], status: 'failed', paymentProof: { transactionId: 'FAKE123456', screenshotB64: '', submittedAt: daysAgo(8) }, sellerNote: 'Payment not received. Transaction ID is invalid.' },
    { buyer: buyers[4], product: products[12], seller: sellers[2], status: 'failed', paymentProof: { transactionId: 'INVALID999', screenshotB64: '', submittedAt: daysAgo(10) }, sellerNote: 'Amount mismatch. Please pay the correct amount.' },
    // CANCELLED (1)
    { buyer: buyers[5], product: products[13], seller: sellers[2], status: 'cancelled', cancelledAt: daysAgo(3) },
  ];

  const orders = await Order.insertMany(
    orderDefs.map((def) => ({
      buyer:        def.buyer._id,
      product:      def.product._id,
      seller:       def.seller._id,
      amount:       def.product.price,
      status:       def.status,
      paymentProof: def.paymentProof || {},
      sellerNote:   def.sellerNote   || '',
      paidAt:       def.paidAt       || null,
      completedAt:  def.completedAt  || null,
      cancelledAt:  def.cancelledAt  || null,
    }))
  );

  console.log(`🛒 Orders created  →  ${orders.length} orders`);

  // ── Payment records for PAID + COMPLETED orders ──
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'completed');

  const payments = await Payment.insertMany(
    paidOrders.map((order) => ({
      order:         order._id,
      buyer:         order.buyer,
      seller:        order.seller,
      product:       order.product,
      amount:        order.amount,
      transactionId: order.paymentProof?.transactionId || fakeTxnId(),
      screenshotB64: '',
      method:        'upi',
      status:        'paid',
      sellerNote:    'Payment verified and confirmed.',
      confirmedAt:   order.paidAt || new Date(),
    }))
  );

  console.log(`💳 Payments created  →  ${payments.length} payment records`);

  // ════════════════════════════════════════════════
  // CHAT MESSAGES
  // ════════════════════════════════════════════════
  const conversations = [
    {
      buyer: buyers[0], seller: sellers[0], product: products[0],
      messages: [
        { from: 'buyer',  text: 'Hi! Is the Samsung Galaxy S21 still available?' },
        { from: 'seller', text: 'Yes, it is available! Are you interested?' },
        { from: 'buyer',  text: 'Yes. What is the lowest price you can do?' },
        { from: 'seller', text: 'Best price is ₹27,000. It is in excellent condition.' },
        { from: 'buyer',  text: 'Can you do ₹25,000? I can pick up today.' },
        { from: 'seller', text: 'I can do ₹26,500. That is my final price.' },
        { from: 'buyer',  text: 'Okay deal! What is your UPI ID?' },
        { from: 'seller', text: 'My UPI ID is rahul.sharma@upi. Please send ₹26,500.' },
        { from: 'buyer',  text: 'Payment done! Transaction ID: T2024041512345' },
        { from: 'seller', text: 'Received! Thank you. Please come for pickup tomorrow.' },
      ],
    },
    {
      buyer: buyers[1], seller: sellers[1], product: products[4],
      messages: [
        { from: 'buyer',  text: 'Hello, is the wooden study table available?' },
        { from: 'seller', text: 'Yes! It is in good condition. Are you in Pune?' },
        { from: 'buyer',  text: 'Yes I am in Pune. Can I see more photos?' },
        { from: 'seller', text: 'Sure, I will send photos. The table is solid wood.' },
        { from: 'buyer',  text: 'Looks good! Is the price negotiable?' },
        { from: 'seller', text: 'I can do ₹4,200 for quick sale.' },
        { from: 'buyer',  text: 'Okay, I will place the order now.' },
        { from: 'seller', text: 'Great! Please complete the payment and I will confirm.' },
      ],
    },
    {
      buyer: buyers[2], seller: sellers[0], product: products[1],
      messages: [
        { from: 'buyer',  text: 'Are the Sony headphones still available?' },
        { from: 'seller', text: 'Yes! They are in excellent condition.' },
        { from: 'buyer',  text: 'Do they have any issues with noise cancellation?' },
        { from: 'seller', text: 'No issues at all. Works perfectly. I am selling because I got a new pair.' },
        { from: 'buyer',  text: 'What about the ear cushions? Are they worn out?' },
        { from: 'seller', text: 'Ear cushions are in great shape. No wear at all.' },
        { from: 'buyer',  text: 'Okay I will buy. Sending payment now.' },
      ],
    },
    {
      buyer: buyers[3], seller: sellers[2], product: products[9],
      messages: [
        { from: 'buyer',  text: 'Hi! Is the Honda Activa still available?' },
        { from: 'seller', text: 'Yes it is. 2021 model, single owner, 12k km.' },
        { from: 'buyer',  text: 'Any accidents or major repairs?' },
        { from: 'seller', text: 'No accidents. Only regular servicing done at Honda service center.' },
        { from: 'buyer',  text: 'Can I test ride before buying?' },
        { from: 'seller', text: 'Yes of course. Come to Bangalore Koramangala area.' },
        { from: 'buyer',  text: 'I will come this Saturday. What time works for you?' },
        { from: 'seller', text: 'Saturday 11am works. I will share my address.' },
        { from: 'buyer',  text: 'Perfect. See you then!' },
      ],
    },
    {
      buyer: buyers[4], seller: sellers[1], product: products[5],
      messages: [
        { from: 'buyer',  text: 'Is the ergonomic office chair available?' },
        { from: 'seller', text: 'Yes! It is very comfortable. Used for only 1 year.' },
        { from: 'buyer',  text: 'Does the height adjustment work properly?' },
        { from: 'seller', text: 'Yes, all adjustments work perfectly. No issues.' },
        { from: 'buyer',  text: 'Can you deliver to Andheri, Mumbai?' },
        { from: 'seller', text: 'I can arrange delivery for ₹300 extra.' },
        { from: 'buyer',  text: 'Okay that works. I will place the order.' },
        { from: 'seller', text: 'Great! Once payment is confirmed I will arrange delivery.' },
        { from: 'buyer',  text: 'Payment sent. Please check.' },
        { from: 'seller', text: 'Received! Will deliver within 2 days.' },
      ],
    },
  ];

  let totalMessages = 0;
  const allMessages = [];

  for (const conv of conversations) {
    let baseTime = daysAgo(20);
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      const isBuyer = msg.from === 'buyer';
      baseTime = new Date(baseTime.getTime() + (5 + Math.random() * 30) * 60000);

      allMessages.push({
        sender:    isBuyer ? conv.buyer._id  : conv.seller._id,
        receiver:  isBuyer ? conv.seller._id : conv.buyer._id,
        text:      msg.text,
        product:   i === 0 ? conv.product._id : null,
        isRead:    i < conv.messages.length - 2,
        deleted:   false,
        createdAt: baseTime,
        updatedAt: baseTime,
      });
      totalMessages++;
    }
  }

  await Message.insertMany(allMessages);
  console.log(`💬 Chats created  →  5 conversations, ${totalMessages} messages`);

  // ════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(55));
  console.log('  ✅  SEED COMPLETE — DATABASE POPULATED');
  console.log('═'.repeat(55));
  console.log(`  Users    : 1 admin + 3 sellers + 7 buyers = 11`);
  console.log(`  Products : ${products.length} (all approved)`);
  console.log(`  Orders   : ${orders.length} (various statuses)`);
  console.log(`  Payments : ${payments.length} records`);
  console.log(`  Messages : ${totalMessages} across 5 conversations`);
  console.log('═'.repeat(55));
  console.log('\n  LOGIN CREDENTIALS:');
  console.log('  Admin  : admin@test.com   / Admin@123');
  console.log('  Seller : seller1@test.com / Seller@123');
  console.log('  Buyer  : buyer1@test.com  / Buyer@123');
  console.log('═'.repeat(55) + '\n');

  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
