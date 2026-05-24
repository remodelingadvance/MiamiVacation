import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminApi from '../config/api';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mlr_admin_token');
      if (token) {
        try {
          const response = await adminApi.getMe();
          const userData = response.data.user;
          
          // Check if user is admin
          if (userData.role === 'admin' || userData.role === 'super-admin') {
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('mlr_admin_user', JSON.stringify(userData));
          } else {
            // Not an admin, clear auth
            localStorage.removeItem('mlr_admin_token');
            localStorage.removeItem('mlr_admin_user');
            toast.error('Access denied. Admin privileges required.');
          }
        } catch (error) {
          console.error('Admin auth check failed:', error);
          localStorage.removeItem('mlr_admin_token');
          localStorage.removeItem('mlr_admin_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const response = await adminApi.login(credentials);
      const { token, user: userData } = response.data;

      // Verify admin role
      if (userData.role !== 'admin' && userData.role !== 'super-admin') {
        toast.error('Access denied. Admin privileges required.');
        return { success: false, message: 'Not authorized as admin' };
      }

      localStorage.setItem('mlr_admin_token', token);
      localStorage.setItem('mlr_admin_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${userData.firstName}!`);
      navigate('/admin/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('mlr_admin_token');
    localStorage.removeItem('mlr_admin_user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/admin/login');
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;