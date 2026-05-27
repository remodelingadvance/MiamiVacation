import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiAdjustments,
  HiCalendar,
  HiLocationMarker,
  HiSearch,
  HiShieldCheck,
  HiSparkles,
  HiX,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilters from '../components/properties/PropertyFilters';
import { useSearch } from '../contexts/SearchContext';
import { THEME } from '../config/theme.config';

const hasFilterValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

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
  }, [searchParams, searchProperties]);

  useEffect(() => {
    searchProperties(currentPage);
  }, [currentPage, searchProperties]);

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== 'sort' && hasFilterValue(value)
  );

  return (
    <>
      <SEOHead
        title="Miami World Cup Vacation Rentals"
        description="Browse professional Miami vacation homes for FIFA World Cup 2026 stays, match weeks, beach days, and local concierge support."
      />

      <section className="relative isolate overflow-hidden bg-[var(--color-text-primary)] pt-28 text-white lg:pt-36">
        <img
          src={THEME.hero.heroImage}
          alt="Miami beach and skyline"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,76,0.92),rgba(7,20,76,0.72)_42%,rgba(7,20,76,0.24))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,76,0.15),rgba(7,20,76,0.76))]" />
        <div className="absolute -right-28 top-20 hidden h-80 w-80 rounded-full bg-[var(--color-primary)]/28 blur-3xl lg:block" />

        <div className="container-custom relative z-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-black uppercase backdrop-blur">
                <HiCalendar className="h-4 w-4 text-[#FFC83D]" />
                June 11 - July 19, 2026
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-black uppercase backdrop-blur">
                <HiLocationMarker className="h-4 w-4 text-[var(--color-primary)]" />
                Miami, Florida
              </span>
            </div>

            <p className="text-sm font-black uppercase text-[var(--color-primary)]">
              FIFA World Cup 2026 Stays
            </p>
            <h1 className="mt-3 font-hero text-6xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              Stay Close.
              <br />
              Live Miami.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/82 sm:text-xl">
              Curated vacation homes for match days, beach mornings, and late-night Miami
              energy. Filter verified stays by neighborhood, group size, amenities, and price.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[var(--color-bg-medium)] py-10 lg:py-14">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="container-custom relative">
          <div className="mb-8 rounded-[24px] bg-white p-4 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                  Available homes
                </p>
                <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
                  {totalResults > 0
                    ? `${totalResults} Miami stays ready for World Cup guests`
                    : 'Find your Miami match-week home'}
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[var(--color-primary)] lg:hidden"
                >
                  <HiAdjustments className="h-5 w-5" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs">
                      {activeFilters.length}
                    </span>
                  )}
                </button>

                <label className="relative block min-w-[230px]">
                  <span className="sr-only">Sort properties</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="input-field w-full cursor-pointer appearance-none pr-10 font-semibold"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="pricing.basePrice">Price: Low to High</option>
                    <option value="-pricing.basePrice">Price: High to Low</option>
                    <option value="-ratings.average">Highest Rated</option>
                    <option value="-details.bedrooms">Most Bedrooms</option>
                  </select>
                  <HiSearch className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                </label>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                {filters.type?.map((type) => (
                  <span key={type} className="badge badge-primary gap-1">
                    {type}
                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({ type: filters.type.filter((item) => item !== type) })
                      }
                      aria-label={`Remove ${type}`}
                    >
                      <HiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.minPrice && (
                  <span className="badge badge-primary gap-1">
                    Min ${filters.minPrice}
                    <button type="button" onClick={() => updateFilters({ minPrice: '' })}>
                      <HiX className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="badge badge-primary gap-1">
                    Max ${filters.maxPrice}
                    <button type="button" onClick={() => updateFilters({ maxPrice: '' })}>
                      <HiX className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="badge badge-primary gap-1">
                    {filters.search}
                    <button type="button" onClick={() => updateFilters({ search: '' })}>
                      <HiX className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <PropertyFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>

            <div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['Verified homes', HiShieldCheck, 'Quality checked for guests'],
                  ['Game day access', HiSparkles, 'Stay close. Live loud.'],
                  ['Miami concierge', HiLocationMarker, 'Local support around the clock'],
                ].map(([title, Icon, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur"
                  >
                    <Icon className="mb-2 h-6 w-6 text-[var(--color-primary)]" />
                    <p className="font-black text-[var(--color-text-primary)]">{title}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{text}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonLoader key={index} type="card" />
                    ))}
                  </motion.div>
                ) : properties.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {properties.map((property, index) => (
                        <motion.div
                          key={property._id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.04, 0.28) }}
                        >
                          <PropertyCard property={property} />
                        </motion.div>
                      ))}
                    </div>

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
                      message="Try adjusting your filters or search criteria to find more Miami stays."
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

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-[rgba(7,20,76,0.55)] backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute bottom-0 right-0 top-0 w-full max-w-sm overflow-y-auto bg-[var(--color-bg-medium)] p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black text-[var(--color-text-primary)]">
                  Filter stays
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow-sm"
                  aria-label="Close filters"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>
              <PropertyFilters
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertiesPage;
