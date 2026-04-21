/**
 * App Navigator  –  All Modules Complete
 * -------------------------------------------------
 * Role-based navigation:
 *   - Unauthenticated → Auth stack (Login / Register)
 *   - buyer           → Buyer tabs  (Home, Messages, Orders, Profile)
 *   - seller          → Seller tabs (Products, Messages, Orders, Profile)
 *   - admin           → Admin tabs  (Dashboard, Products, Users, Orders, Payments)
 * -------------------------------------------------
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// ── Auth ──
import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// ── Shared ──
import ProfileScreen      from '../screens/shared/ProfileScreen';
import EditProfileScreen  from '../screens/shared/EditProfileScreen';
import BecomeSellerScreen from '../screens/shared/BecomeSellerScreen';

// ── Buyer ──
import HomeScreen          from '../screens/buyer/HomeScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import OrdersScreen        from '../screens/buyer/OrdersScreen';
// ── Seller ──
import SellerProductsScreen from '../screens/seller/SellerProductsScreen';
import AddProductScreen     from '../screens/seller/AddProductScreen';
import EditProductScreen    from '../screens/seller/EditProductScreen';
import SellerOrdersScreen   from '../screens/seller/SellerOrdersScreen';

// ── Orders (shared detail screen) ──
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

// ── Payment (Module 6) ──
import PaymentDetailsScreen      from '../screens/payment/PaymentDetailsScreen';
import PaymentDetailScreen       from '../screens/payment/PaymentDetailScreen';
import PaymentHistoryScreen      from '../screens/payment/PaymentHistoryScreen';
import SellerPaymentSetupScreen  from '../screens/payment/SellerPaymentSetupScreen';
import AdminPaymentsScreen       from '../screens/admin/AdminPaymentsScreen';

// ── Chat (Module 4) — shared by buyer & seller ──
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen          from '../screens/chat/ChatScreen';

// ── Admin ──
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProductsScreen  from '../screens/admin/AdminProductsScreen';
import AdminUsersScreen     from '../screens/admin/AdminUsersScreen';
import AdminOrdersScreen    from '../screens/admin/AdminOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Simple tab icon helper ──
const TabIcon = ({ emoji, label, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  </View>
);

// ─── Buyer Tab Navigator ──────────────────────────
function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1 },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}          options={{ tabBarIcon: (p) => <TabIcon emoji="🏠" {...p} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Messages" component={ConversationsScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="💬" {...p} />, tabBarLabel: 'Messages' }} />
      <Tab.Screen name="Orders"   component={OrdersScreen}        options={{ tabBarIcon: (p) => <TabIcon emoji="🛒" {...p} />, tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}       options={{ tabBarIcon: (p) => <TabIcon emoji="👤" {...p} />, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Seller Tab Navigator ─────────────────────────
function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1 },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="My Products" component={SellerProductsScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📦" {...p} />, tabBarLabel: 'Products' }} />
      <Tab.Screen name="Messages"    component={ConversationsScreen}  options={{ tabBarIcon: (p) => <TabIcon emoji="💬" {...p} />, tabBarLabel: 'Messages' }} />
      <Tab.Screen name="Orders"      component={SellerOrdersScreen}   options={{ tabBarIcon: (p) => <TabIcon emoji="🛒" {...p} />, tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Profile"     component={ProfileScreen}        options={{ tabBarIcon: (p) => <TabIcon emoji="👤" {...p} />, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Admin Tab Navigator ──────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1 },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📊" {...p} />, tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Products"  component={AdminProductsScreen}  options={{ tabBarIcon: (p) => <TabIcon emoji="📦" {...p} />, tabBarLabel: 'Products' }} />
      <Tab.Screen name="Users"     component={AdminUsersScreen}     options={{ tabBarIcon: (p) => <TabIcon emoji="👥" {...p} />, tabBarLabel: 'Users' }} />
      <Tab.Screen name="Orders"    component={AdminOrdersScreen}    options={{ tabBarIcon: (p) => <TabIcon emoji="🛒" {...p} />, tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Payments"  component={AdminPaymentsScreen}  options={{ tabBarIcon: (p) => <TabIcon emoji="💳" {...p} />, tabBarLabel: 'Payments' }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* ── Unauthenticated ── */}
        {!user ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>

        /* ── Admin ── */
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminMain" component={AdminTabs} />
          </>

        /* ── Seller ── */
        ) : user.role === 'seller' ? (
          <>
            <Stack.Screen name="SellerMain"    component={SellerTabs} />
            <Stack.Screen name="Chat"          component={ChatScreen}               options={{ headerShown: true }} />
            <Stack.Screen name="AddProduct"    component={AddProductScreen}         options={{ headerShown: true, title: 'Add Product' }} />
            <Stack.Screen name="EditProduct"   component={EditProductScreen}        options={{ headerShown: true, title: 'Edit Product' }} />
            <Stack.Screen name="EditProfile"   component={EditProfileScreen}        options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="OrderDetail"   component={OrderDetailScreen}        options={{ headerShown: true, title: 'Order Detail' }} />
            <Stack.Screen name="PaymentSetup"  component={SellerPaymentSetupScreen} options={{ headerShown: true, title: 'Payment Setup' }} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen}    options={{ headerShown: true, title: 'Payment History' }} />
            <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen}      options={{ headerShown: true, title: 'Payment Record' }} />
          </>

        /* ── Buyer (default) ── */
        ) : (
          <>
            <Stack.Screen name="BuyerMain"       component={BuyerTabs} />
            <Stack.Screen name="Chat"            component={ChatScreen}          options={{ headerShown: true }} />
            <Stack.Screen name="ProductDetail"   component={ProductDetailScreen} options={{ headerShown: true, title: 'Product' }} />
            <Stack.Screen name="EditProfile"     component={EditProfileScreen}   options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="BecomeSeller"    component={BecomeSellerScreen}  options={{ headerShown: true, title: 'Become a Seller' }} />
            <Stack.Screen name="OrderDetail"     component={OrderDetailScreen}   options={{ headerShown: true, title: 'Order Detail' }} />
            <Stack.Screen name="PaymentDetails"  component={PaymentDetailsScreen} options={{ headerShown: true, title: 'Payment Details' }} />
            <Stack.Screen name="PaymentDetail"   component={PaymentDetailScreen}  options={{ headerShown: true, title: 'Payment Record' }} />
            <Stack.Screen name="PaymentHistory"  component={PaymentHistoryScreen} options={{ headerShown: true, title: 'Payment History' }} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
