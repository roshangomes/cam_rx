import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(null)}
            className={`transition-all duration-200 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            role="radio"
            aria-checked={star <= rating}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors duration-200 ${
                star <= currentRating
                  ? 'fill-[#FFD700] text-[#FFD700]'
                  : 'fill-none text-muted-foreground/40'
              } ${
                hoverRating !== null && star <= hoverRating && !readonly
                  ? 'fill-[#FFED4E] text-[#FFED4E]'
                  : ''
              }`}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {currentRating} out of 5 stars
        </span>
      )}
    </div>
  );
};
