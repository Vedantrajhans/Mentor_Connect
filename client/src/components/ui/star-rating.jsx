'use client';

import { Star } from 'lucide-react';

export const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 24,
  showValue = false,
  maxStars = 5 
}) => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);
  
  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };
  
  const handleKeyDown = (e, value) => {
    if (!readonly && onRatingChange) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRatingChange(value);
      }
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {stars.map((star) => {
          const isFilled = star <= rating;
          const isHalfFilled = !isFilled && star - 0.5 <= rating;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              disabled={readonly}
              className={`
                transition-all duration-150
                ${!readonly ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded' : 'cursor-default'}
                ${readonly ? 'pointer-events-none' : ''}
              `}
              aria-label={`Rate ${star} out of ${maxStars} stars`}
              tabIndex={readonly ? -1 : 0}
            >
              <Star
                size={size}
                className={`
                  transition-colors duration-150
                  ${isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : isHalfFilled 
                    ? 'fill-yellow-400 text-yellow-400 opacity-50'
                    : readonly
                    ? 'text-gray-300'
                    : 'text-gray-300 hover:text-yellow-400'
                  }
                `}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      
      {showValue && rating > 0 && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
