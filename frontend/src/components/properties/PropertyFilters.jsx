import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiX, HiAdjustments } from 'react-icons/hi';
import { PROPERTY_TYPES, AMENITIES } from '../../config/constants';

const PropertyFilters = ({ filters, onFilterChange, onReset }) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    rooms: true,
    amenities: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.type?.length > 0 || 
           filters.minPrice || 
           filters.maxPrice || 
           filters.bedrooms || 
           filters.guests || 
           filters.amenities?.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search properties..."
          className="input-field pl-10"
        />
      </div>

      {/* Active filters */}
      {hasActiveFilters() && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
        >
          <HiX className="w-4 h-4" />
          Clear all filters
        </button>
      )}

      {/* Property Type */}
      <div className="glass-light rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between p-4 text-white font-medium"
        >
          Property Type
          <HiAdjustments className={`w-5 h-5 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.type && (
          <div className="px-4 pb-4 space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.type?.includes(type.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...(filters.type || []), type.value]
                      : filters.type?.filter(t => t !== type.value);
                    onFilterChange({ type: newTypes });
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors capitalize">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="glass-light rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-4 text-white font-medium"
        >
          Price Range
          <HiAdjustments className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.price && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                placeholder="Min"
                className="input-field w-full"
              />
              <span className="text-[var(--color-text-muted)]">-</span>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                placeholder="Max"
                className="input-field w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rooms & Guests */}
      <div className="glass-light rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('rooms')}
          className="w-full flex items-center justify-between p-4 text-white font-medium"
        >
          Rooms & Guests
          <HiAdjustments className={`w-5 h-5 transition-transform ${expandedSections.rooms ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.rooms && (
          <div className="px-4 pb-4 space-y-4">
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">Bedrooms</label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}+ bedrooms</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">Guests</label>
              <select
                value={filters.guests || ''}
                onChange={(e) => onFilterChange({ guests: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Any</option>
                {[1, 2, 4, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num}+ guests</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="glass-light rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('amenities')}
          className="w-full flex items-center justify-between p-4 text-white font-medium"
        >
          Amenities
          <HiAdjustments className={`w-5 h-5 transition-transform ${expandedSections.amenities ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.amenities && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {AMENITIES.map((category) => (
              <div key={category.category}>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-3">
                  {category.category}
                </p>
                {category.amenities.map((amenity) => (
                  <label key={amenity.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.amenities?.includes(amenity.value)}
                      onChange={(e) => {
                        const newAmenities = e.target.checked
                          ? [...(filters.amenities || []), amenity.value]
                          : filters.amenities?.filter(a => a !== amenity.value);
                        onFilterChange({ amenities: newAmenities });
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">
                      {amenity.icon} {amenity.label}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;