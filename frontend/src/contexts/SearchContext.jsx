import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../config/api';

const SearchContext = createContext(null);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: [],
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    amenities: [],
    sort: '-createdAt',
  });

  // Sync filters with URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    setFilters(prev => ({
      ...prev,
      ...params,
      type: params.type ? params.type.split(',') : [],
      amenities: params.amenities ? params.amenities.split(',') : [],
    }));
  }, []);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Update URL params
      const params = {};
      Object.keys(updated).forEach(key => {
        if (updated[key] && updated[key].length > 0) {
          params[key] = Array.isArray(updated[key]) ? updated[key].join(',') : updated[key];
        }
      });
      setSearchParams(params);
      
      return updated;
    });
  }, [setSearchParams]);

  // Search properties
  const searchProperties = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 12,
        search: filters.search,
        type: filters.type.join(','),
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        guests: filters.guests,
        amenities: filters.amenities.join(','),
        sort: filters.sort,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await apiService.searchProperties(params);
      
      setProperties(response.data.properties);
      setTotalResults(response.data.total || response.data.count);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: [],
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      guests: '',
      amenities: [],
      sort: '-createdAt',
    });
    setSearchParams({});
  }, [setSearchParams]);

  const value = {
    properties,
    loading,
    totalResults,
    currentPage,
    filters,
    updateFilters,
    searchProperties,
    resetFilters,
    setCurrentPage,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;