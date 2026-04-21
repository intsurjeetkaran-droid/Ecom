import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Buyer
import HomePage          from './pages/buyer/HomePage';
import ProductDetailPage from './pages/buyer/ProductDetailPage';
import OrdersPage        from './pages/buyer/OrdersPage';

// Seller
import SellerProductsPage from './pages/seller/SellerProductsPage';
import AddProductPage     from './pages/seller/AddProductPage';
import SellerOrdersPage   from './pages/seller/SellerOrdersPage';

// Chat
import ConversationsPage from './pages/chat/ConversationsPage';
import ChatPage          from './pages/chat/ChatPage';

// Orders (shared)
import OrderDetailPage from './pages/orders/OrderDetailPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Payments
import PaymentSetupPage   from './pages/payment/PaymentSetupPage';
import PaymentHistoryPage from './pages/payment/PaymentHistoryPage';
import PaymentDetailsPage from './pages/payment/PaymentDetailsPage';
import PaymentRecordPage  from './pages/payment/PaymentRecordPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminProductsPage  from './pages/admin/AdminProductsPage';
import AdminOrdersPage    from './pages/admin/AdminOrdersPage';
import AdminPaymentsPage  from './pages/admin/AdminPaymentsPage';

function AppRoutes() {
  const { user } = useAuth();

  // Redirect logged-in users away from auth pages
  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* ── Shared (all roles) ── */}
      <Route path="/chat"         element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
      <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/orders/:id"   element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />

      {/* ── Payment (buyer + seller) ── */}
      <Route path="/payments/history"           element={<ProtectedRoute roles={['buyer','seller']}><PaymentHistoryPage /></ProtectedRoute>} />
      <Route path="/payments/details/:sellerId" element={<ProtectedRoute roles={['buyer']}><PaymentDetailsPage /></ProtectedRoute>} />
      <Route path="/payments/record/:orderId"   element={<ProtectedRoute><PaymentRecordPage /></ProtectedRoute>} />

      {/* ── Buyer ── */}
      <Route path="/"       element={<ProtectedRoute roles={['buyer']}><HomePage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['buyer']}><OrdersPage /></ProtectedRoute>} />

      {/* ── Seller ── */}
      <Route path="/seller/products" element={<ProtectedRoute roles={['seller']}><SellerProductsPage /></ProtectedRoute>} />
      <Route path="/seller/add"      element={<ProtectedRoute roles={['seller']}><AddProductPage /></ProtectedRoute>} />
      <Route path="/seller/orders"   element={<ProtectedRoute roles={['seller']}><SellerOrdersPage /></ProtectedRoute>} />
      <Route path="/payments/setup"  element={<ProtectedRoute roles={['seller']}><PaymentSetupPage /></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin"          element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/users"    element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute roles={['admin']}><AdminProductsPage /></ProtectedRoute>} />
      <Route path="/admin/orders"   element={<ProtectedRoute roles={['admin']}><AdminOrdersPage /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPaymentsPage /></ProtectedRoute>} />

      {/* ── Fallback: redirect to role home ── */}
      <Route path="*" element={
        <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller/products' : '/'} replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
