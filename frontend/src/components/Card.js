/**
 * Card Component
 * -------------------------------------------------
 * Reusable card with light/dark surface, border,
 * and subtle shadow. Used across all list items.
 * -------------------------------------------------
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function Card({ children, style }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardDark : colors.cardLight,
          borderColor: isDark ? colors.borderDark : colors.borderLight,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
});
