/**
 * Product Detail Screen  –  Module 3: Product Management (Buyer)
 * -------------------------------------------------
 * - Fetches full product by ID
 * - Image gallery with scroll
 * - Chat with seller
 * - Place order
 * Styled with inline styles.
 * -------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions, StyleSheet,
} from 'react-native';
import { getProductById } from '../../api/productApi';
import { createOrder } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors } from '../../styles/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, product: initialProduct } = route.params;
  const [product,      setProduct]      = useState(initialProduct || null);
  const [loading,      setLoading]      = useState(!initialProduct);
  const [activeImage,  setActiveImage]  = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (productId) {
      getProductById(productId)
        .then(({ data }) => setProduct(data))
        .catch(() => Alert.alert('Error', 'Could not load product'))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleOrder = async () => {
    setOrderLoading(true);
    try {
      await createOrder(product._id);
      Alert.alert('Order Placed 🎉', 'Your order has been placed. Proceed to payment.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <Screen style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </Screen>
  );

  if (!product) return (
    <Screen style={styles.errorContainer}>
      <Text style={styles.errorIcon}>😕</Text>
      <Text style={[styles.errorTitle, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
        Product not found
      </Text>
      <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.errorLink, { color: isDark ? colors.primary400 : colors.primary600 }]}>
          Go back
        </Text>
      </TouchableOpacity>
    </Screen>
  );

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <Screen safe={false}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── Image gallery ── */}
        {images.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width));
              }}
            >
              {images.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeImage ? styles.dotActive : { backgroundColor: isDark ? colors.borderDark : colors.borderLight }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
        )}

        {/* ── Product info ── */}
        <View style={styles.content}>
          {product.category && (
            <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.primary900 : colors.primary50 }]}>
              <Text style={[styles.categoryText, { color: isDark ? colors.primary300 : colors.primary700 }]}>
                {product.category}
              </Text>
            </View>
          )}

          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
            {product.title}
          </Text>
          <Text style={[styles.price, { color: isDark ? colors.primary400 : colors.primary600 }]}>
            ₹{product.price}
          </Text>

          <Text style={[styles.description, { color: isDark ? colors.mutedDark : colors.textDark }]}>
            {product.description}
          </Text>

          {/* Seller card */}
          <View style={[styles.sellerCard, { backgroundColor: isDark ? colors.subtleDark : colors.subtleLight }]}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {product.seller?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerLabel, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                Seller
              </Text>
              <Text style={[styles.sellerName, { color: isDark ? colors.textOnDark : colors.slate800 }]}>
                {product.seller?.name}
              </Text>
              <Text style={[styles.sellerEmail, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                {product.seller?.email}
              </Text>
            </View>
          </View>

          <Text style={[styles.listedDate, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
            Listed on {new Date(product.createdAt).toDateString()}
          </Text>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            <Button
              title="💬  Chat with Seller"
              onPress={() => navigation.navigate('Chat', {
                userId:       product.seller?._id,
                userName:     product.seller?.name,
                shareProduct: product,
              })}
              variant="outline"
            />
            <Button
              title="Place Order"
              onPress={handleOrder}
              loading={orderLoading}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  errorButton: {
    marginTop: 16,
  },
  errorLink: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  galleryImage: {
    width: width,
    height: 280,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.primary600,
  },
  placeholderImage: {
    width: '100%',
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  description: {
    marginTop: 16,
    lineHeight: 24,
    fontSize: 14,
  },
  sellerCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerAvatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 11,
  },
  sellerName: {
    fontWeight: '600',
  },
  sellerEmail: {
    fontSize: 11,
  },
  listedDate: {
    fontSize: 11,
    marginTop: 12,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
