/**
 * Edit Profile Screen  –  Module 2: User Management
 * Styled with inline styles.
 */

import React, { useState } from 'react';
import {
  View, Text, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

export default function EditProfileScreen({ route, navigation }) {
  const { profile } = route.params;
  const [name,    setName]    = useState(profile?.name   || '');
  const [avatar,  setAvatar]  = useState(profile?.avatar || '');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const { login, user, token } = useAuth();

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const { data } = await updateProfile({ name: name.trim(), avatar: avatar.trim() });
      await login({ ...user, name: data.name, avatar: data.avatar }, token);
      Alert.alert('Success', 'Profile updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
            Edit Profile
          </Text>

          <Card>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              autoCapitalize="words"
              error={error}
              editable={!loading}
            />
            <Input
              label="Avatar URL (optional)"
              placeholder="https://..."
              value={avatar}
              onChangeText={setAvatar}
              autoCapitalize="none"
              keyboardType="url"
              editable={!loading}
            />

            {/* Read-only fields */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                Email
              </Text>
              <View style={[styles.readOnlyField, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
                <Text style={[styles.readOnlyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  {profile?.email}
                </Text>
              </View>
            </View>
            <View style={styles.fieldContainerLast}>
              <Text style={[styles.fieldLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                Role
              </Text>
              <View style={[styles.readOnlyField, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
                <Text style={[styles.readOnlyText, { color: isDark ? colors.mutedDark : colors.mutedLight, textTransform: 'capitalize' }]}>
                  {profile?.role}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button title="Save Changes" onPress={handleSave} loading={loading} />
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldContainerLast: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  readOnlyField: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});
