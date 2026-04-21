/**
 * Admin Users Screen  –  Module 7: Admin Panel
 * -------------------------------------------------
 * - Search users by name or email
 * - Filter by role (all / buyer / seller)
 * - Block / unblock with confirmation
 * - Paginated with load-more
 * Styled with StyleSheet (no NativeWind).
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, TextInput, StyleSheet,
} from 'react-native';
import { getAllUsers, toggleBlock } from '../../api/userApi';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../styles/theme';
import Screen from '../../components/Screen';
import Card from '../../components/Card';

const ROLE_FILTERS = ['all', 'buyer', 'seller'];

export default function AdminUsersScreen() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');

  const { isDark } = useTheme();
  const searchTimer = useRef(null);

  const fetchUsers = useCallback(async ({ pageNum = 1, append = false, searchVal, role } = {}) => {
    try {
      const params = {
        page: pageNum, limit: 20,
        ...(searchVal && { search: searchVal }),
        ...(role && role !== 'all' && { role }),
      };
      const { data } = await getAllUsers(params);
      setUsers((prev) => append ? [...prev, ...data.users] : data.users);
      setTotalPages(data.pages);
      setTotal(data.total);
      setPage(pageNum);
    } catch (err) {
      console.error('[AdminUsers] Failed:', err.message);
      Alert.alert('Error', 'Could not load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchUsers({ searchVal: search, role: roleFilter }); }, []);

  // Debounced search
  const handleSearch = (text) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      fetchUsers({ pageNum: 1, searchVal: text, role: roleFilter });
    }, 400);
  };

  const handleRoleFilter = (r) => {
    setRoleFilter(r);
    setLoading(true);
    fetchUsers({ pageNum: 1, searchVal: search, role: r });
  };

  const handleToggleBlock = (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'block' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const { data } = await toggleBlock(user._id);
              setUsers((prev) =>
                prev.map((u) => u._id === user._id ? { ...u, isBlocked: data.user.isBlocked } : u)
              );
              console.log(`[AdminUsers] User ${action}ed → id: ${user._id}`);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  // Role badge colors
  const getRoleBadgeStyle = (role) => {
    if (role === 'buyer')  return { bg: isDark ? colors.primary900 : colors.primary100, text: isDark ? colors.primary200 : colors.primary700 };
    if (role === 'seller') return { bg: isDark ? colors.accent900  : colors.accent100,  text: isDark ? colors.accent300  : colors.accent700  };
    return { bg: 'rgba(244,63,94,0.1)', text: colors.danger500 };
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>All Users</Text>
        <Text style={[styles.subtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>{total} total</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
        <Text style={[styles.searchIcon, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: isDark ? colors.textOnDark : colors.slate800 }]}
          placeholder="Search by name or email..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={[styles.clearBtn, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Role filter */}
      <View style={styles.roleFilterRow}>
        {ROLE_FILTERS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => handleRoleFilter(r)}
            style={[
              styles.filterTab,
              roleFilter === r
                ? styles.filterTabActive
                : [styles.filterTabInactive, { borderColor: isDark ? colors.borderDark : colors.borderLight }],
            ]}
          >
            <Text style={[
              styles.filterTabText,
              roleFilter === r
                ? styles.filterTabTextActive
                : { color: isDark ? colors.mutedDark : colors.mutedLight },
            ]}>
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0D9488" /></View>
        : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers({ pageNum: 1, searchVal: search, role: roleFilter }); }} />}
            onEndReached={() => { if (!loadingMore && page < totalPages) { setLoadingMore(true); fetchUsers({ pageNum: page + 1, append: true, searchVal: search, role: roleFilter }); } }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color="#0D9488" /> : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={[styles.emptyText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                  {search ? `No users matching "${search}"` : 'No users found'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const roleBadge = getRoleBadgeStyle(item.role);
              return (
                <Card style={item.isBlocked ? styles.blockedCard : null}>
                  <View style={styles.userRow}>
                    {/* Avatar */}
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.userEmail, { color: isDark ? colors.mutedDark : colors.mutedLight }]} numberOfLines={1}>{item.email}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                          <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>{item.role}</Text>
                        </View>
                        {item.isBlocked && (
                          <View style={styles.blockedBadge}>
                            <Text style={styles.blockedBadgeText}>Blocked</Text>
                          </View>
                        )}
                        <Text style={[styles.joinedText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                          Joined {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Block/Unblock — skip for admins */}
                    {item.role !== 'admin' && (
                      <TouchableOpacity
                        style={[styles.blockBtn, { backgroundColor: item.isBlocked ? colors.success500 : colors.danger500 }]}
                        onPress={() => handleToggleBlock(item)}
                      >
                        <Text style={styles.blockBtnText}>{item.isBlocked ? 'Unblock' : 'Block'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // Search bar
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  clearBtn:    { fontSize: 18 },

  // Role filter
  roleFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
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

  // User card
  blockedCard: { opacity: 0.6 },
  userRow:     { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: { color: colors.white, fontWeight: 'bold', fontSize: 18 },
  userInfo:   { flex: 1, minWidth: 0 },
  userName:   { fontWeight: '600' },
  userEmail:  { fontSize: 11, marginTop: 2 },

  // Badge row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  blockedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(244,63,94,0.1)',
  },
  blockedBadgeText: { fontSize: 11, fontWeight: '600', color: colors.danger500 },
  joinedText:       { fontSize: 11 },

  // Block button
  blockBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexShrink: 0,
  },
  blockBtnText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
});
