/**
 * EmptyState Component
 * -------------------------------------------------
 * Consistent empty state for all list screens.
 * Shows an emoji, title, subtitle, and optional action button.
 * -------------------------------------------------
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';
import Button from './Button';

export default function EmptyState({
  emoji = '📭',
  title = 'Nothing here yet',
  subtitle = '',
  actionLabel = '',
  onAction = null,
}) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.textDark }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 24,
    width: '100%',
  },
});
