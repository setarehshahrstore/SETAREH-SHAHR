import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../AuthContext';
import { ROLE_CONFIGS } from '../utils/permissions';

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
    const fallbackHome = ROLE_CONFIGS[user.role]?.homeRoute || '/';
    return <Navigate to={fallbackHome} replace />;
  }

  return <>{children}</>;
};

