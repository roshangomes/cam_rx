import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout as logoutAction, loginStart, loginFailure } from '@/store/slices/authSlice';

// Mock user type for demo purposes
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

export const useAuth = () => {
  const [loading] = useState(false);
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const dispatch = useDispatch();

  // Mock email/password sign in for vendor - accepts any credentials
  const signInWithEmail = async (email: string, _password: string) => {
    dispatch(loginStart());
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: MockUser = {
      uid: `mock-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    
    setMockUser(user);
    
    // Dispatch loginSuccess to update Redux state
    dispatch(loginSuccess({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'vendor',
      kycStatus: 'approved',
    }));
    
    return { user, error: null };
  };

  // Mock sign up for vendor - accepts any credentials
  const signUpWithEmail = async (email: string, _password: string) => {
    dispatch(loginStart());
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: MockUser = {
      uid: `mock-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    
    setMockUser(user);
    
    // Dispatch loginSuccess to update Redux state
    dispatch(loginSuccess({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'vendor',
      kycStatus: 'pending',
    }));
    
    return { user, error: null };
  };

  // Mock Google sign in for vendor
  const signInWithGoogle = async () => {
    dispatch(loginStart());
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: MockUser = {
      uid: `mock-google-${Date.now()}`,
      email: 'demo@gmail.com',
      displayName: 'Demo User',
    };
    
    setMockUser(user);
    
    // Dispatch loginSuccess to update Redux state
    dispatch(loginSuccess({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'vendor',
      kycStatus: 'approved',
    }));
    
    return { user, error: null };
  };

  // Customer sign in
  const signInCustomer = async (email: string, _password: string) => {
    dispatch(loginStart());
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: MockUser = {
      uid: `mock-customer-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    
    setMockUser(user);
    
    // Dispatch loginSuccess to update Redux state with customer role
    dispatch(loginSuccess({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'customer',
    }));
    
    return { user, error: null };
  };

  // Customer sign up
  const signUpCustomer = async (email: string, _password: string) => {
    dispatch(loginStart());
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: MockUser = {
      uid: `mock-customer-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    
    setMockUser(user);
    
    // Dispatch loginSuccess to update Redux state with customer role
    dispatch(loginSuccess({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'customer',
    }));
    
    return { user, error: null };
  };

  // Driver sign in
  const signInDriver = async (email: string, _password: string) => {
    dispatch(loginStart());
    await new Promise(resolve => setTimeout(resolve, 500));
    const user: MockUser = { uid: `mock-driver-${Date.now()}`, email, displayName: email.split('@')[0] };
    setMockUser(user);
    dispatch(loginSuccess({ id: user.uid, email: user.email, name: user.displayName, role: 'driver' }));
    return { user, error: null };
  };

  // Camera crew sign in
  const signInCrew = async (email: string, _password: string) => {
    dispatch(loginStart());
    await new Promise(resolve => setTimeout(resolve, 500));
    const user: MockUser = { uid: `mock-crew-${Date.now()}`, email, displayName: email.split('@')[0] };
    setMockUser(user);
    dispatch(loginSuccess({ id: user.uid, email: user.email, name: user.displayName, role: 'camera_crew' }));
    return { user, error: null };
  };

  // Mock logout
  const logout = async () => {
    setMockUser(null);
    dispatch(logoutAction());
    return { error: null };
  };

  return {
    user: mockUser,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInCustomer,
    signUpCustomer,
    signInDriver,
    signInCrew,
    logout,
  };
};
