/**
 * Buyer Orders Screen  –  Module 5: Order Management
 * -------------------------------------------------
 * Lists all orders placed by the buyer.
 * Tap an order to open OrderDetailScreen.
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBuyerOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

const STATUS_CONFIG = {
  initiated:       { icon: '🛒', color: colors.mutedLight, colorDark: colors.mutedDark, label: 'Initiated' },
  payment_pending: { icon: '⏳', color: colors.accent600, colorDark: colors.accent400, label: 'Pending Verification' },
  paid:            { icon: '✅', color: colors.success600, colorDark: colors.success400, label: 'Paid' },
  completed:       { icon: '🎉', color: colors.primary600, colorDark: colors.primary400, label: 'Completed' },
  failed:          { icon: '❌', color: colors.danger500, colorDark: colors.danger500, label: 'Payment Failed' },
  cancelled:       { icon: '🚫', color: colors.mutedLight, colorDark: colors.mutedDark, label: 'Cancelled' },
};

export default function OrdersScreen({ navigation }) {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const fetchOrders = async () => {
    try {
      const { data } = await getBuyerOrders();
      setOrders(data);
    } catch (err) {
      console.error('[BuyerOrders] Failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrders(); }, []));

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
          My Orders
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {orders.length} total
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textOnDark : colors.textDark }]}>
              No orders yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Browse products and place your first order
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.initiated;
          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
              <Card>
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                      {item.product?.title}
                    </Text>
                    <Text style={[styles.amount, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                      ₹{item.amount}
                    </Text>
                    <Text style={[styles.seller, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                      Seller: {item.seller?.name}
                    </Text>
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
                    {new Date(item.createdAt).toDateString()}
                  </Text>
                  <Text style={[styles.viewLink, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                    View Details →
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    marginTop: 4,
  },
  seller: {
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
    alignItems: 'center',
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
