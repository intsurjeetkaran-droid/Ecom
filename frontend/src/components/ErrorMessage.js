/**
 * ErrorMessage Component
 * -------------------------------------------------
 * Inline error display with optional retry button.
 * Used when API calls fail.
 * -------------------------------------------------
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry = null,
}) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: isDark ? colors.textOnDark : colors.textDark }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  icon: {
    fontSize: 28,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary600,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
