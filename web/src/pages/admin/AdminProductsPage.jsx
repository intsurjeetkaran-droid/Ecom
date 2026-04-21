import { useState, useEffect } from 'react';
import { getAllProducts, updateProductStatus } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];
const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [actionId,   setActionId]   = useState(null);
  const [dialog,     setDialog]     = useState(null);
  const { isDark } = useTheme();

  const fetchProducts = (f = filter) => {
    setLoading(true);
    const params = { page: 1, limit: 50, ...(f !== 'all' && { status: f }) };
    getAllProducts(params).then(({ data }) => setProducts(data.products)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleFilter = f => { setFilter(f); fetchProducts(f); };

  const handleStatus = (id, status, title) => {
    const isApprove = status === 'approved';
    setDialog({
      title: isApprove ? 'Approve Product' : 'Reject Product',
      message: `${isApprove ? 'Approve' : 'Reject'} "${title}"? ${isApprove ? 'It will go live on the marketplace.' : 'The seller will be notified.'}`,
      confirmLabel: isApprove ? 'Approve' : 'Reject',
      variant: isApprove ? 'success' : 'danger',
      icon: isApprove ? '✅' : '❌',
      onConfirm: async () => {
        setActionId(id);
        try {
          const { data } = await updateProductStatus(id, status);
          setProducts(p => p.map(x => x._id === id ? { ...x, status: data.status } : x));
        } catch (err) {
          setDialog({
            title: 'Error',
            message: err.response?.data?.message || `Failed to ${isApprove ? 'approve' : 'reject'} product.`,
            confirmLabel: 'OK',
            cancelLabel: null,
            variant: 'danger',
            icon: '⚠️',
            onConfirm: () => {},
          });
        } finally { setActionId(null); }
      },
    });
  };

  return (
    <div style={{ ...pageStyle }}>
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
      <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>All Products</h1>
      <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>{products.length} products</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilter(f)} style={{ padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer', backgroundColor: filter === f ? colors.primary600 : (isDark ? colors.cardDark : colors.white), color: filter === f ? colors.white : (isDark ? colors.mutedDark : colors.textDark), border: `1.5px solid ${filter === f ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`, transition: 'all 0.12s', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : products.length === 0 ? (
        <EmptyState emoji="📦" title="No products found" subtitle={`No ${filter !== 'all' ? filter : ''} products`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map(item => (
            <div key={item._id} style={{ backgroundColor: isDark ? colors.cardDark : colors.white, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <p style={{ fontWeight: '700', color: isDark ? colors.textOnDark : colors.slate800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <Badge label={item.status} variant={STATUS_VARIANT[item.status] || 'muted'} />
                  </div>
                  <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 18, marginBottom: 4 }}>₹{item.price?.toLocaleString()}</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 13 }}>{item.category} · Seller: {item.seller?.name} ({item.seller?.email})</p>
                  <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, marginTop: 2 }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {item.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Button title="✓ Approve" variant="success" size="sm" loading={actionId === item._id} onClick={() => handleStatus(item._id, 'approved', item.title)} />
                    <Button title="✕ Reject"  variant="danger"  size="sm" loading={actionId === item._id} onClick={() => handleStatus(item._id, 'rejected', item.title)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
