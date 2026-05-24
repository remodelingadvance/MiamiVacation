import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAdjustments, HiX, HiSearch } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilters from '../components/properties/PropertyFilters';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { useSearch } from '../contexts/SearchContext';

const PropertiesPage = () => {
  const {
    properties,
    loading,
    totalResults,
    currentPage,
    filters,
    updateFilters,
    searchProperties,
    resetFilters,
    setCurrentPage,
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    searchProperties(1);
  }, [searchParams]);

  useEffect(() => {
    searchProperties(currentPage);
  }, [currentPage]);

  return (
    <>
      <SEOHead
        title="Luxury Properties"
        description="Browse our exclusive collection of luxury vacation rentals in Miami. Filter by price, location, amenities, and more."
      />

      {/* Page header */}
      <section className="relative pt-32 pb-16 bg-[var(--color-bg-medium)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="section-title text-white">
              Luxury Properties in Miami
            </h1>
            <p className="section-subtitle mx-auto">
              {totalResults > 0
                ? `Showing ${properties.length} of ${totalResults} properties`
                : 'Discover our hand-picked selection of premium vacation rentals'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container-custom">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg glass-light text-white hover:text-[var(--color-primary)] transition-colors"
              >
                <HiAdjustments className="w-5 h-5" />
                Filters
                {Object.values(filters).some(v => v && v.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
              
              {/* Active filters */}
              <div className="flex flex-wrap gap-2">
                {filters.type?.map((type) => (
                  <span key={type} className="badge badge-primary">
                    {type}
                    <button onClick={() => updateFilters({ type: filters.type.filter(t => t !== type) })} className="ml-1">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.minPrice && (
                  <span className="badge badge-primary">
                    Min ${filters.minPrice}
                    <button onClick={() => updateFilters({ minPrice: '' })} className="ml-1">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="badge badge-primary">
                    Max ${filters.maxPrice}
                    <button onClick={() => updateFilters({ maxPrice: '' })} className="ml-1">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="input-field w-auto min-w-[200px]"
            >
              <option value="-createdAt">Newest First</option>
              <option value="pricing.basePrice">Price: Low to High</option>
              <option value="-pricing.basePrice">Price: High to Low</option>
              <option value="-ratings.average">Highest Rated</option>
              <option value="-details.bedrooms">Most Bedrooms</option>
            </select>
          </div>

          <div className="flex gap-8">
            {/* Filters sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <PropertyFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {/* Properties grid */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonLoader key={i} type="card" />
                      ))}
                    </div>
                  </motion.div>
                ) : properties.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {properties.map((property, index) => (
                        <motion.div
                          key={property._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <PropertyCard property={property} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalResults > 12 && (
                      <div className="mt-12">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={Math.ceil(totalResults / 12)}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      type="search"
                      title="No properties found"
                      message="Try adjusting your filters or search criteria to find more properties."
                      actionLabel="Clear Filters"
                      actionLink="#"
                      onAction={resetFilters}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm glass-strong overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display font-bold text-white">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <PropertyFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertiesPage;