/**
 * Image Utilities  –  Base64 Image Handling
 * -------------------------------------------------
 * Centralised validation and processing for all
 * base64 image strings received from the frontend.
 *
 * Supported formats:  image/jpeg, image/png, image/webp
 * Max size per image: 1 MB  (configurable via MAX_IMAGE_BYTES)
 * Max images (batch): 5     (configurable via MAX_IMAGES)
 * -------------------------------------------------
 */

// ── Configuration ─────────────────────────────────
const MAX_IMAGE_BYTES = parseInt(process.env.MAX_IMAGE_BYTES) || 1 * 1024 * 1024; // 1 MB
const MAX_IMAGES      = parseInt(process.env.MAX_IMAGES)      || 5;

// Allowed MIME types embedded in the data URI prefix
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Regex: data:<mime>;base64,<data>
const BASE64_REGEX = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

// ── Single Image Validation ────────────────────────
/**
 * validateBase64Image(str)
 *
 * Returns { valid: true, mimeType, data } on success.
 * Returns { valid: false, error: string }  on failure.
 *
 * Checks:
 *   1. Is a non-empty string
 *   2. Matches data URI format
 *   3. MIME type is allowed
 *   4. Decoded byte size ≤ MAX_IMAGE_BYTES
 */
const validateBase64Image = (str) => {
  if (!str || typeof str !== 'string') {
    return { valid: false, error: 'Image must be a non-empty string' };
  }

  const match = str.match(BASE64_REGEX);
  if (!match) {
    return {
      valid: false,
      error: 'Invalid image format. Only JPEG, PNG, and WebP are supported.',
    };
  }

  const mimeType  = match[1];
  const base64Data = match[2];

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image type: ${mimeType}. Allowed: JPEG, PNG, WebP.`,
    };
  }

  // Estimate decoded byte size: base64 encodes 3 bytes as 4 chars
  const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedBytes > MAX_IMAGE_BYTES) {
    const maxMB = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image too large. Maximum size is ${maxMB}MB per image.`,
    };
  }

  return { valid: true, mimeType, data: base64Data };
};

// ── Batch Image Validation ─────────────────────────
/**
 * validateBase64Images(arr)
 *
 * Validates an array of base64 strings.
 * Returns { valid: true, images: [...] } on success.
 * Returns { valid: false, error: string } on first failure.
 *
 * @param {string[]} arr
 * @param {number}   maxCount  — override MAX_IMAGES if needed
 */
const validateBase64Images = (arr, maxCount = MAX_IMAGES) => {
  if (!Array.isArray(arr)) {
    return { valid: false, error: 'Images must be an array' };
  }
  if (arr.length === 0) {
    return { valid: true, images: [] }; // empty is allowed
  }
  if (arr.length > maxCount) {
    return { valid: false, error: `Too many images. Maximum is ${maxCount}.` };
  }

  const validated = [];
  for (let i = 0; i < arr.length; i++) {
    const result = validateBase64Image(arr[i]);
    if (!result.valid) {
      return { valid: false, error: `Image ${i + 1}: ${result.error}` };
    }
    validated.push(arr[i]); // store the full data URI as-is
  }

  return { valid: true, images: validated };
};

// ── Strip Metadata (optional) ──────────────────────
/**
 * stripBase64Metadata(str)
 *
 * Returns just the raw base64 data without the data URI prefix.
 * Useful if you want to store only the raw data and reconstruct
 * the URI on the frontend.
 *
 * NOTE: We store the full data URI (with prefix) so the frontend
 * can use it directly as `source={{ uri: image }}` without any
 * reconstruction. This function is provided for reference only.
 */
const stripBase64Metadata = (str) => {
  const match = str.match(BASE64_REGEX);
  return match ? match[2] : str;
};

module.exports = {
  validateBase64Image,
  validateBase64Images,
  stripBase64Metadata,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
};
