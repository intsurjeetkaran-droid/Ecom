/**
 * Seller Payment Setup Screen  –  Module 6: Payment
 * -------------------------------------------------
 * Seller enters their UPI ID, bank details, and
 * optionally uploads a QR code image.
 * Buyers will see these details when placing an order.
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { getProfile } from '../../api/userApi';
import { updatePaymentDetails } from '../../api/paymentApi';
import { pickImage } from '../../utils/imageUtils';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

export default function SellerPaymentSetupScreen({ navigation }) {
  const [upiId,      setUpiId]      = useState('');
  const [bankName,   setBankName]   = useState('');
  const [accountNo,  setAccountNo]  = useState('');
  const [ifscCode,   setIfscCode]   = useState('');
  const [qrImageB64, setQrImageB64] = useState('');  // base64 data URI (new or existing)
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const { isDark } = useTheme();

  // ── Load existing payment details ──
  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        const pd = data.paymentDetails || {};
        setUpiId(pd.upiId      || '');
        setBankName(pd.bankName   || '');
        setAccountNo(pd.accountNo  || '');
        setIfscCode(pd.ifscCode   || '');
        setQrImageB64(pd.qrImageB64 || ''); // already a base64 data URI
      })
      .catch(() => Alert.alert('Error', 'Could not load payment details'))
      .finally(() => setLoading(false));
  }, []);

  // ── Pick QR image ──
  const handlePickQr = async () => {
    const dataUri = await pickImage({ quality: 0.9 });
    if (dataUri) setQrImageB64(dataUri);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!upiId.trim() && !bankName.trim() && !accountNo.trim()) {
      Alert.alert('Required', 'Please enter at least a UPI ID or bank account details');
      return;
    }
    setSaving(true);
    try {
      await updatePaymentDetails({
        upiId:      upiId.trim(),
        bankName:   bankName.trim(),
        accountNo:  accountNo.trim(),
        ifscCode:   ifscCode.trim(),
        qrImageB64: qrImageB64 || undefined, // only send if set
      });
      Alert.alert('Saved ✅', 'Payment details updated. Buyers can now see where to pay.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save payment details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
            Payment Setup
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            Add your UPI ID or bank details so buyers know where to send payment.
          </Text>

          {/* ── UPI Section ── */}
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
              📱 UPI Details
            </Text>
            <Input
              label="UPI ID"
              placeholder="yourname@upi"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!saving}
            />

            {/* QR Code upload */}
            <Text style={[styles.qrLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              QR Code (optional)
            </Text>
            <TouchableOpacity
              style={[
                styles.qrUploadContainer,
                { borderColor: isDark ? colors.borderDark : colors.borderLight }
              ]}
              onPress={handlePickQr}
              disabled={saving}
            >
              {qrImageB64 ? (
                <View style={styles.qrImageContainer}>
                  {/* base64 data URI renders directly */}
                  <Image source={{ uri: qrImageB64 }} style={styles.qrImage} resizeMode="contain" />
                  <Text style={[styles.qrReplaceText, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                    Tap to replace
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.qrPlaceholderIcon}>📷</Text>
                  <Text style={[styles.qrPlaceholderText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    Upload your UPI QR code
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Card>

          {/* ── Bank Section ── */}
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
              🏦 Bank Transfer Details
            </Text>
            <Input label="Bank Name"   placeholder="e.g. State Bank of India" value={bankName}  onChangeText={setBankName}  editable={!saving} />
            <Input label="Account No." placeholder="Account number"            value={accountNo} onChangeText={setAccountNo} editable={!saving} keyboardType="numeric" />
            <Input label="IFSC Code"   placeholder="e.g. SBIN0001234"          value={ifscCode}  onChangeText={setIfscCode}  editable={!saving} autoCapitalize="characters" />
          </Card>

          {/* Info notice */}
          <View style={[
            styles.infoNotice,
            {
              backgroundColor: isDark ? 'rgba(15, 118, 110, 0.3)' : colors.primary50,
              borderColor: isDark ? colors.primary800 : colors.primary200,
            }
          ]}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={[styles.infoText, { color: isDark ? colors.primary200 : colors.primary700 }]}>
              These details are shown to buyers when they place an order. Keep them accurate to receive payments correctly.
            </Text>
          </View>

          <Button title="Save Payment Details" onPress={handleSave} loading={saving} />
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  qrUploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  qrImageContainer: {
    alignItems: 'center',
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  qrReplaceText: {
    fontSize: 11,
  },
  qrPlaceholderIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  qrPlaceholderText: {
    fontSize: 14,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});
