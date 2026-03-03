import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '@/store/store';

type UserRole = 'vendor' | 'customer' | 'admin' | 'driver' | 'camera_crew' | 'producer';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    const roleRedirects: Record<UserRole, string> = {
      customer: '/customer/dashboard',
      vendor: '/vendor/dashboard',
      producer: '/dashboard',
      driver: '/driver/dashboard',
      camera_crew: '/crew/dashboard',
      admin: '/dashboard',
    };

    const redirect = redirectTo || roleRedirects[user.role as UserRole] || '/';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export const ModuleProtectedRoute: React.FC<{
  children: React.ReactNode;
  module: 'camera' | 'transport';
}> = ({ children, module }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/producer/login" replace />;
  }

  const role = user.role;

  // Producer and admin have full access
  if (['producer', 'admin'].includes(role)) {
    return <>{children}</>;
  }

  // Driver can only access transport module
  if (role === 'driver') {
    if (module !== 'transport') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Camera crew can only access camera module
  if (role === 'camera_crew') {
    if (module !== 'camera') {
      return <Navigate to="/crew/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Vendor should not access department modules directly
  if (role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  // Customer should not access producer modules
  if (role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
};
