/**
 * Input Component
 * -------------------------------------------------
 * Reusable text input with label, error state,
 * and full light/dark theme support.
 * -------------------------------------------------
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function Input({
  label,
  error,
  style,
  containerStyle,
  ...props
}) {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? colors.cardDark : colors.cardLight,
            borderColor: error ? colors.danger500 : (isDark ? colors.borderDark : colors.borderLight),
            color: isDark ? colors.textOnDark : colors.slate800,
          },
          style
        ]}
        placeholderTextColor={colors.mutedLight}
        {...props}
      />
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: colors.danger500,
    fontSize: 12,
    marginTop: 4,
  },
});
