/**
 * ThemeToggle Component
 * -------------------------------------------------
 * A pressable icon button that switches light/dark mode.
 * Drop it anywhere — header, profile screen, etc.
 * -------------------------------------------------
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function ThemeToggle({ style }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight },
        style
      ]}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
