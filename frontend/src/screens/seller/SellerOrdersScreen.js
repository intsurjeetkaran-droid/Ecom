/**
 * Seller Orders Screen  –  Module 5: Order Management
 * Styled with inline styles.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSellerOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

const STATUS_CONFIG = {
  initiated:       { icon: '🛒', color: colors.mutedLight, colorDark: colors.mutedDark, label: 'Initiated' },
  payment_pending: { icon: '⏳', color: colors.accent600,  colorDark: colors.accent400, label: 'Pending Verification' },
  paid:            { icon: '✅', color: colors.success600, colorDark: colors.success400, label: 'Paid' },
  completed:       { icon: '🎉', color: colors.primary600, colorDark: colors.primary400, label: 'Completed' },
  failed:          { icon: '❌', color: colors.danger500,  colorDark: colors.danger500,  label: 'Payment Failed' },
  cancelled:       { icon: '🚫', color: colors.mutedLight, colorDark: colors.mutedDark,  label: 'Cancelled' },
};

const FILTERS = ['all', 'payment_pending', 'paid', 'completed', 'failed'];

export default function SellerOrdersScreen({ navigation }) {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');
  const { isDark } = useTheme();

  const fetchOrders = async (statusFilter = filter) => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await getSellerOrders(params);
      setOrders(data);
    } catch (err) {
      console.error('[SellerOrders] Failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrders(filter); }, [filter]));

  const handleFilterChange = (f) => {
    setFilter(f);
    setLoading(true);
    fetchOrders(f);
  };

  const pendingCount = orders.filter((o) => o.status === 'payment_pending').length;

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>Orders</Text>
          {pendingCount > 0 && filter === 'all' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
          {orders.length} orders
        </Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              onPress={() => handleFilterChange(f)}
              style={[
                styles.filterChip,
                filter === f
                  ? { backgroundColor: colors.primary600, borderColor: colors.primary600 }
                  : { backgroundColor: 'transparent', borderColor: isDark ? colors.borderDark : colors.borderLight }
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? colors.white : (isDark ? colors.mutedDark : colors.mutedLight) }]}>
                {f === 'payment_pending' ? 'Pending' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(filter); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textOnDark : colors.textDark }]}>No orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Orders for your products will appear here</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.initiated;
          const needsAction = item.status === 'payment_pending';

          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
              <Card style={needsAction ? { borderColor: isDark ? colors.accent600 : colors.accent400 } : undefined}>
                {needsAction && (
                  <View style={[styles.actionBanner, { backgroundColor: isDark ? 'rgba(120, 53, 15, 0.3)' : colors.accent50 }]}>
                    <Text style={styles.actionBannerIcon}>⚠️</Text>
                    <Text style={[styles.actionBannerText, { color: isDark ? colors.accent300 : colors.accent700 }]}>
                      Action required — verify payment
                    </Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                      {item.product?.title}
                    </Text>
                    <Text style={[styles.amount, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{item.amount}</Text>
                    <Text style={[styles.buyer, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Buyer: {item.buyer?.name}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.statusIcon}>{cfg.icon}</Text>
                    <Text style={[styles.statusLabel, { color: isDark ? cfg.colorDark : cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <Text style={[styles.date, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{new Date(item.createdAt).toDateString()}</Text>
                  <Text style={[styles.viewLink, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                    {needsAction ? 'Verify Now →' : 'View Details →'}
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
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  pendingBadge: { marginLeft: 8, backgroundColor: colors.accent500, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 2 },
  pendingBadgeText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
  subtitle: { fontSize: 11, marginTop: 2 },
  filterContainer: { paddingHorizontal: 16, marginBottom: 12 },
  filterList: { gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 96 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontWeight: '600' },
  emptySubtitle: { fontSize: 14, marginTop: 4 },
  actionBanner: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  actionBannerIcon: { fontSize: 11, marginRight: 4 },
  actionBannerText: { fontSize: 11, fontWeight: '600' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 12 },
  productTitle: { fontWeight: '600' },
  amount: { fontWeight: 'bold', marginTop: 4 },
  buyer: { fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  statusIcon: { fontSize: 24 },
  statusLabel: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  date: { fontSize: 11 },
  viewLink: { fontSize: 11, fontWeight: '500' },
});
