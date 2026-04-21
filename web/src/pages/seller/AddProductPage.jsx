import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProduct, updateProduct } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle } from '../../styles/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Vehicles', 'Other'];
const MAX_IMAGES  = 5;
const MAX_BYTES   = 1048576; // 1MB

// Convert File → base64 data URI
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function AddProductPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useTheme();
  const existing  = location.state?.product;
  const isEdit    = !!existing;

  const [title,       setTitle]       = useState(existing?.title       || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price,       setPrice]       = useState(existing?.price?.toString() || '');
  const [category,    setCategory]    = useState(existing?.category    || 'General');
  const [images,      setImages]      = useState(existing?.images      || []); // base64 data URIs
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [picking,     setPicking]     = useState(false);
  const [imgError,    setImgError]    = useState('');
  const [msg,         setMsg]         = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // ── Image picker ──
  const handlePickImages = () => {
    if (images.length >= MAX_IMAGES) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPicking(true); setImgError('');

    const results = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) { setImgError('Only image files are allowed.'); continue; }
      if (file.size > MAX_BYTES) { setImgError(`"${file.name}" exceeds 1MB limit.`); continue; }
      try {
        const b64 = await fileToBase64(file);
        results.push(b64);
      } catch { setImgError('Failed to read one or more images.'); }
    }

    setImages(prev => [...prev, ...results].slice(0, MAX_IMAGES));
    setPicking(false);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!title.trim())                               e.title       = 'Title is required';
    if (!description.trim())                         e.description = 'Description is required';
    if (!price || isNaN(price) || Number(price) < 1) e.price       = 'Price must be at least ₹1';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        images, // base64 data URIs
      };
      if (isEdit) {
        await updateProduct(existing._id, payload);
        setMsg({ type: 'success', text: 'Product updated! It will be reviewed by admin.' });
      } else {
        await createProduct(payload);
        setMsg({ type: 'success', text: 'Product submitted for approval!' });
        setTimeout(() => navigate('/seller/products'), 1500);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save product.' });
    } finally { setLoading(false); }
  };

  // ── Theme-aware colors ──
  const bg       = isDark ? colors.bgDark    : colors.bgLight;
  const cardBg   = isDark ? colors.cardDark  : colors.white;
  const border   = isDark ? colors.borderDark: colors.borderLight;
  const textMain = isDark ? colors.textOnDark: colors.slate800;
  const textMuted= isDark ? colors.mutedDark : colors.mutedLight;
  const subtle   = isDark ? colors.subtleDark: colors.subtleLight;

  return (
    <div style={{ ...pageStyle, maxWidth: 720 }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Back */}
      <button onClick={() => navigate('/seller/products')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: colors.primary600, cursor: 'pointer', fontSize: 13, fontWeight: '600', marginBottom: 20, padding: '6px 0' }}>
        ← Back to Products
      </button>

      <h1 style={{ ...pageTitleStyle, color: textMain, marginBottom: 4 }}>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>
      <p style={{ color: textMuted, fontSize: 13, marginBottom: 24 }}>
        {isEdit ? 'Editing will reset the product to pending review.' : 'Your product will be reviewed by admin before going live.'}
      </p>

      {/* Feedback */}
      {msg.text && (
        <div style={{ padding: '11px 14px', borderRadius: radius.md, backgroundColor: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2', color: msg.type === 'success' ? colors.success600 : colors.danger600, fontSize: 13, marginBottom: 16, border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
        </div>
      )}

      {/* ── Product Details ── */}
      <Card style={{ backgroundColor: cardBg, borderColor: border }}>
        <Input
          label="Product Title"
          placeholder="e.g. iPhone 12 - 64GB"
          value={title}
          onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
          error={errors.title}
        />
        <Input
          label="Description"
          placeholder="Describe your product in detail..."
          value={description}
          onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
          error={errors.description}
          rows={4}
        />
        <Input
          label="Price (₹)"
          type="number"
          placeholder="0"
          value={price}
          onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })); }}
          error={errors.price}
          prefix="₹"
        />

        {/* Category */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: textMuted, marginBottom: 8 }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer',
                backgroundColor: category === cat ? colors.primary600 : 'transparent',
                color: category === cat ? colors.white : textMuted,
                border: `1.5px solid ${category === cat ? colors.primary600 : border}`,
                transition: 'all 0.12s',
              }}>{cat}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Product Images ── */}
      <Card style={{ backgroundColor: cardBg, borderColor: border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ fontWeight: '700', color: textMain, fontSize: 15 }}>Product Images</p>
            <p style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>{images.length}/{MAX_IMAGES} images · JPEG, PNG, WebP · Max 1MB each</p>
          </div>
          {images.length > 0 && images.length < MAX_IMAGES && (
            <button onClick={handlePickImages} style={{ background: 'none', border: `1.5px solid ${colors.primary600}`, color: colors.primary600, borderRadius: radius.md, padding: '6px 14px', fontSize: 13, fontWeight: '600', cursor: 'pointer' }}>
              + Add More
            </button>
          )}
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {images.map((uri, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={uri}
                  alt={`Product ${i + 1}`}
                  style={{ width: 90, height: 90, borderRadius: radius.md, objectFit: 'cover', border: `1px solid ${border}`, display: 'block' }}
                />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 22, height: 22, borderRadius: '50%',
                    backgroundColor: colors.danger500, border: `2px solid ${cardBg}`,
                    color: colors.white, fontSize: 12, fontWeight: 'bold',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        {images.length < MAX_IMAGES ? (
          <div
            onClick={handlePickImages}
            style={{
              border: `2px dashed ${picking ? colors.primary500 : border}`,
              borderRadius: radius.lg,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: picking ? 'wait' : 'pointer',
              backgroundColor: picking ? (isDark ? 'rgba(13,148,136,0.08)' : colors.primary50) : subtle,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary500; e.currentTarget.style.backgroundColor = isDark ? 'rgba(13,148,136,0.08)' : colors.primary50; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.backgroundColor = subtle; }}
          >
            <p style={{ fontSize: 32, marginBottom: 8 }}>{picking ? '⏳' : '📷'}</p>
            <p style={{ fontWeight: '600', color: textMain, fontSize: 14, marginBottom: 4 }}>
              {picking ? 'Processing images...' : 'Click to upload images'}
            </p>
            <p style={{ color: textMuted, fontSize: 12 }}>
              {images.length >= MAX_IMAGES ? `Maximum ${MAX_IMAGES} images reached` : `Up to ${MAX_IMAGES - images.length} more image${MAX_IMAGES - images.length !== 1 ? 's' : ''} · JPEG, PNG, WebP · Max 1MB each`}
            </p>
          </div>
        ) : (
          <div style={{ padding: '14px 16px', backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4', borderRadius: radius.md, border: `1px solid ${isDark ? colors.success600 : '#BBF7D0'}`, textAlign: 'center' }}>
            <p style={{ color: colors.success600, fontSize: 13, fontWeight: '600' }}>✅ Maximum {MAX_IMAGES} images uploaded</p>
          </div>
        )}

        {imgError && (
          <p style={{ color: colors.danger500, fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠ {imgError}
          </p>
        )}
      </Card>

      {/* Notice */}
      <div style={{ padding: '12px 16px', backgroundColor: isDark ? 'rgba(120,53,15,0.25)' : colors.accent50, borderRadius: radius.md, border: `1px solid ${isDark ? colors.accent800 : '#FDE68A'}`, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: 13, color: isDark ? colors.accent300 : colors.accent700, lineHeight: 1.6 }}>
          All products require admin approval before they appear in the marketplace. You'll see the status in My Products.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button title={isEdit ? 'Save Changes' : 'Submit for Approval'} onClick={handleSubmit} loading={loading} fullWidth size="lg" />
        <Button title="Cancel" variant="subtle" onClick={() => navigate('/seller/products')} />
      </div>
    </div>
  );
}
