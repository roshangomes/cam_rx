import React, { useState } from 'react';
import { Star, TrendingUp, Award, Shield, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  componentRatings?: {
    label: string;
    rating: number;
  }[];
  totalRentals?: number;
  responseRate?: number;
  recentReviews?: Review[];
  userRole?: 'renter' | 'vendor';
  className?: string;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  componentRatings = [],
  totalRentals = 0,
  responseRate,
  recentReviews = [],
  userRole,
  className = '',
}) => {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 3.5) return 'text-warning';
    return 'text-destructive';
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Fair';
    return 'Needs Improvement';
  };

  const getPercentage = (count: number): number => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  const getBadges = () => {
    const badges = [];
    if (averageRating >= 4.8) {
      badges.push({ label: '5-Star Pro', icon: Award, variant: 'default' as const });
    }
    if (totalReviews >= 50) {
      badges.push({ label: userRole === 'vendor' ? 'Trusted Vendor' : 'Reliable Renter', icon: Shield, variant: 'secondary' as const });
    }
    return badges;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const badges = getBadges();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Large Rating Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(averageRating)
                          ? 'fill-[#FFD700] text-[#FFD700]'
                          : 'fill-none text-muted-foreground/40'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex gap-6 text-sm">
              {totalRentals > 0 && (
                <div className="text-center">
                  <div className="font-bold text-lg">{totalRentals}</div>
                  <div className="text-muted-foreground">Completed Rentals</div>
                </div>
              )}
              {responseRate !== undefined && (
                <div className="text-center">
                  <div className="font-bold text-lg">{responseRate}%</div>
                  <div className="text-muted-foreground">Response Rate</div>
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant} className="gap-1">
                    <badge.icon className="h-3 w-3" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rating Breakdown Section */}
      {componentRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {componentRatings.map((component, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{component.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{component.rating.toFixed(1)}</span>
                    <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                  </div>
                </div>
                <Progress value={(component.rating / 5) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Star Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{star}</span>
                <Star className="h-3 w-3 fill-[#FFD700] text-[#FFD700]" />
              </div>
              <Progress
                value={getPercentage(ratingBreakdown[star as keyof typeof ratingBreakdown])}
                className="h-2 flex-1"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {ratingBreakdown[star as keyof typeof ratingBreakdown]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Reviews Section */}
      {recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviews.map((review, index) => (
              <div key={review.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewerAvatar} />
                        <AvatarFallback>
                          {review.reviewerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.reviewerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'fill-[#FFD700] text-[#FFD700]'
                                    : 'fill-none text-muted-foreground/40'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(review.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Report review"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Review Text */}
                  {review.comment && (
                    <div className="text-sm text-muted-foreground">
                      {expandedReview === review.id || review.comment.length <= 200 ? (
                        review.comment
                      ) : (
                        <>
                          {review.comment.substring(0, 200)}...
                        </>
                      )}
                      {review.comment.length > 200 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => toggleReviewExpansion(review.id)}
                        >
                          {expandedReview === review.id ? 'Show less' : 'Read more'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
