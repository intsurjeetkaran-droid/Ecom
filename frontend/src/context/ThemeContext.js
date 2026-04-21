/**
 * Theme Context
 * -------------------------------------------------
 * Manages light / dark mode across the entire app.
 * - Persists preference to AsyncStorage
 * - Defaults to the device's system color scheme
 * - Exposes `isDark`, `toggleTheme`, `theme` string
 * -------------------------------------------------
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceScheme = useColorScheme(); // 'light' | 'dark' | null
  const [theme, setTheme] = useState(deviceScheme || 'light');

  // ── Restore saved preference on mount ──
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) {
          setTheme(saved);
        } else {
          setTheme(deviceScheme || 'light');
        }
      } catch (err) {
        console.error('[Theme] Failed to load theme:', err.message);
      }
    };
    loadTheme();
  }, []);

  // ── Toggle between light and dark ──
  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch (err) {
      console.error('[Theme] Failed to save theme:', err.message);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
