/**
 * Home Screen  –  Module 3: Product Management (Buyer)
 * -------------------------------------------------
 * - Paginated approved product grid
 * - Search by keyword
 * - Filter by category
 * - Pull-to-refresh
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, TextInput,
  ScrollView, StyleSheet,
} from 'react-native';
import { getProducts } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import ThemeToggle from '../../components/ThemeToggle';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { colors } from '../../styles/theme';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Vehicles', 'General'];

export default function HomeScreen({ navigation }) {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('All');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [error,       setError]       = useState('');
  const { isDark } = useTheme();

  const searchTimer = useRef(null);

  // ── Fetch products ──
  const fetchProducts = useCallback(async ({ pageNum = 1, append = false, searchVal, categoryVal } = {}) => {
    try {
      const params = {
        page:  pageNum,
        limit: 20,
        ...(searchVal   && { search: searchVal }),
        ...(categoryVal && categoryVal !== 'All' && { category: categoryVal }),
      };
      const { data } = await getProducts(params);
      setProducts((prev) => append ? [...prev, ...data.products] : data.products);
      setTotalPages(data.pages);
      setPage(pageNum);
      setError('');
    } catch (err) {
      console.error('[HomeScreen] Failed to load products:', err.message);
      if (!append) setError(err.friendlyMessage || 'Could not load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({ searchVal: search, categoryVal: category });
  }, []);

  // ── Debounced search ──
  const handleSearch = (text) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      fetchProducts({ pageNum: 1, searchVal: text, categoryVal: category });
    }, 400);
  };

  // ── Category filter ──
  const handleCategory = (cat) => {
    setCategory(cat);
    setLoading(true);
    fetchProducts({ pageNum: 1, searchVal: search, categoryVal: cat });
  };

  // ── Pull-to-refresh ──
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts({ pageNum: 1, searchVal: search, categoryVal: category });
  };

  // ── Infinite scroll ──
  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchProducts({ pageNum: page + 1, append: true, searchVal: search, categoryVal: category });
  };

  return (
    <Screen safe={false}>
      {/* ── Header ── */}
      <View style={[
        styles.header,
        {
          backgroundColor: isDark ? colors.cardDark : colors.cardLight,
          borderBottomColor: isDark ? colors.borderDark : colors.borderLight,
        }
      ]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
              Marketplace
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
              Find what you need
            </Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
          <Text style={[styles.searchIcon, { color: colors.mutedLight }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textOnDark : colors.slate800 }]}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedLight}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={[styles.searchClear, { color: colors.mutedLight }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategory(cat)}
              style={[
                styles.categoryChip,
                category === cat
                  ? { backgroundColor: colors.primary600, borderColor: colors.primary600 }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: isDark ? colors.borderDark : colors.borderLight,
                    }
              ]}
            >
              <Text style={[
                styles.categoryText,
                { color: category === cat ? colors.white : (isDark ? colors.mutedDark : colors.mutedLight) }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Product grid ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary600} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary600} />
            </View>
          ) : null}
          ListEmptyComponent={
            error ? (
              <ErrorMessage
                message={error}
                onRetry={() => { setLoading(true); fetchProducts({ searchVal: search, categoryVal: category }); }}
              />
            ) : (
              <EmptyState
                emoji="📭"
                title="No products found"
                subtitle={search ? `No results for "${search}"` : 'Check back later for new listings'}
              />
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.productCard,
                {
                  backgroundColor: isDark ? colors.cardDark : colors.cardLight,
                  borderColor: isDark ? colors.borderDark : colors.borderLight,
                }
              ]}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              activeOpacity={0.85}
            >
              {item.images?.[0] ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImagePlaceholder, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
                  <Text style={styles.productImageIcon}>📦</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.productPrice, { color: isDark ? colors.primary400 : colors.primary600 }]}>
                  ₹{item.price}
                </Text>
                <Text style={[styles.productSeller, { color: isDark ? colors.mutedDark : colors.mutedLight }]} numberOfLines={1}>
                  by {item.seller?.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 11,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  searchClear: {
    fontSize: 18,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnWrapper: {
    gap: 12,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  productCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  productImage: {
    width: '100%',
    height: 144,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImageIcon: {
    fontSize: 36,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  productPrice: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  productSeller: {
    fontSize: 11,
    marginTop: 2,
  },
});
