import { Link } from 'react-router-dom';
import { HiHome, HiHeart, HiCalendar, HiSearch } from 'react-icons/hi';

const icons = {
  property: HiHome,
  wishlist: HiHeart,
  booking: HiCalendar,
  search: HiSearch,
};

const EmptyState = ({ 
  type = 'search',
  title = 'Nothing found',
  message = 'No results to display',
  actionLabel,
  actionLink,
}) => {
  const Icon = icons[type] || HiSearch;

  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-light flex items-center justify-center">
        <Icon className="w-10 h-10 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
        {message}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;