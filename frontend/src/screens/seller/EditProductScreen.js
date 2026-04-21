/**
 * Edit Product Screen  –  Module 3: Product Management (Seller)
 * Styled with inline styles.
 */

import React, { useState } from 'react';
import {
  View, Text, Alert, ScrollView, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { updateProduct } from '../../api/productApi';
import { pickImages } from '../../utils/imageUtils';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../styles/theme';

const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Vehicles', 'Other'];
const MAX_IMAGES  = 5;

export default function EditProductScreen({ route, navigation }) {
  const { product } = route.params;
  const [title,       setTitle]       = useState(product.title       || '');
  const [description, setDescription] = useState(product.description || '');
  const [price,       setPrice]       = useState(String(product.price || ''));
  const [category,    setCategory]    = useState(product.category    || 'General');
  const [images,      setImages]      = useState(product.images      || []);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [pickingImg,  setPickingImg]  = useState(false);
  const { isDark } = useTheme();

  const wasApproved = product.status === 'approved';

  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) { Alert.alert('Limit Reached', `You can upload up to ${MAX_IMAGES} images.`); return; }
    setPickingImg(true);
    const picked = await pickImages(images.length, MAX_IMAGES);
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    setPickingImg(false);
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e = {};
    if (!title.trim())                               e.title       = 'Title is required';
    if (!description.trim())                         e.description = 'Description is required';
    if (!price || isNaN(price) || Number(price) <= 0) e.price      = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (wasApproved) {
      Alert.alert('Re-approval Required', 'Editing an approved product will send it back for admin review. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: submitUpdate },
      ]);
    } else {
      submitUpdate();
    }
  };

  const submitUpdate = async () => {
    setLoading(true);
    try {
      await updateProduct(product._id, { title: title.trim(), description: description.trim(), price: Number(price), category, images });
      Alert.alert('Updated ✅', wasApproved ? 'Product updated and sent for re-approval.' : 'Product updated successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.slate800 }]}>Edit Product</Text>

          {wasApproved && (
            <View style={[styles.notice, { backgroundColor: isDark ? 'rgba(120,53,15,0.3)' : colors.accent50, borderColor: isDark ? colors.accent800 : colors.accent200 }]}>
              <Text style={styles.noticeIcon}>⚠️</Text>
              <Text style={[styles.noticeText, { color: isDark ? colors.accent300 : colors.accent700 }]}>
                This product is currently approved. Saving changes will send it back for admin review.
              </Text>
            </View>
          )}

          <Card>
            <Input label="Title" placeholder="Product name" value={title} onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }} error={errors.title} editable={!loading} />
            <Input label="Description" placeholder="Describe your product" value={description} onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }} error={errors.description} editable={!loading} multiline numberOfLines={4} />
            <Input label="Price (₹)" placeholder="0.00" value={price} onChangeText={(t) => { setPrice(t); setErrors((e) => ({ ...e, price: '' })); }} error={errors.price} editable={!loading} keyboardType="numeric" />

            <Text style={[styles.label, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryChip, category === cat ? { backgroundColor: colors.primary600, borderColor: colors.primary600 } : { backgroundColor: 'transparent', borderColor: isDark ? colors.borderDark : colors.borderLight }]}
                >
                  <Text style={[styles.categoryChipText, { color: category === cat ? colors.white : (isDark ? colors.mutedDark : colors.mutedLight) }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          <View style={styles.saveButton}>
            <Button title="Save Changes" onPress={handleSave} loading={loading} />
          </View>

          <Card>
            <Text style={[styles.label, { color: isDark ? colors.textOnDark : colors.slate800 }]}>Product Images ({images.length}/{MAX_IMAGES})</Text>
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {images.map((uri, i) => (
                  <View key={i} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[styles.imagePicker, { borderColor: isDark ? colors.borderDark : colors.borderLight }]}
              onPress={handlePickImages}
              disabled={loading || pickingImg || images.length >= MAX_IMAGES}
            >
              <Text style={styles.imagePickerIcon}>{pickingImg ? '⏳' : '📷'}</Text>
              <Text style={[styles.imagePickerText, { color: isDark ? colors.mutedDark : colors.mutedLight }]}>
                {images.length >= MAX_IMAGES ? 'Maximum 5 images' : 'Add more images'}
              </Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  noticeIcon: { fontSize: 18, marginRight: 8 },
  noticeText: { fontSize: 14, flex: 1, lineHeight: 20 },
  categoryScroll: { marginBottom: 8, marginHorizontal: -4 },
  categoryChip: { marginHorizontal: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  categoryChipText: { fontSize: 11, fontWeight: '600' },
  saveButton: { marginVertical: 8 },
  imageScroll: { marginBottom: 12, marginHorizontal: -4 },
  imageWrapper: { marginHorizontal: 4, position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.danger500, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
  imagePicker: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  imagePickerIcon: { fontSize: 20, marginBottom: 4 },
  imagePickerText: { fontSize: 14 },
  bottomSpacer: { height: 32 },
});
