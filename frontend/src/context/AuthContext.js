/**
 * Auth Context  –  Module 1: Authentication
 * -------------------------------------------------
 * Provides global auth state across the app.
 *
 * State:
 *   user    → logged-in user object (or null)
 *   token   → JWT string (or null)
 *   loading → true while restoring session from storage
 *
 * Methods:
 *   login(user, token)  → persist session
 *   logout()            → call API + clear session
 * -------------------------------------------------
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true until session is restored

  // ── Restore session on app launch ──
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser  = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('[AuthContext] Session restored from storage');
        } else {
          console.log('[AuthContext] No stored session found');
        }
      } catch (err) {
        console.error('[AuthContext] Failed to restore session:', err.message);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login: persist token + user to storage ──
  const login = async (userData, tokenData) => {
    try {
      setUser(userData);
      setToken(tokenData);
      await AsyncStorage.setItem('token', tokenData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log(`[AuthContext] User logged in → id: ${userData.id}, role: ${userData.role}`);
    } catch (err) {
      console.error('[AuthContext] Failed to persist session:', err.message);
    }
  };

  // ── Logout: notify server + clear local storage ──
  const logout = async () => {
    try {
      await logoutApi(); // inform server (server logs the event)
    } catch (err) {
      // Non-critical — proceed with local cleanup even if API call fails
      console.warn('[AuthContext] Logout API call failed (proceeding anyway):', err.message);
    }

    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('[AuthContext] User logged out — session cleared');
    } catch (err) {
      console.error('[AuthContext] Failed to clear session:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context consumption
export const useAuth = () => useContext(AuthContext);
