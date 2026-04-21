/**
 * Become Seller Screen  –  Module 2: User Management
 * Styled with inline styles.
 */

import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { becomeSeller } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors } from '../../styles/theme';

const PERKS = [
  { icon: '📦', text: 'List unlimited products' },
  { icon: '💬', text: 'Chat directly with buyers' },
  { icon: '📋', text: 'Manage and track your orders' },
  { icon: '📈', text: 'Grow your sales on the platform' },
];

export default function BecomeSellerScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const { login, user, token } = useAuth();
  const { isDark } = useTheme();

  const handleUpgrade = () => {
    Alert.alert(
      'Become a Seller',
      'Your role will be upgraded to Seller. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setLoading(true);
            try {
              const { data } = await becomeSeller();
              await login({ ...user, role: data.user.role }, token);
              Alert.alert('🎉 Welcome, Seller!', data.message);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to upgrade');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.headerContainer}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.accent900 : colors.accent100 }]}>
            <Text style={styles.iconText}>🛍️</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
            Become a Seller
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            Start listing products and reach buyers on the marketplace.
            All products are reviewed by admin before going live.
          </Text>
        </View>

        {/* Perks */}
        <View style={[
          styles.perksContainer,
          {
            backgroundColor: isDark ? colors.cardDark : colors.cardLight,
            borderColor: isDark ? colors.borderDark : colors.borderLight,
          }
        ]}>
          {PERKS.map((perk, i) => (
            <View
              key={i}
              style={[
                styles.perkRow,
                i < PERKS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? colors.borderDark : colors.borderLight,
                }
              ]}
            >
              <Text style={styles.perkIcon}>{perk.icon}</Text>
              <Text style={[styles.perkText, { color: isDark ? colors.textOnDark : colors.textDark }]}>
                {perk.text}
              </Text>
            </View>
          ))}
        </View>

        <Button title="Upgrade to Seller" onPress={handleUpgrade} loading={loading} variant="accent" />

        <TouchableOpacity
          style={styles.laterButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.laterText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            Maybe later
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  perksContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  perkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  perkText: {
    fontSize: 14,
    flex: 1,
  },
  laterButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  laterText: {
    fontSize: 14,
  },
});
