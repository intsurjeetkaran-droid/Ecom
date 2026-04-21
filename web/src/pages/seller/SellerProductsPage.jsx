import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function SellerProductsPage() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [dialog,     setDialog]     = useState(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    getMyProducts().then(({ data }) => setProducts(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = (item) => {
    setDialog({
      title: 'Delete Product',
      message: `Delete "${item.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: '🗑️',
      onConfirm: async () => {
        setDeletingId(item._id);
        try {
          await deleteProduct(item._id);
          setProducts(p => p.filter(x => x._id !== item._id));
        } catch (err) {
          setDialog({
            title: 'Error',
            message: err.response?.data?.message || 'Could not delete product.',
            confirmLabel: 'OK',
            cancelLabel: null,
            variant: 'danger',
            icon: '⚠️',
            onConfirm: () => {},
          });
        } finally { setDeletingId(null); }
      },
    });
  };

  const counts = products.reduce((a, p) => { a[p.status] = (a[p.status] || 0) + 1; return a; }, {});

  if (loading) return <Loader />;

  return (
    <div style={{ ...pageStyle }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>My Products</h1>
          <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{products.length} total</p>
        </div>
        <Button title="+ Add Product" onClick={() => navigate('/seller/add')} />
      </div>

      {/* Status summary */}
      {products.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: radius.full, padding: '6px 14px' }}>
              <Badge label={status} variant={STATUS_VARIANT[status] || 'muted'} />
              <span style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 14 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState emoji="📦" title="No products yet" subtitle="Start selling by adding your first product" action={() => navigate('/seller/add')} actionLabel="Add Your First Product" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(item => (
            <Card key={item._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <Badge label={item.status} variant={STATUS_VARIANT[item.status] || 'muted'} />
                  </div>
                  <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 18, marginBottom: 4 }}>₹{item.price?.toLocaleString()}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{item.category}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 4, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>
                  {item.status === 'rejected' && (
                    <div style={{ marginTop: 8, backgroundColor: isDark ? 'rgba(244,63,94,0.15)' : '#FEF2F2', border: `1px solid ${isDark ? colors.danger600 : '#FECACA'}`, borderRadius: radius.md, padding: '8px 12px' }}>
                      <p style={{ color: colors.danger600, fontSize: 12 }}>❌ Rejected by admin. Edit and resubmit for review.</p>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button title="Edit" variant="outline" size="sm" onClick={() => navigate('/seller/add', { state: { product: item } })} />
                  <Button title="Delete" variant="danger" size="sm" loading={deletingId === item._id} onClick={() => handleDelete(item)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
