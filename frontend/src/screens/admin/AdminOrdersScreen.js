/**
 * Admin Orders Screen  –  Module 5: Order Management
 * -------------------------------------------------
 * All orders with status filter tabs and pagination.
 * Styled with StyleSheet (no NativeWind).
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { getAllOrders } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../styles/theme';
import Screen from '../../components/Screen';
import Card from '../../components/Card';

const FILTERS = ['all', 'payment_pending', 'paid', 'completed', 'failed', 'cancelled'];

export default function AdminOrdersScreen() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter,      setFilter]      = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const { isDark } = useTheme();

  const fetchOrders = useCallback(async ({ pageNum = 1, append = false, statusFilter } = {}) => {
    try {
      const params = {
        page: pageNum, limit: 20,
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      };
      const { data } = await getAllOrders(params);
      setOrders((prev) => append ? [...prev, ...data.orders] : data.orders);
      setTotalPages(data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('[AdminOrders] Failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchOrders({ statusFilter: filter }); }, []);

  const handleFilterChange = (f) => {
    setFilter(f);
    setLoading(true);
    fetchOrders({ pageNum: 1, statusFilter: f });
  };

  // Status config — resolved at render time using isDark
  const getStatusConfig = (status) => {
    const map = {
      initiated:       { icon: '🛒', dotColor: colors.mutedLight,  textColor: colors.mutedLight,                                  label: 'Initiated' },
      payment_pending: { icon: '⏳', dotColor: colors.accent500,   textColor: isDark ? colors.accent400   : colors.accent600,    label: 'Pending'   },
      paid:            { icon: '✅', dotColor: colors.success500,  textColor: isDark ? colors.success400  : colors.success600,   label: 'Paid'      },
      completed:       { icon: '🎉', dotColor: colors.primary600,  textColor: isDark ? colors.primary400  : colors.primary600,   label: 'Completed' },
      failed:          { icon: '❌', dotColor: colors.danger500,   textColor: colors.danger500,                                  label: 'Failed'    },
      cancelled:       { icon: '🚫', dotColor: colors.mutedLight,  textColor: colors.mutedLight,                                  label: 'Cancelled' },
    };
    return map[status] || map.initiated;
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>All Orders</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterWrapper}>
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
                styles.filterTab,
                filter === f
                  ? styles.filterTabActive
                  : [styles.filterTabInactive, { borderColor: isDark ? colors.borderDark : colors.borderLight }],
              ]}
            >
              <Text style={[
                styles.filterTabText,
                filter === f
                  ? styles.filterTabTextActive
                  : { color: isDark ? colors.mutedDark : colors.mutedLight },
              ]}>
                {f === 'payment_pending' ? 'Pending' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading
        ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0D9488" /></View>
        : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders({ pageNum: 1, statusFilter: filter }); }} />}
            onEndReached={() => { if (!loadingMore && page < totalPages) { setLoadingMore(true); fetchOrders({ pageNum: page + 1, append: true, statusFilter: filter }); } }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#0D9488" style={styles.footerLoader} /> : null}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                No orders found
              </Text>
            }
            renderItem={({ item }) => {
              const cfg = getStatusConfig(item.status);
              return (
                <Card>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                      {item.product?.title}
                    </Text>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusIcon}>{cfg.icon}</Text>
                      <Text style={[styles.statusLabel, { color: cfg.textColor }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.amount, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{item.amount}</Text>
                  <View style={styles.partiesRow}>
                    <Text style={[styles.partyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Buyer: {item.buyer?.name}</Text>
                    <Text style={[styles.partyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Seller: {item.seller?.name}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    {new Date(item.createdAt).toDateString()}
                  </Text>
                </Card>
              );
            }}
          />
        )
      }
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold' },

  // Filter
  filterWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  filterList:    { gap: 8 },
  filterTab:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  filterTabActive:   { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  filterTabInactive: { backgroundColor: 'transparent' },
  filterTabText:     { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  filterTabTextActive: { color: colors.white },

  // List
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent:      { paddingHorizontal: 16, paddingBottom: 24 },
  footerLoader:     { paddingVertical: 16 },
  emptyText:        { textAlign: 'center', marginTop: 80 },

  // Card
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitle: { fontWeight: '600', flex: 1, marginRight: 8 },
  statusRow:    { flexDirection: 'row', alignItems: 'center' },
  statusIcon:   { fontSize: 16, marginRight: 4 },
  statusLabel:  { fontSize: 11, fontWeight: '600' },

  amount: { fontWeight: 'bold' },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  partyText: { fontSize: 11 },
  dateText:  { fontSize: 11, marginTop: 4 },
});
