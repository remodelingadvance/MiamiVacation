import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiThumbUp, HiThumbDown, HiPhotograph, HiBadgeCheck } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../config/api';
import toast from 'react-hot-toast';

const ReviewCard = ({ review }) => {
  const { isAuthenticated, user } = useAuth();
  const [helpfulVote, setHelpfulVote] = useState(null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (vote) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (voting) return;

    try {
      setVoting(true);
      await apiService.markHelpful(review._id, vote);
      setHelpfulVote(vote);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
            <span className="text-[var(--color-primary)] font-semibold">
              {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium">
                {review.user?.firstName} {review.user?.lastName}
              </h4>
              {review.verified && (
                <HiBadgeCheck className="w-4 h-4 text-[var(--color-primary)]" title="Verified Stay" />
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <HiStar className="w-5 h-5 text-[var(--color-primary)]" />
          <span className="text-white font-semibold">{review.rating}</span>
        </div>
      </div>

      {/* Title */}
      <h5 className="text-white font-semibold mb-2">{review.title}</h5>

      {/* Content */}
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.caption || 'Review image'}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image.url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Sub-ratings */}
      {review.ratings && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(review.ratings).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-[var(--color-text-muted)] capitalize mb-1">{key}</p>
              <div className="flex items-center justify-center gap-1">
                <HiStar className="w-3 h-3 text-[var(--color-primary)]" />
                <span className="text-xs text-white">{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response from host */}
      {review.response?.text && (
        <div className="mt-4 p-4 rounded-lg glass-light border-l-2 border-[var(--color-primary)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Response from Miami Luxury Rentals</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{review.response.text}</p>
        </div>
      )}

      {/* Helpful buttons */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <span className="text-xs text-[var(--color-text-muted)]">Was this helpful?</span>
        <button
          onClick={() => handleVote('yes')}
          disabled={voting || helpfulVote}
          className={`flex items-center gap-1 text-xs transition-colors ${
            helpfulVote === 'yes'
              ? 'text-[var(--color-success)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-success)]'
          }`}
        >
          <HiThumbUp className="w-4 h-4" />
          Yes ({review.helpful?.yes || 0})
        </button>
        <button
          onClick={() => handleVote('no')}
          disabled={voting || helpfulVote}
          className={`flex items-center gap-1 text-xs transition-colors ${
            helpfulVote === 'no'
              ? 'text-red-500'
              : 'text-[var(--color-text-muted)] hover:text-red-500'
          }`}
        >
          <HiThumbDown className="w-4 h-4" />
          No ({review.helpful?.no || 0})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;