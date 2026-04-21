/**
 * Admin Dashboard Screen  –  Module 7: Admin Panel
 * -------------------------------------------------
 * Full platform overview:
 *   - Key metrics (users, products, orders, revenue)
 *   - Pending actions (products awaiting approval, payment verifications)
 *   - Breakdown cards (user roles, order statuses)
 *   - Recent activity (latest users, orders, payments)
 *   - Quick navigation to all admin sections
 * Styled with StyleSheet (no NativeWind).
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAnalytics } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../styles/theme';
import Screen from '../../components/Screen';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminDashboardScreen({ navigation }) {
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();
  const { isDark } = useTheme();

  const fetchAnalytics = async () => {
    try {
      const { data } = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('[AdminDashboard] Failed to load analytics:', err.message);
      Alert.alert('Error', 'Could not load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus so counts stay current
  useFocusEffect(useCallback(() => { fetchAnalytics(); }, []));

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  if (loading) return (
    <Screen safe={false} style={styles.centered}>
      <ActivityIndicator size="large" color="#0D9488" />
    </Screen>
  );

  const { users, products, orders, payments, recent } = analytics;

  // Pending actions that need admin attention
  const pendingActions = [
    { label: 'Products awaiting approval', count: products.pending,       icon: '📦', screen: 'Products', color: colors.accent500 },
    { label: 'Payment verifications',      count: orders.payment_pending, icon: '⏳', screen: 'Orders',   color: colors.primary600 },
    { label: 'Blocked users',              count: users.blocked,          icon: '🚫', screen: 'Users',    color: colors.danger500 },
  ].filter((a) => a.count > 0);

  return (
    <Screen safe={false}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.primary900 : colors.primary700 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Platform overview</Text>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggle />
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.flex1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnalytics(); }} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* ── Pending Actions Banner ── */}
          {pendingActions.length > 0 && (
            <View style={styles.mb4}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }]}>⚠️ Needs Attention</Text>
              {pendingActions.map((action) => (
                <TouchableOpacity
                  key={action.screen + action.label}
                  style={[styles.pendingAction, { backgroundColor: action.color }]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.85}
                >
                  <View style={styles.row}>
                    <Text style={styles.pendingIcon}>{action.icon}</Text>
                    <Text style={styles.pendingLabel}>{action.label}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{action.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Key Metrics ── */}
          <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }, styles.mb3]}>Platform Overview</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Total Users',    value: users.total,    icon: '👥', color: colors.primary600,  screen: 'Users' },
              { label: 'Total Products', value: products.total, icon: '📦', color: colors.accent500,   screen: 'Products' },
              { label: 'Total Orders',   value: orders.total,   icon: '🛒', color: colors.success500,  screen: 'Orders' },
              { label: 'Revenue',        value: `₹${payments.revenue.toLocaleString()}`, icon: '💰', color: isDark ? colors.primary900 : colors.primary800, screen: 'Payments' },
            ].map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.metricCard, { backgroundColor: m.color, width: '47%' }]}
                onPress={() => navigation.navigate(m.screen)}
                activeOpacity={0.85}
              >
                <View>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
                <Text style={styles.metricIcon}>{m.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── User Breakdown ── */}
          <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }, styles.mb3]}>User Breakdown</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {[
              { label: 'Buyers',  value: users.buyers,  icon: '🛍️', color: isDark ? colors.primary400 : colors.primary600 },
              { label: 'Sellers', value: users.sellers, icon: '🏪', color: isDark ? colors.accent400  : colors.accent600  },
              { label: 'Blocked', value: users.blocked, icon: '🚫', color: colors.danger500 },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.breakdownRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                <View style={styles.row}>
                  <Text style={styles.breakdownIcon}>{row.icon}</Text>
                  <Text style={[styles.breakdownRowLabel, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{row.label}</Text>
                </View>
                <Text style={[styles.breakdownValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* ── Product Breakdown ── */}
          <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }, styles.mb3]}>Product Breakdown</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {[
              { label: 'Pending',  value: products.pending,  icon: '⏳', color: isDark ? colors.accent400   : colors.accent600   },
              { label: 'Approved', value: products.approved, icon: '✅', color: isDark ? colors.success400  : colors.success600  },
              { label: 'Rejected', value: products.rejected, icon: '❌', color: colors.danger500 },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.breakdownRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                <View style={styles.row}>
                  <Text style={styles.breakdownIcon}>{row.icon}</Text>
                  <Text style={[styles.breakdownRowLabel, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{row.label}</Text>
                </View>
                <Text style={[styles.breakdownValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* ── Order Breakdown ── */}
          <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }, styles.mb3]}>Order Breakdown</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {[
              { label: 'Initiated',  value: orders.initiated,       icon: '🛒', color: colors.mutedLight },
              { label: 'Pending',    value: orders.payment_pending, icon: '⏳', color: isDark ? colors.accent400   : colors.accent600   },
              { label: 'Paid',       value: orders.paid,            icon: '✅', color: isDark ? colors.success400  : colors.success600  },
              { label: 'Completed',  value: orders.completed,       icon: '🎉', color: isDark ? colors.primary400  : colors.primary600  },
              { label: 'Failed',     value: orders.failed,          icon: '❌', color: colors.danger500 },
              { label: 'Cancelled',  value: orders.cancelled,       icon: '🚫', color: colors.mutedLight },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.orderBreakdownRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                <View style={styles.row}>
                  <Text style={styles.orderBreakdownIcon}>{row.icon}</Text>
                  <Text style={[styles.breakdownRowLabel, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{row.label}</Text>
                </View>
                <Text style={[styles.orderBreakdownValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* ── Recent Users ── */}
          <SectionHeader title="Recent Users" onPress={() => navigation.navigate('Users')} isDark={isDark} />
          <View style={[styles.card, styles.overflowHidden, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {recent.users.length === 0
              ? <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>No users yet</Text>
              : recent.users.map((u, i) => (
                <View key={u._id} style={[styles.recentRow, i < recent.users.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{u.name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.flex1}>
                    <Text style={[styles.recentName, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{u.name}</Text>
                    <Text style={[styles.recentSub, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{u.email}</Text>
                  </View>
                  <View style={styles.itemsEnd}>
                    <Text style={[styles.recentRole, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{u.role}</Text>
                    {u.isBlocked && <Text style={styles.blockedText}>Blocked</Text>}
                  </View>
                </View>
              ))
            }
          </View>

          {/* ── Recent Products ── */}
          <SectionHeader title="Recent Products" onPress={() => navigation.navigate('Products')} isDark={isDark} />
          <View style={[styles.card, styles.overflowHidden, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {recent.products.length === 0
              ? <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>No products yet</Text>
              : recent.products.map((p, i) => (
                <View key={p._id} style={[styles.recentRow, styles.justifyBetween, i < recent.products.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <View style={[styles.flex1, styles.mr3]}>
                    <Text style={[styles.recentName, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>{p.title}</Text>
                    <Text style={[styles.recentSub, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>by {p.seller?.name} · ₹{p.price}</Text>
                  </View>
                  <StatusBadge status={p.status} isDark={isDark} />
                </View>
              ))
            }
          </View>

          {/* ── Recent Orders ── */}
          <SectionHeader title="Recent Orders" onPress={() => navigation.navigate('Orders')} isDark={isDark} />
          <View style={[styles.card, styles.overflowHidden, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {recent.orders.length === 0
              ? <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>No orders yet</Text>
              : recent.orders.map((o, i) => (
                <View key={o._id} style={[styles.recentRow, styles.justifyBetween, i < recent.orders.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <View style={[styles.flex1, styles.mr3]}>
                    <Text style={[styles.recentName, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>{o.product?.title}</Text>
                    <Text style={[styles.recentSub, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{o.buyer?.name} → {o.seller?.name}</Text>
                  </View>
                  <View style={styles.itemsEnd}>
                    <Text style={[styles.recentAmount, { color: isDark ? colors.primary400 : colors.primary600 }]}>₹{o.amount}</Text>
                    <OrderStatusBadge status={o.status} isDark={isDark} />
                  </View>
                </View>
              ))
            }
          </View>

          {/* ── Recent Payments ── */}
          <SectionHeader title="Recent Payments" onPress={() => navigation.navigate('Payments')} isDark={isDark} />
          <View style={[styles.card, styles.overflowHidden, { backgroundColor: isDark ? colors.cardDark : colors.cardLight, borderColor: isDark ? colors.borderDark : colors.borderLight }]}>
            {recent.payments.length === 0
              ? <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>No payments yet</Text>
              : recent.payments.map((p, i) => (
                <View key={p._id} style={[styles.recentRow, styles.justifyBetween, i < recent.payments.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.borderDark : colors.borderLight }]}>
                  <View style={[styles.flex1, styles.mr3]}>
                    <Text style={[styles.recentName, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>{p.product?.title}</Text>
                    <Text style={[styles.recentSub, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{p.buyer?.name} → {p.seller?.name}</Text>
                  </View>
                  <Text style={[styles.recentAmount, { color: isDark ? colors.success400 : colors.success600 }]}>₹{p.amount}</Text>
                </View>
              ))
            }
          </View>

        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

// ── Small helper components ──

function SectionHeader({ title, onPress, isDark }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={[styles.sectionLabel, { color: isDark ? colors.textOnDark : colors.slate800 }]}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={[styles.viewAll, { color: isDark ? colors.primary400 : colors.primary600 }]}>View all →</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatusBadge({ status, isDark }) {
  const cfgMap = {
    pending:  {
      bg:   isDark ? colors.accent900  : colors.accent100,
      text: isDark ? colors.accent300  : colors.accent700,
    },
    approved: {
      bg:   'rgba(16,185,129,0.1)',
      text: isDark ? colors.success400 : colors.success600,
    },
    rejected: {
      bg:   'rgba(244,63,94,0.1)',
      text: colors.danger500,
    },
  };
  const cfg = cfgMap[status] || { bg: isDark ? colors.subtleDark : colors.subtleLight, text: isDark ? colors.mutedDark : colors.mutedLight };

  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{status}</Text>
    </View>
  );
}

function OrderStatusBadge({ status, isDark }) {
  const colorMap = {
    initiated:       colors.mutedLight,
    payment_pending: isDark ? colors.accent400   : colors.accent600,
    paid:            isDark ? colors.success400  : colors.success600,
    completed:       isDark ? colors.primary400  : colors.primary600,
    failed:          colors.danger500,
    cancelled:       colors.mutedLight,
  };
  const color = colorMap[status] || colors.mutedLight;
  const label = status === 'payment_pending' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1);
  return <Text style={[styles.orderStatusBadge, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  flex1:          { flex: 1 },
  centered:       { alignItems: 'center', justifyContent: 'center' },
  row:            { flexDirection: 'row', alignItems: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  itemsEnd:       { alignItems: 'flex-end' },
  overflowHidden: { overflow: 'hidden' },
  mb3:            { marginBottom: 12 },
  mb4:            { marginBottom: 16 },
  mr3:            { marginRight: 12 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.primary200,
    fontSize: 11,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bottomSpacer: { height: 32 },

  // Pending actions
  pendingAction: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pendingIcon:  { fontSize: 20, marginRight: 12 },
  pendingLabel: { color: colors.white, fontSize: 14, fontWeight: '500' },
  pendingBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pendingBadgeText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },

  // Section label
  sectionLabel: { fontWeight: '600' },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  metricValue: { color: colors.white, fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  metricIcon:  { fontSize: 28, opacity: 0.8 },

  // Card
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  // Breakdown rows
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  breakdownIcon:     { fontSize: 18, marginRight: 8 },
  breakdownRowLabel: { fontSize: 14 },
  breakdownValue:    { fontWeight: 'bold', fontSize: 16 },

  orderBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  orderBreakdownIcon:  { fontSize: 16, marginRight: 8 },
  orderBreakdownValue: { fontWeight: 'bold' },

  // Section header row
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewAll: { fontSize: 11, fontWeight: '500' },

  // Recent rows
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recentName:   { fontSize: 14, fontWeight: '500' },
  recentSub:    { fontSize: 11, marginTop: 2 },
  recentRole:   { fontSize: 11, textTransform: 'capitalize' },
  recentAmount: { fontWeight: 'bold', fontSize: 14 },
  blockedText:  { fontSize: 11, color: colors.danger500, marginTop: 2 },
  emptyText:    { fontSize: 14, padding: 16 },

  // Avatar
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: 'bold' },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Order status badge
  orderStatusBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
