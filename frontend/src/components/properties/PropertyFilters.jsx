import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAdjustments,
  HiChevronDown,
  HiHome,
  HiSearch,
  HiSparkles,
  HiUsers,
  HiX,
} from 'react-icons/hi';
import { AMENITIES, PROPERTY_TYPES } from '../../config/constants';

const Section = ({ title, icon: Icon, open, onToggle, children }) => (
  <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-4 text-left"
    >
      <span className="flex items-center gap-2 text-sm font-black text-[var(--color-text-primary)]">
        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        {title}
      </span>
      <HiChevronDown
        className={`h-5 w-5 text-[var(--color-text-muted)] transition-transform ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const PropertyFilters = ({ filters, onFilterChange, onReset }) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    rooms: true,
    amenities: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.type?.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.guests ||
    filters.amenities?.length > 0;

  return (
    <aside className="rounded-[24px] border border-white/70 bg-white/86 p-4 shadow-[0_18px_48px_rgba(8,19,76,0.10)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[var(--color-primary)]">
            Miami Stays
          </p>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">
            Match-week filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            aria-label="Clear filters"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <HiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search neighborhood, condo, villa..."
          className="input-field pl-10"
        />
      </div>

      <div className="space-y-3">
        <Section
          title="Property Type"
          icon={HiHome}
          open={expandedSections.type}
          onToggle={() => toggleSection('type')}
        >
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--color-bg-medium)]"
              >
                <input
                  type="checkbox"
                  checked={filters.type?.includes(type.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...(filters.type || []), type.value]
                      : filters.type?.filter((item) => item !== type.value);
                    onFilterChange({ type: newTypes });
                  }}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm font-semibold capitalize text-[var(--color-text-secondary)]">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section
          title="Price Range"
          icon={HiAdjustments}
          open={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
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
        </Section>

        <Section
          title="Rooms & Guests"
          icon={HiUsers}
          open={expandedSections.rooms}
          onToggle={() => toggleSection('rooms')}
        >
          <div className="space-y-3">
            <label className="block">
              <span className="input-label">Bedrooms</span>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}+ bedrooms
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="input-label">Guests</span>
              <select
                value={filters.guests || ''}
                onChange={(e) => onFilterChange({ guests: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Any</option>
                {[1, 2, 4, 6, 8, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}+ guests
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Section>

        <Section
          title="Amenities"
          icon={HiSparkles}
          open={expandedSections.amenities}
          onToggle={() => toggleSection('amenities')}
        >
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {AMENITIES.map((category) => (
              <div key={category.category}>
                <p className="mb-2 mt-1 text-xs font-black uppercase text-[var(--color-text-muted)]">
                  {category.category}
                </p>
                <div className="space-y-1">
                  {category.amenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--color-bg-medium)]"
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities?.includes(amenity.value)}
                        onChange={(e) => {
                          const newAmenities = e.target.checked
                            ? [...(filters.amenities || []), amenity.value]
                            : filters.amenities?.filter((item) => item !== amenity.value);
                          onFilterChange({ amenities: newAmenities });
                        }}
                        className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {amenity.icon} {amenity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
};

export default PropertyFilters;
