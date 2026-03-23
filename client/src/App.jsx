import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Context Providers
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

// Layouts
import MainLayout from '@/components/layout/MainLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Public Pages
import Home from '@/pages/public/Home'
import Products from '@/pages/public/Products'
import ProductDetail from '@/pages/public/ProductDetail'

// Auth Pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import OAuthCallback from '@/pages/auth/OAuthCallback'

// Buyer Pages
import Cart from '@/pages/buyer/Cart'
import Checkout from '@/pages/buyer/Checkout'
import MyOrders from '@/pages/buyer/MyOrders'
import BuyerProfile from '@/pages/buyer/Profile'
import BuyerSettings from '@/pages/buyer/Settings'
import FarmMap from '@/pages/buyer/FarmMap'

// Farmer Pages
import FarmerDashboard from '@/pages/farmer/Dashboard'
import FarmerProducts from '@/pages/farmer/Products'
import AddProduct from '@/pages/farmer/AddProduct'
import FarmerOrdersPage from '@/pages/farmer/Orders'
import MarketPrices from '@/pages/farmer/MarketPrices'
import FarmerProfile from '@/pages/farmer/Profile'
import FarmerSettings from '@/pages/farmer/Settings'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminProducts from '@/pages/admin/Products'
import AdminAPMC from '@/pages/admin/APMC'
import AdminSettings from '@/pages/admin/Settings'
import AdminOrders from '@/pages/admin/Orders'

// Components
import PrivateRoute from '@/components/shared/PrivateRoute'
import Loading from '@/components/shared/Loading'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {/* Apply dark theme globally */}
          <div className="theme min-h-screen">
            <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                {/* <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} /> */}
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />

              {/* Buyer Routes */}
              <Route element={<MainLayout />}>
                <Route
                  path="/cart"
                  element={
                    <PrivateRoute allowedRoles={['buyer']}>
                      <Cart />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute allowedRoles={['buyer']}>
                      <Checkout />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute allowedRoles={['buyer']}>
                      <MyOrders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute allowedRoles={['buyer']}>
                      <BuyerProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute allowedRoles={['buyer']}>
                      <BuyerSettings />
                    </PrivateRoute>
                  }
                />
              <Route
                path="/farms"
                element={
                  <PrivateRoute allowedRoles={['buyer']}>
                    <FarmMap />
                  </PrivateRoute>
                }
              />
            </Route>

              {/* Farmer Routes */}
              <Route
                path="/farmer"
                element={
                  <PrivateRoute allowedRoles={['farmer']}>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FarmerDashboard />} />
                <Route path="products" element={<FarmerProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="orders" element={<FarmerOrdersPage />} />
                {/* EditProduct and FarmerAnalytics routes removed (files not present) */}
                <Route path="market-prices" element={<MarketPrices />} />
                <Route path="profile" element={<FarmerProfile />} />
                <Route path="settings" element={<FarmerSettings />} />
              </Route>


              {/* Admin Routes */}
              <Route
                 path="/admin"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="apmc" element={<AdminAPMC />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Router>
          </div>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
          />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App