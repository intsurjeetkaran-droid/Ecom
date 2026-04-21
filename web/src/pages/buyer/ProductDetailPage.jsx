import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../api/productApi';
import { createOrder } from '../../api/orderApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, shadow, pageStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeImg,    setActiveImg]    = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMsg,     setOrderMsg]     = useState({ type: '', text: '' });

  useEffect(() => {
    getProductById(id)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    setOrderLoading(true); setOrderMsg({ type: '', text: '' });
    try {
      await createOrder(product._id);
      setOrderMsg({ type: 'success', text: 'Order placed! Go to My Orders to complete payment.' });
    } catch (err) {
      setOrderMsg({ type: 'error', text: err.response?.data?.message || 'Failed to place order.' });
    } finally { setOrderLoading(false); }
  };

  if (loading) return <Loader />;
  if (!product) return (
    <div style={{ ...pageStyle, textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
      <p style={{ fontSize: 18, fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, marginBottom: 8 }}>Product not found</p>
      <Button title="← Go Back" variant="outline" onClick={() => navigate(-1)} />
    </div>
  );

  const images = product.images?.length ? product.images : [];

  return (
    <div style={{ ...pageStyle, maxWidth: 1000 }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: colors.primary600, cursor: 'pointer', fontSize: 13, fontWeight: '600', marginBottom: 20, padding: '6px 0' }}>
        ← Back to products
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Image gallery */}
        <div>
          <div style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}` }}>
            {images[activeImg]
              ? <img src={images[activeImg]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 72, opacity: 0.4 }}>📦</span>
            }
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: 58, height: 58, borderRadius: radius.md, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === activeImg ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`, transition: 'border-color 0.12s', flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {product.category && (
            <div style={{ marginBottom: 12 }}>
              <Badge label={product.category} variant="primary" />
            </div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: '800', color: isDark ? colors.textOnDark : colors.slate800, marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{product.title}</h1>
          <p style={{ fontSize: 30, fontWeight: '800', color: colors.primary600, marginBottom: 16, letterSpacing: '-0.02em' }}>₹{product.price?.toLocaleString()}</p>
          <p style={{ fontSize: 14, color: isDark ? colors.mutedDark : colors.textDark, lineHeight: 1.75, marginBottom: 20, flex: 1 }}>{product.description}</p>

          {/* Seller card */}
          <Card style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.mutedDark : colors.mutedLight, letterSpacing: '0.06em', marginBottom: 10 }}>SELLER</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary600}, ${colors.primary400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: '700', fontSize: 17, flexShrink: 0 }}>
                {product.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14 }}>{product.seller?.name}</p>
                <p style={{ fontSize: 12, color: isDark ? colors.mutedDark : colors.mutedLight, marginTop: 2 }}>{product.seller?.email}</p>
              </div>
            </div>
          </Card>

          {/* Listed date */}
          <p style={{ fontSize: 12, color: isDark ? colors.mutedDark : colors.mutedLight, marginBottom: 16 }}>
            Listed on {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* Feedback */}
          {orderMsg.text && (
            <div style={{ padding: '11px 14px', borderRadius: radius.md, backgroundColor: orderMsg.type === 'success' ? (isDark ? 'rgba(16,185,129,0.15)' : '#F0FDF4') : (isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2'), color: orderMsg.type === 'success' ? colors.success600 : colors.danger600, fontSize: 13, marginBottom: 14, border: `1px solid ${orderMsg.type === 'success' ? (isDark ? colors.success600 : '#BBF7D0') : (isDark ? colors.danger600 : '#FECACA')}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{orderMsg.type === 'success' ? '✅' : '⚠️'}</span> {orderMsg.text}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button title="💬  Chat with Seller" variant="outline" onClick={() => navigate('/chat', { state: { userId: product.seller?._id, userName: product.seller?.name } })} fullWidth />
            <Button title="Place Order" onClick={handleOrder} loading={orderLoading} fullWidth size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
