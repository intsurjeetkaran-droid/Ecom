/**
 * Axios Instance
 * -------------------------------------------------
 * - Base URL from src/config.js  ← change IP there
 * - Attaches JWT token to every request
 * - Handles 401 → auto logout
 * - Maps HTTP errors to friendly messages
 * -------------------------------------------------
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ── Request Interceptor ───────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.friendlyMessage = 'No internet connection. Please check your network and try again.';
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      error.friendlyMessage = 'Your session has expired. Please log in again.';
    } else if (status === 403) {
      error.friendlyMessage = error.response.data?.message || 'Access denied.';
    } else if (status === 404) {
      error.friendlyMessage = error.response.data?.message || 'Resource not found.';
    } else if (status === 429) {
      error.friendlyMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (status >= 500) {
      error.friendlyMessage = 'Something went wrong on our end. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default api;
