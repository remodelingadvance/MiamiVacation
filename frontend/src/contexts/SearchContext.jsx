import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../config/api';

const SearchContext = createContext(null);
const DEFAULT_FILTERS = {
  search: '',
  type: [],
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  guests: '',
  neighborhood: '',
  amenities: [],
  sort: '-createdAt',
};

const parseFiltersFromSearchParams = (searchParams) => {
  const params = Object.fromEntries(searchParams);

  return {
    ...DEFAULT_FILTERS,
    search: params.search || '',
    type: params.type ? params.type.split(',').filter(Boolean) : [],
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    bedrooms: params.bedrooms || '',
    bathrooms: params.bathrooms || '',
    guests: params.guests || '',
    neighborhood: params.neighborhood || params.neighbourhood || '',
    amenities: params.amenities ? params.amenities.split(',').filter(Boolean) : [],
    sort: params.sort || DEFAULT_FILTERS.sort,
  };
};

const arraysMatch = (a = [], b = []) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const filtersMatch = (left, right) =>
  left.search === right.search &&
  left.minPrice === right.minPrice &&
  left.maxPrice === right.maxPrice &&
  left.bedrooms === right.bedrooms &&
  left.bathrooms === right.bathrooms &&
  left.guests === right.guests &&
  left.neighborhood === right.neighborhood &&
  left.sort === right.sort &&
  arraysMatch(left.type, right.type) &&
  arraysMatch(left.amenities, right.amenities);

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
  const [filters, setFilters] = useState(() => parseFiltersFromSearchParams(searchParams));
  const latestRequestId = useRef(0);
  const searchParamString = searchParams.toString();
  const urlFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParamString]
  );
  const filtersSynced = useMemo(
    () => filtersMatch(filters, urlFilters),
    [filters, urlFilters]
  );

  // Sync filters with URL params
  useEffect(() => {
    setFilters(urlFilters);
  }, [urlFilters]);

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
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

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
        neighborhood: filters.neighborhood,
        amenities: filters.amenities.join(','),
        sort: filters.sort,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await apiService.searchProperties(params);

      if (requestId !== latestRequestId.current) return;
      
      setProperties(response.data.properties);
      setTotalResults(response.data.total || response.data.count);
      setCurrentPage(page);
    } catch (error) {
      if (requestId === latestRequestId.current) {
        console.error('Search failed:', error);
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  }, [setSearchParams]);

  const value = {
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
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
