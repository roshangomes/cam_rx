import React from 'react';
import { Star } from 'lucide-react';

interface VendorRatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const VendorRatingBadge: React.FC<VendorRatingBadgeProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  };

  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} ${className}`}>
      <Star className={`${starSize} fill-[#FFD700] text-[#FFD700]`} />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
};
