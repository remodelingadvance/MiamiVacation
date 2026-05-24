import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../config/api';

const useSearchStore = create(
  persist(
    (set, get) => ({
      // State
      properties: [],
      loading: false,
      error: null,
      totalResults: 0,
      currentPage: 1,
      filters: {
        search: '',
        type: [],
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        guests: '',
        amenities: [],
        sort: '-createdAt',
      },
      recentSearches: [],

      // Actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({
          filters: {
            search: '',
            type: [],
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
            guests: '',
            amenities: [],
            sort: '-createdAt',
          },
        });
      },

      addRecentSearch: (search) => {
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter(s => s !== search).slice(0, 9),
          ],
        }));
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      searchProperties: async (page = 1) => {
        const { filters } = get();
        set({ loading: true, error: null });

        try {
          const params = {
            page,
            limit: 12,
            ...filters,
            type: filters.type.join(','),
            amenities: filters.amenities.join(','),
          };

          // Clean empty params
          Object.keys(params).forEach(key => {
            if (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) {
              delete params[key];
            }
          });

          const response = await apiService.searchProperties(params);
          
          set({
            properties: response.data.properties,
            totalResults: response.data.total || response.data.count,
            currentPage: page,
            loading: false,
          });

          // Add to recent searches if there's a search term
          if (filters.search) {
            get().addRecentSearch(filters.search);
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Search failed',
            loading: false,
          });
        }
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().searchProperties(page);
      },
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({
        filters: state.filters,
        recentSearches: state.recentSearches,
      }),
    }
  )
);

export default useSearchStore;