import { motion } from 'framer-motion';
import {
  HiAdjustments,
  HiHome,
  HiLocationMarker,
  HiSearch,
  HiSparkles,
  HiUsers,
  HiX,
} from 'react-icons/hi';
import { AMENITIES, PROPERTY_TYPES } from '../../config/constants';

const FieldLabel = ({ icon: Icon, children }) => (
  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[var(--color-text-muted)]">
    {Icon && <Icon className="h-4 w-4 text-[var(--color-primary)]" />}
    {children}
  </span>
);

const PillButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-bold capitalize transition-all ${
      active
        ? 'border-transparent bg-[var(--color-text-primary)] text-white shadow-[0_10px_24px_rgba(8,51,68,0.14)]'
        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
    }`}
  >
    {children}
  </button>
);

const PropertyFilters = ({ filters, onFilterChange, onReset }) => {
  const selectedTypes = filters.type || [];
  const selectedAmenities = filters.amenities || [];

  const hasActiveFilters =
    filters.search ||
    selectedTypes.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.guests ||
    filters.neighborhood ||
    selectedAmenities.length > 0;

  const toggleType = (value) => {
    const next = selectedTypes.includes(value)
      ? selectedTypes.filter((item) => item !== value)
      : [...selectedTypes, value];
    onFilterChange({ type: next });
  };

  const toggleAmenity = (value) => {
    const next = selectedAmenities.includes(value)
      ? selectedAmenities.filter((item) => item !== value)
      : [...selectedAmenities, value];
    onFilterChange({ amenities: next });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-white/80 bg-white/94 p-4 shadow-[0_18px_48px_rgba(8,51,68,0.10)] backdrop-blur-xl sm:p-5"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[var(--color-primary)]">
            Smart search
          </p>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
            Filter Miami stays
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-black text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <HiX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_0.95fr_0.9fr_0.9fr]">
        <label className="block">
          <FieldLabel icon={HiSearch}>Search</FieldLabel>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Neighborhood, tower, villa..."
              className="input-field pl-10"
            />
          </div>
        </label>

        <label className="block">
          <FieldLabel icon={HiLocationMarker}>Neighborhood</FieldLabel>
          <div className="relative">
            <HiLocationMarker className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={filters.neighborhood || ''}
              onChange={(e) => onFilterChange({ neighborhood: e.target.value })}
              placeholder="South Beach"
              className="input-field pl-10"
            />
          </div>
        </label>

        <label className="block">
          <FieldLabel icon={HiAdjustments}>Price</FieldLabel>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min"
              className="input-field"
            />
            <span className="text-[var(--color-text-muted)]">-</span>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max"
              className="input-field"
            />
          </div>
        </label>

        <label className="block">
          <FieldLabel icon={HiHome}>Bedrooms</FieldLabel>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
            className="input-field w-full"
          >
            <option value="">Any bedroom count</option>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num}+ bedrooms
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <FieldLabel icon={HiUsers}>Guests</FieldLabel>
          <select
            value={filters.guests || ''}
            onChange={(e) => onFilterChange({ guests: e.target.value })}
            className="input-field w-full"
          >
            <option value="">Any group size</option>
            {[1, 2, 4, 6, 8, 10, 12].map((num) => (
              <option key={num} value={num}>
                {num}+ guests
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <FieldLabel icon={HiHome}>Property type</FieldLabel>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {PROPERTY_TYPES.map((type) => (
            <PillButton
              key={type.value}
              active={selectedTypes.includes(type.value)}
              onClick={() => toggleType(type.value)}
            >
              {type.label}
            </PillButton>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <FieldLabel icon={HiSparkles}>Amenities</FieldLabel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {AMENITIES.map((category) => (
            <div key={category.category} className="rounded-lg bg-[var(--color-bg-medium)] p-3">
              <p className="mb-2 text-[11px] font-black uppercase text-[var(--color-text-muted)]">
                {category.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.amenities.map((amenity) => (
                  <button
                    key={amenity.value}
                    type="button"
                    onClick={() => toggleAmenity(amenity.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                      selectedAmenities.includes(amenity.value)
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default PropertyFilters;
