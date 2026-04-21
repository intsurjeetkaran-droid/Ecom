/**
 * Database Configuration
 * -------------------------------------------------
 * Connects to MongoDB Atlas using MONGO_URI from .env
 * - Uses Google DNS to fix SRV resolution issues
 * - Retries up to 5 times with 5s delay
 * - Server stays alive during retries
 * -------------------------------------------------
 */

const mongoose = require('mongoose');
const dns      = require('dns');

// Force Google DNS — fixes Atlas SRV (_mongodb._tcp) resolution on some networks
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MAX_RETRIES  = 5;
const RETRY_DELAY  = 5000; // 5 seconds

const connectDB = async (attempt = 1) => {
  try {
    console.log(`[DB] Connecting to MongoDB Atlas... (attempt ${attempt}/${MAX_RETRIES})`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 15s to find a server
      socketTimeoutMS:          45000,
      family: 4,                       // force IPv4
    });

    console.log(`[DB] ✅ MongoDB Atlas connected → ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] ❌ Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

    if (attempt < MAX_RETRIES) {
      console.log(`[DB] Retrying in ${RETRY_DELAY / 1000}s...`);
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY);
    } else {
      console.error('[DB] All connection attempts exhausted.');
      console.error('[DB] Check: 1) Atlas IP whitelist  2) Network  3) MONGO_URI in .env');
      // Do NOT exit — server stays up so you can debug via /health endpoint
    }
  }
};

module.exports = connectDB;
