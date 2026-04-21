/**
 * Auth API  –  Module 1: Authentication
 * -------------------------------------------------
 * Wraps all auth-related HTTP calls.
 *
 * register(data)  → POST /api/auth/register
 * login(data)     → POST /api/auth/login
 * logout()        → POST /api/auth/logout  (token auto-attached by axios interceptor)
 * -------------------------------------------------
 */

import api from './axios';

// Register a new user — returns { token, user }
export const register = (data) => api.post('/auth/register', data);

// Login with email + password — returns { token, user }
export const login = (data) => api.post('/auth/login', data);

// Logout — server logs the event; client must clear token
export const logout = () => api.post('/auth/logout');
