import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiSearch, HiX } from 'react-icons/hi';

const DataTable = ({
  columns,
  data,
  loading = false,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  emptyMessage = 'No data found',
  actions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {onSearch && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-field pl-9 py-2 text-sm w-full sm:w-64"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); onSearch?.(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
                >
                  <HiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary text-sm py-2">
              Search
            </button>
          </form>
        )}

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap"
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="skeleton h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <motion.tr
                  key={row._id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="table-row"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    pageNum === currentPage
                      ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                      : 'glass-light text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;