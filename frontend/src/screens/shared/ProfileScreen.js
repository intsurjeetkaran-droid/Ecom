/**
 * Profile Screen  –  Module 2: User Management
 * Styled with inline styles.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  ScrollView, RefreshControl, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { colors, getRoleStyles } from '../../styles/theme';

export default function ProfileScreen({ navigation }) {
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();
  const { isDark } = useTheme();

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchProfile(); }, []));

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  const roleStyles = getRoleStyles(profile?.role, isDark);

  return (
    <Screen safe={false}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} />}
      >
        {/* ── Header banner ── */}
        <View style={[styles.header, { backgroundColor: isDark ? colors.primary800 : colors.primary600 }]}>
          <View style={styles.themeToggleContainer}>
            <ThemeToggle />
          </View>

          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nameText}>{profile?.name}</Text>
          <Text style={styles.emailText}>{profile?.email}</Text>

          {/* Role badge */}
          <View style={[styles.roleBadge, { backgroundColor: roleStyles.bg }]}>
            <Text style={[styles.roleText, { color: roleStyles.text }]}>
              {profile?.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── Info card ── */}
          <Card>
            <InfoRow label="Full Name" value={profile?.name} isDark={isDark} />
            <InfoRow label="Email"     value={profile?.email} isDark={isDark} />
            <InfoRow label="Role"      value={profile?.role} isDark={isDark} />
            <InfoRow label="Joined"    value={new Date(profile?.createdAt).toDateString()} isDark={isDark} last />
          </Card>

          {/* ── Actions ── */}
          <View style={styles.actionsContainer}>
            <Button
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile', { profile })}
              variant="outline"
            />

            {/* Payment setup — sellers only */}
            {profile?.role === 'seller' && (
              <Button
                title="💳  Payment Setup"
                onPress={() => navigation.navigate('PaymentSetup')}
                variant="outline"
              />
            )}

            {/* Payment history — buyer and seller */}
            {(profile?.role === 'buyer' || profile?.role === 'seller') && (
              <Button
                title="📄  Payment History"
                onPress={() => navigation.navigate('PaymentHistory')}
                variant="outline"
              />
            )}

            {profile?.role === 'buyer' && (
              <Button
                title="🛍️  Become a Seller"
                onPress={() => navigation.navigate('BecomeSeller')}
                variant="accent"
              />
            )}

            <Button
              title="Logout"
              onPress={handleLogout}
              variant="danger"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value, last = false, isDark }) {
  return (
    <View style={[
      styles.infoRow,
      !last && { 
        borderBottomWidth: 1, 
        borderBottomColor: isDark ? colors.borderDark : colors.borderLight 
      }
    ]}>
      <Text style={[styles.infoLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  emailText: {
    color: colors.primary200,
    fontSize: 14,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
