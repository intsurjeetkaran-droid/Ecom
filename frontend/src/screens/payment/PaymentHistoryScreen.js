/**
 * Payment History Screen  –  Module 6: Payment
 * -------------------------------------------------
 * Shows payment records for the logged-in user.
 *   - Buyer  → payments they made
 *   - Seller → payments they received
 *
 * Includes total amount summary at the top.
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyPayments } from '../../api/paymentApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

const STATUS_CONFIG = {
  paid:     { icon: '✅', color: colors.success600, colorDark: colors.success400, label: 'Paid' },
  failed:   { icon: '❌', color: colors.danger500, colorDark: colors.danger500, label: 'Failed' },
  refunded: { icon: '↩️', color: colors.accent600, colorDark: colors.accent400, label: 'Refunded' },
};

export default function PaymentHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const isSeller = user.role === 'seller';

  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchPayments = async ({ pageNum = 1, append = false } = {}) => {
    try {
      const { data } = await getMyPayments({ page: pageNum, limit: 20 });
      setPayments((prev) => append ? [...prev, ...data.payments] : data.payments);
      setTotalPages(data.pages);
      setPage(pageNum);
      // Compute total from all fetched payments
      if (!append) {
        const sum = data.payments
          .filter((p) => p.status === 'paid')
          .reduce((acc, p) => acc + p.amount, 0);
        setTotalAmount(sum);
      }
    } catch (err) {
      console.error('[PaymentHistory] Failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchPayments(); }, []));

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
          {isSeller ? 'Payments Received' : 'Payment History'}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {payments.length} transactions
        </Text>
      </View>

      {/* Summary card */}
      {payments.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.primary800 : colors.primary600 }]}>
          <View>
            <Text style={styles.summaryLabel}>
              {isSeller ? 'Total Received' : 'Total Paid'}
            </Text>
            <Text style={styles.summaryAmount}>₹{totalAmount.toLocaleString()}</Text>
          </View>
          <Text style={styles.summaryIcon}>💰</Text>
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} />}
        onEndReached={() => { if (!loadingMore && page < totalPages) { setLoadingMore(true); fetchPayments({ pageNum: page + 1, append: true }); } }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <View style={styles.footerLoader}><ActivityIndicator color={colors.primary600} /></View> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textOnDark : colors.textDark }]}>
              No payments yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              {isSeller ? 'Confirmed payments will appear here' : 'Your payment history will appear here'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.paid;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PaymentDetail', { paymentId: item._id, orderId: item.order?._id })}
            >
              <Card>
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                      {item.product?.title}
                    </Text>
                    <Text style={[styles.amount, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                      ₹{item.amount}
                    </Text>
                    <Text style={[styles.userInfo, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                      {isSeller ? `From: ${item.buyer?.name}` : `To: ${item.seller?.name}`}
                    </Text>
                    {item.transactionId ? (
                      <Text style={[styles.transactionId, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                        Txn: {item.transactionId}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.statusIcon}>{cfg.icon}</Text>
                    <Text style={[styles.statusLabel, { color: isDark ? cfg.colorDark : cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <Text style={[styles.date, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    {new Date(item.confirmedAt || item.createdAt).toDateString()}
                  </Text>
                  <Text style={[styles.viewLink, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                    View →
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.primary200,
    fontSize: 11,
  },
  summaryAmount: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  summaryIcon: {
    fontSize: 36,
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 96,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  userInfo: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionId: {
    fontSize: 11,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  date: {
    fontSize: 11,
  },
  viewLink: {
    fontSize: 11,
    fontWeight: '500',
  },
});
