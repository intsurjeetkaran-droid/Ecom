/**
 * Image Utilities  –  Base64 Image Handling (Expo)
 * -------------------------------------------------
 * Uses expo-image-picker (not react-native-image-picker).
 * Converts picked images to base64 data URIs for the backend.
 *
 * Limits (must match backend/utils/imageUtils.js):
 *   Max size per image : 1 MB
 *   Max images         : 5
 *   Allowed types      : JPEG, PNG, WebP
 * -------------------------------------------------
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_IMAGES     = 5;
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];

// ── Request Permission ────────────────────────────
const requestPermission = async () => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to upload images.'
      );
      return false;
    }
  }
  return true;
};

// ── Pick Single Image ─────────────────────────────
/**
 * pickImage(options?)
 * Returns a base64 data URI string, or null if cancelled/error.
 */
export const pickImage = async (options = {}) => {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,          // expo-image-picker returns base64 in result.assets[0].base64
      ...options,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    return assetToBase64(result.assets[0]);
  } catch (err) {
    console.error('[imageUtils] pickImage error:', err.message);
    Alert.alert('Image Error', 'Could not load image. Please try again.');
    return null;
  }
};

// ── Pick Multiple Images ──────────────────────────
/**
 * pickImages(currentCount, maxCount?)
 * Returns array of base64 data URI strings.
 */
export const pickImages = async (currentCount = 0, maxCount = MAX_IMAGES) => {
  const remaining = maxCount - currentCount;
  if (remaining <= 0) {
    Alert.alert('Limit Reached', `You can upload up to ${maxCount} images.`);
    return [];
  }

  const hasPermission = await requestPermission();
  if (!hasPermission) return [];

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) return [];

    const converted = [];
    for (const asset of result.assets) {
      const dataUri = assetToBase64(asset);
      if (dataUri) converted.push(dataUri);
    }
    return converted;
  } catch (err) {
    console.error('[imageUtils] pickImages error:', err.message);
    Alert.alert('Image Error', 'Could not load images. Please try again.');
    return [];
  }
};

// ── Asset → Base64 Data URI ───────────────────────
const assetToBase64 = (asset) => {
  // expo-image-picker: mimeType is in asset.mimeType or derive from uri extension
  const mimeType = asset.mimeType || getMimeFromUri(asset.uri) || 'image/jpeg';

  if (!ALLOWED_TYPES.includes(mimeType)) {
    Alert.alert('Invalid Format', 'Only JPEG, PNG, and WebP images are supported.');
    return null;
  }

  const base64Data = asset.base64;
  if (!base64Data) {
    Alert.alert('Image Error', 'Could not read image data. Please try a different image.');
    return null;
  }

  // Estimate decoded byte size
  const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedBytes > MAX_SIZE_BYTES) {
    const maxMB = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(1);
    Alert.alert('Image Too Large', `Please choose an image smaller than ${maxMB}MB.`);
    return null;
  }

  return `data:${mimeType};base64,${base64Data}`;
};

// ── Derive MIME from URI extension ────────────────
const getMimeFromUri = (uri = '') => {
  const ext = uri.split('.').pop()?.toLowerCase();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  return map[ext] || 'image/jpeg';
};

// ── Client-side Validation ────────────────────────
export const isValidBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^data:(image\/(?:jpeg|png|webp));base64,[A-Za-z0-9+/=]+$/.test(str);
};

export { MAX_SIZE_BYTES, MAX_IMAGES };
