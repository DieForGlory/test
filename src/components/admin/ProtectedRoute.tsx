import React from 'react';
import { Navigate } from 'react-router-dom';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  // TODO: Add token validation
  // You can add additional checks here:
  // - Verify token expiration
  // - Check user role
  // - Validate token with backend
  return <>{children}</>;
}