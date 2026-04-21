/**
 * Seller Products Screen  –  Module 3: Product Management (Seller)
 * Styled with inline styles.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyProducts, deleteProduct } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../styles/theme';

const STATUS_STYLES = {
  pending:  { bg: colors.accent100,  bgDark: colors.accent900,  text: colors.accent700,  textDark: colors.accent300,  icon: '⏳' },
  approved: { bg: 'rgba(16,185,129,0.1)', bgDark: 'rgba(16,185,129,0.1)', text: colors.success600, textDark: colors.success400, icon: '✅' },
  rejected: { bg: 'rgba(244,63,94,0.1)',  bgDark: 'rgba(244,63,94,0.1)',  text: colors.danger500,  textDark: colors.danger500,  icon: '❌' },
};

export default function SellerProductsScreen({ navigation }) {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const fetchProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data);
    } catch (err) {
      console.error('[SellerProducts] Failed to load:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchProducts(); }, []));

  const handleDelete = (item) => {
    Alert.alert('Delete Product', `Delete "${item.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(item._id);
            setProducts((prev) => prev.filter((p) => p._id !== item._id));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Could not delete product');
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

  const counts = products.reduce(
    (acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; },
    { pending: 0, approved: 0, rejected: 0 }
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>My Products</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{products.length} total</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Status chips */}
      {products.length > 0 && (
        <View style={styles.chipsRow}>
          {Object.entries(counts).map(([status, count]) => {
            const s = STATUS_STYLES[status];
            return (
              <View key={status} style={[styles.chip, { backgroundColor: isDark ? s.bgDark : s.bg }]}>
                <Text style={styles.chipIcon}>{s.icon}</Text>
                <Text style={[styles.chipText, { color: isDark ? s.textDark : s.text }]}>{count} {status}</Text>
              </View>
            );
          })}
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textOnDark : colors.textDark }]}>No products yet</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Start selling by adding your first product</Text>
            <View style={styles.emptyButton}>
              <Button title="Add Your First Product" onPress={() => navigation.navigate('AddProduct')} />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const s = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
          return (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: isDark ? s.bgDark : s.bg }]}>
                  <Text style={styles.statusBadgeIcon}>{s.icon}</Text>
                  <Text style={[styles.statusBadgeText, { color: isDark ? s.textDark : s.text }]}>{item.status}</Text>
                </View>
              </View>

              <Text style={[styles.price, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{item.price}</Text>
              <Text style={[styles.category, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{item.category}</Text>
              <Text style={[styles.description, { color: isDark ? colors.mutedDark : colors.mutedLight }]} numberOfLines={2}>
                {item.description}
              </Text>

              {item.status === 'rejected' && (
                <View style={styles.rejectedNote}>
                  <Text style={styles.rejectedText}>❌ Rejected by admin. Edit and resubmit for review.</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.primary600 }]}
                  onPress={() => navigation.navigate('EditProduct', { product: item })}
                >
                  <Text style={[styles.actionBtnText, { color: isDark ? colors.primary400 : colors.primary600 }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.danger500 }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.danger500 }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 11, marginTop: 2 },
  addButton: { backgroundColor: colors.primary600, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  chipsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  chipIcon: { fontSize: 11, marginRight: 4 },
  chipText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontWeight: '600', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, marginBottom: 24 },
  emptyButton: { width: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  productTitle: { fontWeight: '600', flex: 1, marginRight: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  statusBadgeIcon: { fontSize: 11, marginRight: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  price: { fontWeight: 'bold' },
  category: { fontSize: 11, marginTop: 2 },
  description: { fontSize: 11, marginTop: 4 },
  rejectedNote: { marginTop: 8, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  rejectedText: { color: colors.danger500, fontSize: 11 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
});
