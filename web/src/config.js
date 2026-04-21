// Use environment variables if available, otherwise fallback to production URLs
export const API_URL    = import.meta.env.VITE_API_URL || 'https://ecom-fh0m.onrender.com/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://ecom-fh0m.onrender.com';
