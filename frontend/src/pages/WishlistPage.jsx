import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiTrash } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import PropertyCard from '../components/properties/PropertyCard';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { favorites, loading, removeFromFavorites } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-24">
        <div className="container-custom py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)]">Please Sign In</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">Sign in to view your wishlist</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="My Wishlist" noIndex />

      <section className="bg-[var(--color-bg-medium)] pb-16 pt-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <HiHeart className="w-8 h-8 text-[var(--color-primary)]" />
              <h1 className="section-title mb-0 text-left">My Wishlist</h1>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonLoader key={i} type="card" />
                  ))}
                </div>
              </motion.div>
            ) : favorites.length > 0 ? (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {favorites.map((property, index) => (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  type="wishlist"
                  title="Your wishlist is empty"
                  message="Save your favorite properties by clicking the heart icon on any property."
                  actionLabel="Browse Properties"
                  actionLink="/properties"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default WishlistPage;
