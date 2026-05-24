import { HiStar } from 'react-icons/hi';

const StarRating = ({ rating, maxStars = 5, size = 'md', showValue = true, onChange }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      stars.push(
        <HiStar
          key={i}
          className={`${sizeClasses[size]} text-[var(--color-primary)] cursor-pointer transition-transform hover:scale-110`}
          onClick={() => onChange?.(i)}
        />
      );
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <div key={i} className="relative">
          <HiStar className={`${sizeClasses[size]} text-white/20`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <HiStar className={`${sizeClasses[size]} text-[var(--color-primary)] cursor-pointer`} onClick={() => onChange?.(i)} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <HiStar
          key={i}
          className={`${sizeClasses[size]} text-white/20 cursor-pointer transition-transform hover:scale-110`}
          onClick={() => onChange?.(i)}
        />
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="text-sm text-[var(--color-text-secondary)] ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;