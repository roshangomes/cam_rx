import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '@/store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'vendor' | 'customer' | 'admin' | 'driver' | 'camera_crew' | 'producer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const roleRedirects: Record<string, string> = {
      vendor: '/vendor/dashboard',
      producer: '/dashboard',
      customer: '/customer/dashboard',
      driver: '/driver/dashboard',
      camera_crew: '/crew/dashboard',
      admin: '/dashboard',
    };
    
    const redirect = roleRedirects[user?.role || ''] || '/';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
