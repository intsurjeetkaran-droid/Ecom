/**
 * Login Screen  –  Module 1: Authentication
 * -------------------------------------------------
 * Styled with inline styles.
 * Theme: Deep Teal primary, Amber accent.
 * -------------------------------------------------
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { colors } from '../../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const { isDark } = useTheme();

  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!email.trim())              e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim())           e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await loginApi({ email: email.trim().toLowerCase(), password });
      await login(data.user, data.token);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Theme toggle top-right */}
          <View style={styles.themeToggle}>
            <ThemeToggle />
          </View>

          {/* Logo / Title */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>🛍️</Text>
            </View>
            <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
              Chat Marketplace
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={[
            styles.formCard,
            {
              backgroundColor: isDark ? colors.cardDark : colors.cardLight,
              borderColor: isDark ? colors.borderDark : colors.borderLight,
            }
          ]}>
            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              editable={!loading}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
              secureTextEntry
              error={errors.password}
              editable={!loading}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
              />
            </View>
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={[styles.registerText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Don't have an account?{' '}
              <Text style={[styles.registerTextBold, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                Register
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  themeToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 1,
    borderWidth: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: '600',
  },
});
