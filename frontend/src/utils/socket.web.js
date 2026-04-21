/**
 * Socket.IO for Web platform
 * -------------------------------------------------
 * Expo Metro resolves this file instead of socket.js on web.
 *
 * Uses LAZY initialization — the socket is created only when
 * first accessed at runtime, NOT at import/bundle time.
 * This prevents Metro from hanging during the web build.
 *
 * Uses polling-only transport to avoid WebSocket upgrade
 * issues in the browser environment.
 * -------------------------------------------------
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let _socket = null;

function getSocket() {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      autoConnect:          true,
      reconnection:         true,
      reconnectionDelay:    1000,
      reconnectionAttempts: 10,
      // Polling only on web — avoids WebSocket upgrade failures in browser
      transports: ['polling'],
    });

    _socket.on('connect', () => {
      console.log('[Socket] ✅ Connected →', _socket.id);
    });

    _socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected →', reason);
    });

    _socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error →', err.message);
    });
  }
  return _socket;
}

// Proxy object — all calls are forwarded to the lazily-created socket instance
const socketProxy = {
  emit:       (...args) => getSocket().emit(...args),
  on:         (...args) => getSocket().on(...args),
  off:        (...args) => getSocket().off(...args),
  connect:    (...args) => getSocket().connect(...args),
  disconnect: (...args) => getSocket().disconnect(...args),
  get id()        { return getSocket().id; },
  get connected() { return getSocket().connected; },
};

export default socketProxy;
