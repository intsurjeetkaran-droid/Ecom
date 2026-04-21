/**
 * Payment Details Screen  –  Module 6: Payment
 * -------------------------------------------------
 * Shown to the buyer after placing an order.
 * Displays the seller's UPI ID, QR code, and bank details
 * so the buyer knows where to send payment.
 *
 * After paying externally (UPI app), buyer goes back
 * to OrderDetail to submit proof.
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image,
  ActivityIndicator, Alert, TouchableOpacity, StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getSellerPaymentDetails } from '../../api/paymentApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../styles/theme';

export default function PaymentDetailsScreen({ route, navigation }) {
  const { sellerId, sellerName, orderId, amount } = route.params;
  const { isDark } = useTheme();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerPaymentDetails(sellerId)
      .then(({ data }) => setDetails(data.paymentDetails))
      .catch(() => Alert.alert('Error', 'Could not load payment details'))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const hasUpi  = details?.upiId;
  const hasBank = details?.bankName || details?.accountNo;
  const hasQr   = details?.qrImageB64;

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  if (!details || (!hasUpi && !hasBank)) {
    return (
      <Screen style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
          Seller hasn't set up payment details yet
        </Text>
        <Text style={[styles.errorSubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          Please contact the seller via chat to arrange payment.
        </Text>
        <View style={styles.errorButton}>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Amount banner */}
        <View style={[styles.amountBanner, { backgroundColor: isDark ? colors.primary800 : colors.primary600 }]}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{amount}</Text>
          <Text style={styles.amountTo}>to {sellerName}</Text>
        </View>

        {/* Steps */}
        <View style={[
          styles.stepsContainer,
          {
            backgroundColor: isDark ? 'rgba(120, 53, 15, 0.3)' : colors.accent50,
            borderColor: isDark ? colors.accent800 : colors.accent200,
          }
        ]}>
          <Text style={styles.stepsIcon}>📋</Text>
          <View style={styles.stepsContent}>
            <Text style={[styles.stepsTitle, { color: isDark ? colors.accent300 : colors.accent700 }]}>
              How to pay
            </Text>
            <Text style={[styles.stepsText, { color: isDark ? colors.accent400 : colors.accent600 }]}>
              1. Copy UPI ID or scan QR code{'\n'}
              2. Pay ₹{amount} using any UPI app{'\n'}
              3. Come back and submit your transaction ID
            </Text>
          </View>
        </View>

        {/* ── UPI Details ── */}
        {hasUpi && (
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              UPI PAYMENT
            </Text>

            <View style={[styles.upiContainer, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
              <View>
                <Text style={[styles.upiLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  UPI ID
                </Text>
                <Text style={[styles.upiValue, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
                  {details.upiId}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(details.upiId, 'UPI ID')}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>

            {/* QR Code — base64 data URI renders directly */}
            {hasQr && (
              <View style={styles.qrContainer}>
                <Text style={[styles.qrLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  Scan QR Code
                </Text>
                <Image
                  source={{ uri: details.qrImageB64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </Card>
        )}

        {/* ── Bank Details ── */}
        {hasBank && (
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              BANK TRANSFER
            </Text>

            {details.bankName && (
              <DetailRow label="Bank Name" value={details.bankName} isDark={isDark} />
            )}
            {details.accountNo && (
              <DetailRow
                label="Account No."
                value={details.accountNo}
                onCopy={() => copyToClipboard(details.accountNo, 'Account number')}
                isDark={isDark}
              />
            )}
            {details.ifscCode && (
              <DetailRow
                label="IFSC Code"
                value={details.ifscCode}
                onCopy={() => copyToClipboard(details.ifscCode, 'IFSC code')}
                isDark={isDark}
                last
              />
            )}
          </Card>
        )}

        {/* CTA */}
        <View style={styles.buttonContainer}>
          <Button
            title="I've Paid — Submit Proof"
            onPress={() => navigation.navigate('OrderDetail', { orderId })}
          />
        </View>
        <Button
          title="Back to Order"
          onPress={() => navigation.goBack()}
          variant="outline"
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value, onCopy, last = false, isDark }) {
  return (
    <View style={[
      styles.detailRow,
      !last && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }
    ]}>
      <View>
        <Text style={[styles.detailLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
          {value}
        </Text>
      </View>
      {onCopy && (
        <TouchableOpacity
          style={[styles.detailCopyButton, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}
          onPress={onCopy}
        >
          <Text style={[styles.detailCopyText, { color: isDark ? colors.primary400 : colors.primary600 }]}>
            Copy
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButton: {
    marginTop: 24,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  amountBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    color: colors.primary200,
    fontSize: 14,
    marginBottom: 4,
  },
  amountValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
  amountTo: {
    color: colors.primary200,
    fontSize: 14,
    marginTop: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  stepsIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  stepsContent: {
    flex: 1,
  },
  stepsTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  stepsText: {
    fontSize: 11,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  upiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  upiLabel: {
    fontSize: 11,
  },
  upiValue: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 2,
  },
  copyButton: {
    backgroundColor: colors.primary600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  qrLabel: {
    fontSize: 11,
    marginBottom: 12,
  },
  qrImage: {
    width: 208,
    height: 208,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontWeight: '500',
    marginTop: 2,
  },
  detailCopyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailCopyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
