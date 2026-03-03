import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
  validateVendorId?: boolean;
}

export const VendorProtectedRoute: React.FC<VendorProtectedRouteProps> = ({ 
  children, 
  validateVendorId = false 
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { vendorId } = useParams<{ vendorId: string }>();

  if (!isAuthenticated || !user) {
    return <Navigate to="/producer/login" replace />;
  }

  // Only producer and admin have full vendor module access
  if (user.role !== 'producer' && user.role !== 'admin') {
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (user.role === 'driver') {
      return <Navigate to="/driver/dashboard" replace />;
    } else if (user.role === 'camera_crew') {
      return <Navigate to="/crew/dashboard" replace />;
    } else if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (validateVendorId && vendorId && vendorId !== user.id) {
    return <Navigate to="/producer/login" replace />;
  }

  return <>{children}</>;
};
