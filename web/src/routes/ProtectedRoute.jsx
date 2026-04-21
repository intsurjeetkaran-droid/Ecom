import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

// These routes manage their own scroll (full-height layouts)
const FULL_HEIGHT_ROUTES = ['/chat/'];

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller/products' : '/';
    return <Navigate to={home} replace />;
  }

  // ChatPage (/chat/:userId) manages its own scroll — no wrapper
  const isFullHeight = FULL_HEIGHT_ROUTES.some(r => pathname.startsWith(r));

  return (
    <MainLayout>
      {isFullHeight ? (
        // Full height — no scroll wrapper, page fills the container
        children
      ) : (
        // Normal pages — scrollable content area
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      )}
    </MainLayout>
  );
}
