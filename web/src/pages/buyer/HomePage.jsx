import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, pageStyle, pageTitleStyle, pageSubtitleStyle } from '../../styles/theme';
import Loader, { SkeletonCard } from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Vehicles', 'General'];

const CATEGORY_ICONS = { All: '🌐', Electronics: '💻', Clothing: '👕', Furniture: '🪑', Books: '📚', Vehicles: '🚗', General: '📦' };

export default function HomePage() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [error,      setError]      = useState('');
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const timer = useRef(null);

  const fetchProducts = async ({ pageNum = 1, s = search, cat = category } = {}) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 20, ...(s && { search: s }), ...(cat !== 'All' && { category: cat }) };
      const { data } = await getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total || data.products.length);
      setPage(pageNum);
      setError('');
    } catch { setError('Could not load products.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchProducts({ pageNum: 1, s: val }), 400);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    fetchProducts({ pageNum: 1, cat });
  };

  return (
    <div style={{ ...pageStyle }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...pageTitleStyle, color: isDark ? colors.textOnDark : colors.slate800 }}>Marketplace</h1>
        <p style={{ ...pageSubtitleStyle, color: isDark ? colors.mutedDark : colors.mutedLight }}>
          {total > 0 ? `${total} products available` : 'Find what you need'}
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        backgroundColor: isDark ? colors.cardDark : colors.white,
        border: `1.5px solid ${isDark ? colors.borderDark : colors.borderLight}`,
        borderRadius: radius.lg,
        padding: '10px 16px',
        marginBottom: 20, gap: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
        onFocus={e => { e.currentTarget.style.borderColor = colors.primary500; e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary500}20`; }}
        onBlur={e => { e.currentTarget.style.borderColor = isDark ? colors.borderDark : colors.borderLight; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
      >
        <span style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 18 }}>🔍</span>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search products by name, category..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: isDark ? colors.textOnDark : colors.slate800, backgroundColor: 'transparent' }}
        />
        {search && (
          <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 20, lineHeight: 1, padding: 2 }}>✕</button>
        )}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategory(cat)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: radius.full, fontSize: 13, fontWeight: '600', cursor: 'pointer',
            backgroundColor: category === cat ? colors.primary600 : (isDark ? colors.cardDark : colors.white),
            color: category === cat ? colors.white : (isDark ? colors.mutedDark : colors.textDark),
            border: `1.5px solid ${category === cat ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`,
            transition: 'all 0.15s',
            boxShadow: category === cat ? `0 2px 8px ${colors.primary600}30` : 'none',
          }}>
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <EmptyState emoji="⚠️" title="Could not load products" subtitle={error} action={() => fetchProducts()} actionLabel="Retry" />
      ) : products.length === 0 ? (
        <EmptyState emoji="📭" title="No products found" subtitle={search ? `No results for "${search}"` : 'Check back later for new listings'} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {products.map(item => (
              <ProductCard key={item._id} item={item} isDark={isDark} onClick={() => navigate(`/products/${item._id}`)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
              <button onClick={() => fetchProducts({ pageNum: page - 1 })} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: radius.md, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, backgroundColor: isDark ? colors.cardDark : colors.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 14, color: isDark ? colors.textOnDark : colors.slate800 }}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchProducts({ pageNum: p })} style={{
                  width: 38, height: 38, borderRadius: radius.md,
                  border: `1.5px solid ${p === page ? colors.primary600 : (isDark ? colors.borderDark : colors.borderLight)}`,
                  backgroundColor: p === page ? colors.primary600 : (isDark ? colors.cardDark : colors.white),
                  color: p === page ? colors.white : (isDark ? colors.textOnDark : colors.slate800),
                  cursor: 'pointer', fontWeight: '600', fontSize: 14,
                  boxShadow: p === page ? `0 2px 8px ${colors.primary600}30` : 'none',
                }}>{p}</button>
              ))}
              <button onClick={() => fetchProducts({ pageNum: page + 1 })} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: radius.md, border: `1px solid ${isDark ? colors.borderDark : colors.borderLight}`, backgroundColor: isDark ? colors.cardDark : colors.white, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: 14, color: isDark ? colors.textOnDark : colors.slate800 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({ item, isDark, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? colors.cardDark : colors.white,
        border: `1px solid ${hovered ? colors.primary200 : (isDark ? colors.borderDark : colors.borderLight)}`,
        borderRadius: radius.lg, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 8px 24px rgba(13,148,136,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: 180, backgroundColor: isDark ? colors.subtleDark : colors.subtleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📦</div>
        )}
        {item.category && (
          <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.92)', color: colors.primary700, fontSize: 11, fontWeight: '700', padding: '3px 10px', borderRadius: radius.full, backdropFilter: 'blur(4px)' }}>
            {item.category}
          </span>
        )}
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <p style={{ fontWeight: '700', fontSize: 14, color: isDark ? colors.textOnDark : colors.slate800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{item.title}</p>
        <p style={{ color: colors.primary600, fontWeight: '800', fontSize: 18, marginBottom: 6 }}>₹{item.price?.toLocaleString()}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: colors.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', color: colors.primary700 }}>
            {item.seller?.name?.charAt(0).toUpperCase()}
          </div>
          <p style={{ color: isDark ? colors.mutedDark : colors.mutedLight, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.seller?.name}</p>
        </div>
      </div>
    </div>
  );
}
