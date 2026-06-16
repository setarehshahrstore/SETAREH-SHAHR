import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their home based on role
    if (user.role === 'Customer') return <Navigate to="/account" replace />;
    if (user.role === 'Cashier') return <Navigate to="/admin/sales" replace />;
    if (user.role === 'Warehouse Staff') return <Navigate to="/admin/inventory" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
