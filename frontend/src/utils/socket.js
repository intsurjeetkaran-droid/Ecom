/**
 * Socket.IO Singleton  –  Native (iOS / Android)
 * -------------------------------------------------
 * Single shared instance — prevents duplicate connections.
 * URL from src/config.js  ← change IP there
 *
 * On web, Metro resolves socket.web.js instead of this file.
 * -------------------------------------------------
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const socket = io(SOCKET_URL, {
  autoConnect:          true,
  reconnection:         true,
  reconnectionDelay:    1000,
  reconnectionAttempts: 10,
  // Start with polling then upgrade to WebSocket on native
  transports: ['polling', 'websocket'],
});

socket.on('connect', () => {
  console.log('[Socket] ✅ Connected →', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected →', reason);
});

socket.on('connect_error', (err) => {
  console.warn('[Socket] Connection error →', err.message);
});

export default socket;
