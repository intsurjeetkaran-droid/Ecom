/**
 * App Root  –  Chat Marketplace
 * -------------------------------------------------
 * Entry point for Expo.
 * Providers (outermost → innermost):
 *   SafeAreaProvider → required for SafeAreaView in screens
 *   ThemeProvider    → light/dark mode
 *   AuthProvider     → JWT session
 *   StatusBar        → status bar style
 *   AppNavigator     → role-based routing
 * -------------------------------------------------
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider }  from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator      from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
