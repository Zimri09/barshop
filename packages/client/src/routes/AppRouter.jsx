import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import AdminOrders from '../pages/AdminOrders'
import AdminUsers from '../pages/AdminUsers'
import StaffDashboard from '../pages/StaffDashboard'
import StaffOrders from '../pages/StaffOrders'
import StaffStock from '../pages/StaffStock'
import CustomerPortal from '../pages/CustomerPortal'
import Home from '../pages/Home'
import AdminProducts from '../pages/AdminProducts'
import Login from '../pages/Login'
import Welcome from '../pages/Welcome'
import CustomerBrowse from '../pages/CustomerBrowse'
import ProductPage from '../pages/ProductPage'
import CartPage from '../pages/CartPage'
import OrdersPage from '../pages/OrdersPage'
import Profile from '../pages/Profile'
import Favorites from '../pages/Favorites'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />

            {/* Staff */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/orders" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffOrders /></ProtectedRoute>} />
            <Route path="/staff/stock" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffStock /></ProtectedRoute>} />

            {/* Welcome */}
            <Route path="/welcome" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}><Welcome /></ProtectedRoute>} />

            {/* Customer */}
            <Route path="/shop" element={<Navigate to="/customer/browse" replace />} />
            <Route path="/customer" element={<CustomerPortal />} />
            <Route path="/customer/browse" element={<CustomerBrowse />} />
            <Route path="/customer/product/:id" element={<ProductPage />} />
            <Route path="/customer/cart" element={<CartPage />} />
            <Route path="/customer/orders" element={<OrdersPage />} />
            <Route path="/customer/favorites" element={<Favorites />} />
            <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
