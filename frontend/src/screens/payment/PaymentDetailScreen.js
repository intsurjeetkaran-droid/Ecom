/**
 * Payment Detail Screen  –  Module 6: Payment
 * Shows full details of a single payment record.
 * Styled with inline styles.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image,
  ActivityIndicator, Alert, TouchableOpacity, StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getPaymentByOrder } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

export default function PaymentDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { isDark } = useTheme();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentByOrder(orderId)
      .then(({ data }) => setPayment(data))
      .catch(() => {
        Alert.alert('Error', 'Could not load payment record');
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  if (!payment) return null;

  return (
    <Screen>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={[styles.amount, { color: isDark ? colors.success400 : colors.success600 }]}>
            ₹{payment.amount}
          </Text>
          <Text style={[styles.statusLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            Payment Confirmed
          </Text>
          {payment.confirmedAt && (
            <Text style={[styles.confirmedAt, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              {new Date(payment.confirmedAt).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Product */}
        <Card>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>PRODUCT</Text>
          <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
            {payment.product?.title}
          </Text>
          <Text style={[styles.productPrice, { color: isDark ? colors.primary400 : colors.primary600 }]}>
            ₹{payment.product?.price}
          </Text>
        </Card>

        {/* Transaction details */}
        <Card>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>TRANSACTION</Text>
          <InfoRow label="Payment ID"  value={`#${payment._id.slice(-8).toUpperCase()}`} isDark={isDark} />
          <InfoRow label="Buyer"       value={payment.buyer?.name} isDark={isDark} />
          <InfoRow label="Seller"      value={payment.seller?.name} isDark={isDark} />
          <InfoRow label="Method"      value={payment.method?.toUpperCase().replace('_', ' ')} isDark={isDark} />
          {payment.transactionId ? (
            <TouchableOpacity onPress={() => { Clipboard.setStringAsync(payment.transactionId); Alert.alert('Copied!', 'Transaction ID copied'); }}>
              <InfoRow label="Transaction ID" value={payment.transactionId} copyable isDark={isDark} />
            </TouchableOpacity>
          ) : null}
          {payment.sellerNote ? (
            <InfoRow label="Seller Note" value={payment.sellerNote} isDark={isDark} last />
          ) : null}
        </Card>

        {/* Screenshot */}
        {payment.screenshotB64 ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>PAYMENT SCREENSHOT</Text>
            <Image source={{ uri: payment.screenshotB64 }} style={styles.screenshot} resizeMode="contain" />
          </Card>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value, copyable = false, last = false, isDark }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
      <Text style={[styles.infoLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={[styles.infoValue, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{value}</Text>
        {copyable && <Text style={[styles.copyIcon, { color: isDark ? colors.primary400 : colors.primary600 }]}>📋</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statusBanner: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  statusIcon: { fontSize: 36, marginBottom: 8 },
  amount: { fontSize: 24, fontWeight: 'bold' },
  statusLabel: { fontSize: 14, marginTop: 4 },
  confirmedAt: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '500', letterSpacing: 1, marginBottom: 8 },
  productTitle: { fontWeight: '600' },
  productPrice: { fontWeight: 'bold', marginTop: 4 },
  screenshot: { width: '100%', height: 224, borderRadius: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { fontSize: 14 },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  copyIcon: { fontSize: 11, marginLeft: 4 },
  bottomSpacer: { height: 32 },
});
