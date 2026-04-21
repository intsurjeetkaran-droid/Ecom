/**
 * Screen Wrapper Component
 * -------------------------------------------------
 * Base container for every screen.
 * Applies the correct background color for light/dark
 * and handles safe area insets.
 * -------------------------------------------------
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function Screen({ children, style, safe = true }) {
  const { isDark } = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: isDark ? colors.bgDark : colors.bgLight },
    style
  ];

  if (safe) {
    return (
      <SafeAreaView style={containerStyle}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
