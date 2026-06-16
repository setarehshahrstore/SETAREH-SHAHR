import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { StorefrontLayout } from './layouts/StorefrontLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Storefront } from './components/Storefront'; // Landing Page
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { Partners } from './components/Partners';
import { Settings as SettingsView } from './components/Settings';
import { Login } from './components/Login';

// Placeholder components for new pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64 text-slate-500 font-bold text-xl">
    {title} - در حال ساخت...
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<StorefrontLayout />}>
              <Route index element={<Storefront />} />
              <Route path="login" element={<Login />} />
              <Route 
                path="account" 
                element={
                  <ProtectedRoute allowedRoles={['Customer', 'Owner', 'Manager']}>
                    <Placeholder title="حساب کاربری من" />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Secure Admin ERP Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Cashier', 'Warehouse Staff']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect handled in ProtectedRoute, but we add an index redirect */}
              <Route index element={<Navigate to="dashboard" replace />} />
              
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="products" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="مدیریت محصولات" />
                </ProtectedRoute>
              } />
              
              <Route path="categories" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="مدیریت کتگوری‌ها" />
                </ProtectedRoute>
              } />

              <Route path="sales" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Cashier']}>
                  <POS />
                </ProtectedRoute>
              } />

              <Route path="purchases" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="ثبت خریدهای جدید" />
                </ProtectedRoute>
              } />

              <Route path="orders" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Cashier']}>
                  <Placeholder title="سفارشات مشتریان" />
                </ProtectedRoute>
              } />

              <Route path="customers" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Partners />
                </ProtectedRoute>
              } />

              <Route path="suppliers" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Partners />
                </ProtectedRoute>
              } />

              <Route path="inventory" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Warehouse Staff']}>
                  <Inventory />
                </ProtectedRoute>
              } />

              <Route path="debts" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="مدیریت قرض‌ها" />
                </ProtectedRoute>
              } />

              <Route path="payments" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="پرداخت‌ها" />
                </ProtectedRoute>
              } />

              <Route path="expenses" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="مصارف روزانه" />
                </ProtectedRoute>
              } />

              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Placeholder title="گزارشات کامل" />
                </ProtectedRoute>
              } />

              <Route path="employees" element={
                <ProtectedRoute allowedRoles={['Owner']}>
                  <Placeholder title="مدیریت کارمندان" />
                </ProtectedRoute>
              } />

              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <SettingsView />
                </ProtectedRoute>
              } />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
