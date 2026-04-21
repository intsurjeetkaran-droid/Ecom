/**
 * Register Screen  –  Module 1: Authentication
 * Styled with inline styles.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { register as registerApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { colors } from '../../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const { isDark } = useTheme();

  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!name.trim())                     e.name     = 'Name is required';
    if (!email.trim())                    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                        e.password = 'Password is required';
    else if (password.length < 6)         e.password = 'Minimum 6 characters';
    if (password !== confirm)             e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await registerApi({ name: name.trim(), email: email.trim().toLowerCase(), password });
      await login(data.user, data.token);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    onChangeText: (t) => { setErrors((e) => ({ ...e, [key]: '' })); },
  });

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
          <View style={styles.themeToggle}>
            <ThemeToggle />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Join as a buyer — upgrade to seller anytime
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
              label="Full name"
              placeholder="John Doe"
              value={name}
              onChangeText={(t) => { setName(t); field('name').onChangeText(t); }}
              autoCapitalize="words"
              error={errors.name}
              editable={!loading}
            />
            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); field('email').onChangeText(t); }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              editable={!loading}
            />
            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={(t) => { setPassword(t); field('password').onChangeText(t); }}
              secureTextEntry
              error={errors.password}
              editable={!loading}
            />
            <Input
              label="Confirm password"
              placeholder="Repeat password"
              value={confirm}
              onChangeText={(t) => { setConfirm(t); field('confirm').onChangeText(t); }}
              secureTextEntry
              error={errors.confirm}
              editable={!loading}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                variant="accent"
              />
            </View>
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.loginText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Already have an account?{' '}
              <Text style={[styles.loginTextBold, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                Sign In
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
    backgroundColor: colors.accent500,
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
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: '600',
  },
});
