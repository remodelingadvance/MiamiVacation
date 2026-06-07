import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../config/api';
import { setToken, getToken, setRefreshToken, getRefreshToken, clearAuth } from '../utils/auth';
import { signInWithFirebaseProvider } from '../services/firebaseAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await apiService.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { token, refreshToken, user } = response.data;
      
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${user.firstName}!`);
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'super-admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
      
      return { success: true };
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        const email = error.response.data.email || credentials.email;
        toast.error('Please verify your email before signing in.');
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return { success: false, requiresVerification: true, email };
      }

      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  // Signup
  const signup = useCallback(async (userData) => {
    try {
      const response = await apiService.signup(userData);
      if (response.data.requiresVerification) {
        toast.success('Account created. Please check your email for the verification code.');
        navigate(`/verify-email?email=${encodeURIComponent(response.data.email || userData.email)}`);
        return { success: true, requiresVerification: true };
      }

      const { token, refreshToken, user } = response.data;
      
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Account created successfully! Welcome to Miami Luxury Rentals.');
      navigate('/');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  const loginWithFirebase = useCallback(async (providerName) => {
    try {
      const firebaseResult = await signInWithFirebaseProvider(providerName);
      const response = await apiService.firebaseAuth(firebaseResult);
      const { token, refreshToken, user } = response.data;

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      setIsAuthenticated(true);

      const needsProfileCompletion = response.data.isNewUser && (!user.phone || !user.address?.street);
      toast.success(
        needsProfileCompletion
          ? `Welcome, ${user.firstName}! Please complete your profile.`
          : `Welcome, ${user.firstName}!`
      );
      navigate(needsProfileCompletion ? '/profile' : '/');
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        `${providerName === 'apple' ? 'Apple' : 'Google'} sign-in failed.`;
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  const verifyEmailCode = useCallback(async ({ email, code }) => {
    try {
      const response = await apiService.verifyEmailCode({ email, code });
      const { token, refreshToken, user } = response.data;

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      setIsAuthenticated(true);

      toast.success('Email verified successfully.');
      navigate('/');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  const resendVerificationCode = useCallback(async (email) => {
    try {
      await apiService.resendVerificationCode({ email });
      toast.success('Verification code sent.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification code';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      navigate('/');
    }
  }, [navigate]);

  // Update profile
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await apiService.updateProfile(data);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (data) => {
    try {
      const response = await apiService.updatePassword(data);
      const { token, refreshToken } = response.data;
      setToken(token);
      setRefreshToken(refreshToken);
      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      await apiService.forgotPassword(email);
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, passwords) => {
    try {
      await apiService.resetPassword(token, passwords);
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    try {
      await apiService.verifyEmail(token);
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    loginWithFirebase,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    verifyEmailCode,
    resendVerificationCode,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
