import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../config/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = useCallback(async (propertyId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return false;
    }

    try {
      await apiService.addToFavorites(propertyId);
      setFavorites(prev => [...prev, propertyId]);
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return false;
    }
  }, [isAuthenticated]);

  const removeFromFavorites = useCallback(async (propertyId) => {
    try {
      await apiService.removeFromFavorites(propertyId);
      setFavorites(prev => prev.filter(id => id !== propertyId));
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return false;
    }
  }, []);

  const isFavorite = useCallback((propertyId) => {
    return favorites.some(fav => 
      fav === propertyId || fav._id === propertyId
    );
  }, [favorites]);

  const toggleFavorite = useCallback(async (propertyId) => {
    if (isFavorite(propertyId)) {
      return removeFromFavorites(propertyId);
    } else {
      return addToFavorites(propertyId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    loadFavorites,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;