/**
 * Order Detail Screen  –  Module 5: Order Management
 * Styled with inline styles.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, Image, TextInput, StyleSheet,
} from 'react-native';
import {
  getOrderById, submitPaymentProof,
  verifyPayment, completeOrder, cancelOrder,
} from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { pickImage } from '../../utils/imageUtils';
import { colors } from '../../styles/theme';

const STATUS_CONFIG = {
  initiated:       { label: 'Initiated',       icon: '🛒', color: colors.mutedLight, colorDark: colors.mutedDark, desc: 'Order placed. Submit payment to proceed.' },
  payment_pending: { label: 'Payment Pending', icon: '⏳', color: colors.accent600,  colorDark: colors.accent400, desc: 'Waiting for seller to verify your payment.' },
  paid:            { label: 'Paid',            icon: '✅', color: colors.success600, colorDark: colors.success400, desc: 'Payment confirmed. Awaiting delivery.' },
  completed:       { label: 'Completed',       icon: '🎉', color: colors.primary600, colorDark: colors.primary400, desc: 'Order fulfilled successfully.' },
  failed:          { label: 'Payment Failed',  icon: '❌', color: colors.danger500,  colorDark: colors.danger500, desc: 'Payment was rejected by the seller.' },
  cancelled:       { label: 'Cancelled',       icon: '🚫', color: colors.mutedLight, colorDark: colors.mutedDark, desc: 'Order was cancelled.' },
};

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot,    setScreenshot]    = useState(null);
  const [sellerNote,    setSellerNote]    = useState('');

  const isBuyer  = user.role === 'buyer';
  const isSeller = user.role === 'seller';

  const fetchOrder = async () => {
    try {
      const { data } = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load order');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handlePickScreenshot = async () => {
    const dataUri = await pickImage({ quality: 0.8 });
    if (dataUri) setScreenshot(dataUri);
  };

  const handleSubmitProof = async () => {
    if (!transactionId.trim() && !screenshot) {
      Alert.alert('Required', 'Please enter a transaction ID or upload a screenshot');
      return;
    }
    setActionLoading(true);
    try {
      const { data } = await submitPaymentProof(order._id, {
        transactionId: transactionId.trim(),
        screenshotB64: screenshot || '',
      });
      setOrder(data.order);
      Alert.alert('Submitted ✅', 'Payment proof sent. Waiting for seller verification.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit proof.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const { data } = await cancelOrder(order._id);
            setOrder(data.order);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleVerify = (action) => {
    const label = action === 'confirm' ? 'Confirm' : 'Reject';
    Alert.alert(`${label} Payment`, `${label} this payment from ${order.buyer?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          setActionLoading(true);
          try {
            const { data } = await verifyPayment(order._id, action, sellerNote);
            setOrder(data.order);
            Alert.alert(action === 'confirm' ? 'Payment Confirmed ✅' : 'Payment Rejected', data.message);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to verify');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleComplete = () => {
    Alert.alert('Complete Order', 'Mark this order as delivered/completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          setActionLoading(true);
          try {
            const { data } = await completeOrder(order._id);
            setOrder(data.order);
            Alert.alert('Order Completed 🎉', 'Order marked as completed.');
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to complete');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;

  return (
    <Screen>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
          <Text style={styles.statusIcon}>{cfg.icon}</Text>
          <Text style={[styles.statusLabel, { color: isDark ? cfg.colorDark : cfg.color }]}>{cfg.label}</Text>
          <Text style={[styles.statusDesc, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{cfg.desc}</Text>
          {order.sellerNote ? (
            <View style={[styles.sellerNoteBox, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
              <Text style={[styles.sellerNoteLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Seller note:</Text>
              <Text style={[styles.sellerNoteText, { color: isDark ? colors.textOnDark : colors.textDark }]}>{order.sellerNote}</Text>
            </View>
          ) : null}
        </View>

        {/* Product info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>PRODUCT</Text>
          <View style={styles.productRow}>
            {order.product?.images?.[0]
              ? <Image source={{ uri: order.product.images[0] }} style={styles.productImage} resizeMode="cover" />
              : <View style={[styles.productImagePlaceholder, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}><Text style={styles.productPlaceholderIcon}>📦</Text></View>
            }
            <View style={styles.productInfo}>
              <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={2}>{order.product?.title}</Text>
              <Text style={[styles.productPrice, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{order.amount}</Text>
            </View>
          </View>
        </Card>

        {/* Order meta */}
        <Card>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>ORDER INFO</Text>
          <InfoRow label="Order ID"  value={`#${order._id.slice(-8).toUpperCase()}`} isDark={isDark} />
          <InfoRow label={isBuyer ? 'Seller' : 'Buyer'} value={isBuyer ? order.seller?.name : order.buyer?.name} isDark={isDark} />
          <InfoRow label="Placed on" value={new Date(order.createdAt).toDateString()} isDark={isDark} />
          {order.paidAt      && <InfoRow label="Paid on"      value={new Date(order.paidAt).toDateString()} isDark={isDark} />}
          {order.completedAt && <InfoRow label="Completed on" value={new Date(order.completedAt).toDateString()} isDark={isDark} />}
          {order.cancelledAt && <InfoRow label="Cancelled on" value={new Date(order.cancelledAt).toDateString()} isDark={isDark} last />}
        </Card>

        {/* Payment proof */}
        {(order.paymentProof?.transactionId || order.paymentProof?.screenshotB64) ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>PAYMENT PROOF</Text>
            {order.paymentProof.transactionId ? <InfoRow label="Transaction ID" value={order.paymentProof.transactionId} isDark={isDark} /> : null}
            {order.paymentProof.submittedAt ? <InfoRow label="Submitted" value={new Date(order.paymentProof.submittedAt).toLocaleString()} isDark={isDark} /> : null}
            {order.paymentProof.screenshotB64 ? (
              <View style={styles.screenshotContainer}>
                <Text style={[styles.screenshotLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Screenshot</Text>
                <Image source={{ uri: order.paymentProof.screenshotB64 }} style={styles.screenshot} resizeMode="contain" />
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Buyer: submit proof */}
        {isBuyer && order.status === 'initiated' && (
          <Card>
            <Text style={[styles.cardTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>Submit Payment Proof</Text>
            <Text style={[styles.cardSubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Pay ₹{order.amount} to the seller via UPI/bank, then enter your transaction ID and optionally upload a screenshot.
            </Text>
            <Text style={[styles.inputLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>UPI Transaction ID</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, borderColor: isDark ? colors.borderDark : colors.borderLight, color: isDark ? colors.textOnDark : colors.slate800 }]}
              placeholder="e.g. 123456789012"
              placeholderTextColor={colors.mutedLight}
              value={transactionId}
              onChangeText={setTransactionId}
            />
            <TouchableOpacity
              style={[styles.screenshotPicker, { borderColor: isDark ? colors.borderDark : colors.borderLight }]}
              onPress={handlePickScreenshot}
            >
              {screenshot
                ? <Image source={{ uri: screenshot }} style={styles.screenshotPreview} resizeMode="cover" />
                : <><Text style={styles.cameraIcon}>📷</Text><Text style={[styles.screenshotPickerText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Upload payment screenshot (optional)</Text></>
              }
            </TouchableOpacity>
            <Button title="I Have Paid ✓" onPress={handleSubmitProof} loading={actionLoading} variant="accent" />
          </Card>
        )}

        {isBuyer && order.status === 'initiated' && (
          <View style={styles.actionButton}>
            <Button title="Cancel Order" onPress={handleCancel} loading={actionLoading} variant="danger" />
          </View>
        )}

        {isBuyer && order.status === 'initiated' && (
          <View style={styles.actionButton}>
            <Button
              title="💳  View Seller Payment Details"
              onPress={() => navigation.navigate('PaymentDetails', { sellerId: order.seller?._id, sellerName: order.seller?.name, orderId: order._id, amount: order.amount })}
              variant="outline"
            />
          </View>
        )}

        {(order.status === 'paid' || order.status === 'completed') && (
          <View style={styles.actionButton}>
            <Button title="📄  View Payment Record" onPress={() => navigation.navigate('PaymentDetail', { orderId: order._id })} variant="outline" />
          </View>
        )}

        {/* Seller: verify payment */}
        {isSeller && order.status === 'payment_pending' && (
          <Card>
            <Text style={[styles.cardTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>Verify Payment</Text>
            <Text style={[styles.cardSubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Check the payment proof above. Confirm if valid, or reject if incorrect.
            </Text>
            <Text style={[styles.inputLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Note to buyer (optional)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, borderColor: isDark ? colors.borderDark : colors.borderLight, color: isDark ? colors.textOnDark : colors.slate800 }]}
              placeholder="e.g. Payment received, thank you!"
              placeholderTextColor={colors.mutedLight}
              value={sellerNote}
              onChangeText={setSellerNote}
            />
            <View style={styles.verifyRow}>
              <View style={styles.verifyButton}>
                <Button title="✓ Confirm" onPress={() => handleVerify('confirm')} loading={actionLoading} variant="success" />
              </View>
              <View style={styles.verifyButton}>
                <Button title="✕ Reject" onPress={() => handleVerify('reject')} loading={actionLoading} variant="danger" />
              </View>
            </View>
          </Card>
        )}

        {isSeller && order.status === 'paid' && (
          <View style={styles.actionButton}>
            <Button title="Mark as Completed 🎉" onPress={handleComplete} loading={actionLoading} />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value, last = false, isDark }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
      <Text style={[styles.infoLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statusBanner: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  statusIcon: { fontSize: 36, marginBottom: 8 },
  statusLabel: { fontSize: 18, fontWeight: 'bold' },
  statusDesc: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  sellerNoteBox: { marginTop: 12, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, width: '100%' },
  sellerNoteLabel: { fontSize: 11 },
  sellerNoteText: { fontSize: 14, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '500', letterSpacing: 1, marginBottom: 8 },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
  productImagePlaceholder: { width: 64, height: 64, borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  productPlaceholderIcon: { fontSize: 24 },
  productInfo: { flex: 1 },
  productTitle: { fontWeight: '600' },
  productPrice: { fontWeight: 'bold', marginTop: 4 },
  screenshotContainer: { marginTop: 12 },
  screenshotLabel: { fontSize: 11, marginBottom: 8 },
  screenshot: { width: '100%', height: 192, borderRadius: 12 },
  cardTitle: { fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 11, marginBottom: 16, lineHeight: 18 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  textInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  screenshotPicker: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  screenshotPreview: { width: '100%', height: 144, borderRadius: 8 },
  cameraIcon: { fontSize: 24, marginBottom: 4 },
  screenshotPickerText: { fontSize: 14 },
  actionButton: { marginBottom: 16 },
  verifyRow: { flexDirection: 'row', gap: 12 },
  verifyButton: { flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 },
  bottomSpacer: { height: 32 },
});
