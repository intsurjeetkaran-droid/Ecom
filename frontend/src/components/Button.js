/**
 * Button Component
 * -------------------------------------------------
 * Reusable button with variants:
 *   primary  → Teal (default)
 *   accent   → Amber/Gold
 *   danger   → Rose
 *   outline  → Bordered, transparent bg
 *   ghost    → No border, no bg
 *
 * Supports loading spinner and disabled state.
 * -------------------------------------------------
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}) {
  const { isDark } = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (isDisabled) baseStyle.push(styles.disabled);

    switch (variant) {
      case 'accent':
        baseStyle.push({ backgroundColor: colors.accent500 });
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: colors.danger500 });
        break;
      case 'success':
        baseStyle.push({ backgroundColor: colors.success500 });
        break;
      case 'outline':
        baseStyle.push(styles.outline, { borderColor: colors.primary600 });
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      default: // primary
        baseStyle.push({ backgroundColor: colors.primary600 });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    switch (variant) {
      case 'outline':
      case 'ghost':
        baseStyle.push({ color: isDark ? colors.primary400 : colors.primary600 });
        break;
      default:
        baseStyle.push({ color: colors.white });
    }

    return baseStyle;
  };

  const getSpinnerColor = () => {
    return (variant === 'outline' || variant === 'ghost') ? colors.primary600 : colors.white;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[...getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});
