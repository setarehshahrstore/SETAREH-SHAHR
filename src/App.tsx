import React, { Component, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { StorefrontLayout } from './layouts/StorefrontLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Storefront } from './components/Storefront'; // Landing Page
import { OrderTracking } from './components/OrderTracking';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Categories } from './components/Categories';
import { Purchases } from './components/Purchases';
import { Orders } from './components/Orders';
import { Debts } from './components/Debts';
import { Expenses } from './components/Expenses';
import { Reports } from './components/Reports';
import { Employees } from './components/Employees';
import { Settings } from './components/Settings';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { Partners } from './components/Partners';
import { Settings as SettingsView } from './components/Settings';
import { Login } from './components/Login';
import { Finances } from './components/Finances';

// Placeholder components for new pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64 text-slate-500 font-bold text-xl">
    {title} - در حال ساخت...
  </div>
);

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global Error Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 min-h-screen text-left" dir="ltr">
          <h1 className="text-3xl font-bold mb-4">React App Crashed</h1>
          <p className="font-bold mb-2">{this.state.error?.toString()}</p>
          <pre className="bg-white p-4 overflow-auto rounded text-sm text-gray-800">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<StorefrontLayout />}>
              <Route index element={<Storefront />} />
              <Route path="tracking" element={<OrderTracking />} />
              <Route path="login" element={<Login />} />
              <Route 
                path="account" 
                element={
                  <ProtectedRoute allowedRoles={['Customer']}>
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
                  <Products />
                </ProtectedRoute>
              } />
              
              <Route path="categories" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Categories />
                </ProtectedRoute>
              } />

              <Route path="sales" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Cashier']}>
                  <POS />
                </ProtectedRoute>
              } />

              <Route path="purchases" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Purchases />
                </ProtectedRoute>
              } />

              <Route path="orders" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Cashier']}>
                  <Orders />
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
                  <Debts />
                </ProtectedRoute>
              } />

              <Route path="payments" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Debts />
                </ProtectedRoute>
              } />

              <Route path="expenses" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Expenses />
                </ProtectedRoute>
              } />

              <Route path="finances" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Finances />
                </ProtectedRoute>
              } />

              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="employees" element={
                <ProtectedRoute allowedRoles={['Owner']}>
                  <Employees />
                </ProtectedRoute>
              } />

              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                  <Settings />
                </ProtectedRoute>
              } />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
