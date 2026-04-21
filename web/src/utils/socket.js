import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const socket = io(SOCKET_URL, {
  autoConnect:          true,
  reconnection:         true,
  reconnectionDelay:    1000,
  reconnectionAttempts: 10,
  transports:           ['polling', 'websocket'],
});

socket.on('connect',       ()    => console.log('[Socket] Connected →', socket.id));
socket.on('disconnect',    (r)   => console.log('[Socket] Disconnected →', r));
socket.on('connect_error', (err) => console.warn('[Socket] Error →', err.message));

export default socket;
