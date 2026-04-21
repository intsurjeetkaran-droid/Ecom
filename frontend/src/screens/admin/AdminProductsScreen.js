/**
 * Admin Products Screen  –  Module 3: Product Management (Admin)
 * -------------------------------------------------
 * - Filter by status: All / Pending / Approved / Rejected
 * - Approve / Reject pending products
 * - Paginated list with load-more
 * - Pull-to-refresh
 * Styled with StyleSheet (no NativeWind).
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StyleSheet,
} from 'react-native';
import { getAllProducts, updateProductStatus } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../styles/theme';
import Screen from '../../components/Screen';
import Card from '../../components/Card';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminProductsScreen() {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter,      setFilter]      = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const { isDark } = useTheme();

  // ── Fetch products ──
  const fetchProducts = useCallback(async ({ pageNum = 1, append = false, statusFilter } = {}) => {
    try {
      const params = {
        page:  pageNum,
        limit: 20,
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      };
      const { data } = await getAllProducts(params);
      setProducts((prev) => append ? [...prev, ...data.products] : data.products);
      setTotalPages(data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('[AdminProducts] Failed:', err.message);
      Alert.alert('Error', 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchProducts({ statusFilter: filter }); }, []);

  const handleFilterChange = (f) => {
    setFilter(f);
    setLoading(true);
    fetchProducts({ pageNum: 1, statusFilter: f });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts({ pageNum: 1, statusFilter: filter });
  };

  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchProducts({ pageNum: page + 1, append: true, statusFilter: filter });
  };

  // ── Approve / Reject ──
  const handleStatus = async (id, status, title) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const { data } = await updateProductStatus(id, status);
              setProducts((prev) =>
                prev.map((p) => p._id === id ? { ...p, status: data.status } : p)
              );
              console.log(`[AdminProducts] Product ${status} → id: ${id}`);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || `Failed to ${action} product`);
            }
          },
        },
      ]
    );
  };

  // Status badge styles
  const getStatusStyle = (status) => {
    if (status === 'pending')  return { bg: isDark ? colors.accent900 : colors.accent100,  text: isDark ? colors.accent300  : colors.accent700,  icon: '⏳' };
    if (status === 'approved') return { bg: 'rgba(16,185,129,0.1)',                         text: isDark ? colors.success400 : colors.success600, icon: '✅' };
    if (status === 'rejected') return { bg: 'rgba(244,63,94,0.1)',                          text: colors.danger500,                               icon: '❌' };
    return { bg: isDark ? colors.accent900 : colors.accent100, text: isDark ? colors.accent300 : colors.accent700, icon: '⏳' };
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>All Products</Text>
      </View>

      {/* Status filter tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
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
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0D9488" /></View>
        : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#0D9488" style={styles.footerLoader} /> : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  No {filter !== 'all' ? filter : ''} products found
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const s = getStatusStyle(item.status);
              return (
                <Card>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={styles.statusIcon}>{s.icon}</Text>
                      <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={[styles.price, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{item.price}</Text>
                  <Text style={[styles.meta, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{item.category}</Text>
                  <Text style={[styles.meta, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    Seller: {item.seller?.name} · {item.seller?.email}
                  </Text>
                  <Text style={[styles.meta, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                    {new Date(item.createdAt).toDateString()}
                  </Text>

                  {/* Approve / Reject — only for pending */}
                  {item.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.success500 }]}
                        onPress={() => handleStatus(item._id, 'approved', item.title)}
                      >
                        <Text style={styles.actionBtnText}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.danger500 }]}
                        onPress={() => handleStatus(item._id, 'rejected', item.title)}
                      >
                        <Text style={styles.actionBtnText}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  filterTabActive:   { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  filterTabInactive: { backgroundColor: 'transparent' },
  filterTabText:     { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  filterTabTextActive: { color: colors.white },

  // List
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent:      { paddingHorizontal: 16, paddingBottom: 24 },
  footerLoader:     { paddingVertical: 16 },

  // Empty state
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon:      { fontSize: 36, marginBottom: 12 },
  emptyText:      { fontSize: 14 },

  // Card
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitle: { fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusIcon: { fontSize: 11, marginRight: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

  price: { fontWeight: 'bold' },
  meta:  { fontSize: 11, marginTop: 2 },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
