import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiAdjustments,
  HiLocationMarker,
  HiSearch,
  HiShieldCheck,
  HiSparkles,
  HiX,
} from "react-icons/hi";
import SEOHead from "../components/common/SEOHead";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import SkeletonLoader from "../components/common/SkeletonLoader";
import PropertyCard from "../components/properties/PropertyCard";
import PropertyFilters from "../components/properties/PropertyFilters";
import { useSearch } from "../contexts/SearchContext";
import { THEME } from "../config/theme.config";

const hasFilterValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== "" && value !== null && value !== undefined;
};

const PropertiesPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    properties,
    loading,
    totalResults,
    currentPage,
    filters,
    filtersSynced,
    updateFilters,
    searchProperties,
    resetFilters,
    setCurrentPage,
  } = useSearch();

  const selectedNeighborhood = filters.neighborhood || "";

  useEffect(() => {
    if (!filtersSynced) return;
    searchProperties(currentPage);
  }, [currentPage, filtersSynced, searchProperties]);

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "sort" && hasFilterValue(value)
    );
  }, [filters]);

  const handleFilterChange = (nextFilters) => {
    updateFilters(nextFilters);
    setCurrentPage(1);
  };

  const removeFilter = (key, value) => {
    if (Array.isArray(filters[key])) {
      const nextArray = filters[key].filter((item) => item !== value);
      handleFilterChange({ [key]: nextArray });
    } else {
      handleFilterChange({ [key]: "" });
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    searchProperties(1);
    setIsFilterOpen(false);
  };

  return (
    <>
      <SEOHead
        title="StayWise Properties"
        description="Browse StayWise vacation homes by neighborhood, price, guests, amenities, and availability."
      />

      <section className="relative isolate overflow-hidden bg-gray-950 pt-28 text-white lg:pt-36">
        <img
          src={THEME.hero.heroImage}
          alt="StayWise properties"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="container-custom relative z-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase backdrop-blur">
                <HiLocationMarker className="h-4 w-4 text-[var(--color-primary)]" />
                {selectedNeighborhood || "All Locations"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase backdrop-blur">
                <HiShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
                Verified Stays
              </span>
            </div>

            <p className="text-sm font-black uppercase text-[var(--color-primary)]">
              StayWise Rentals
            </p>

            <h1 className="mt-3 font-hero text-4xl font-black uppercase leading-[0.9] sm:text-6xl lg:text-8xl">
              Find Your
              <br />
              Perfect Stay.
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/85 sm:text-xl">
              Filter stays by neighborhood, price, guests, amenities, and travel
              dates.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#f8f8f8] py-10 lg:py-14">
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-[28px] bg-white p-4 shadow-[0_18px_48px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                  Available homes
                </p>

                <h2 className="text-2xl font-black text-gray-950">
                  {totalResults > 0
                    ? `${totalResults} StayWise properties available`
                    : "Find your StayWise home"}
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="group relative flex h-12 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(255,79,123,0.25)] transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-gray-950 transition-all duration-500 ease-out group-hover:w-full" />
                  <span className="relative z-10 flex items-center gap-2">
                    <HiAdjustments className="h-5 w-5" />
                    Filters
                  </span>
                </button>

                <label className="relative block min-w-[230px]">
                  <select
                    value={filters.sort || "-createdAt"}
                    onChange={(e) =>
                      handleFilterChange({ sort: e.target.value })
                    }
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 pr-10 text-sm font-bold text-gray-800 outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="pricing.basePrice">Price: Low to High</option>
                    <option value="-pricing.basePrice">Price: High to Low</option>
                    <option value="-ratings.average">Highest Rated</option>
                    <option value="-details.bedrooms">Most Bedrooms</option>
                  </select>

                  <HiSearch className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </label>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {activeFilters.map(([key, value]) =>
                  Array.isArray(value) ? (
                    value.map((item) => (
                      <span
                        key={`${key}-${item}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-black text-[var(--color-primary)]"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeFilter(key, item)}
                        >
                          <HiX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-black text-[var(--color-primary)]"
                    >
                      {key === "neighborhood" ? "Location" : key}: {value}
                      <button type="button" onClick={() => removeFilter(key)}>
                        <HiX className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-600 transition hover:bg-gray-950 hover:text-white"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Verified homes", HiShieldCheck, "Quality checked stays"],
              ["Guest perks", HiSparkles, "Comfort-first amenities"],
              ["Smart locations", HiLocationMarker, "Filter by neighborhood"],
            ].map(([title, Icon, text]) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm backdrop-blur"
              >
                <Icon className="mb-2 h-6 w-6 text-[var(--color-primary)]" />
                <p className="font-black text-gray-950">{title}</p>
                <p className="text-sm font-medium text-gray-500">{text}</p>
              </motion.div>
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
                  message="Try adjusting your filters or choose another location."
                  actionLabel="Clear Filters"
                  actionLink="#"
                  onAction={handleResetFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Fixed Filter Modal - Centered on all screens */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Container - Centered with better responsive handling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                      Filter properties
                    </p>
                    <h3 className="font-display text-xl font-black text-gray-950 sm:text-2xl">
                      Find your best match
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-800 transition hover:bg-gray-200 active:scale-95"
                    aria-label="Close filter popup"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <PropertyFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 mt-auto border-t border-gray-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="order-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100 active:scale-95 sm:order-1"
                  >
                    Reset all
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="order-1 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--color-primary-dark)] active:scale-95 sm:order-2"
                  >
                    Show {totalResults > 0 ? totalResults : ""} results
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertiesPage;
