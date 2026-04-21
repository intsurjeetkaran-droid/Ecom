/**
 * App Configuration
 * -------------------------------------------------
 * ⚠️  IMPORTANT: Update SERVER_IP when you change networks.
 *
 * How to find your IP:
 *   Windows : ipconfig  → look for "IPv4 Address"
 *   Mac/Linux: ifconfig → look for "inet"
 *
 * Examples:
 *   Local WiFi  : '192.168.1.33'
 *   Android Emu : '10.0.2.2'
 *   iOS Sim     : 'localhost'
 * -------------------------------------------------
 */

export const SERVER_IP   = '192.168.1.98';
export const SERVER_PORT = '5000';

export const API_URL    = `http://${SERVER_IP}:${SERVER_PORT}/api`;
export const SOCKET_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
