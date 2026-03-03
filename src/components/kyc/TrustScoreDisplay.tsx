import React from 'react';
import { Star, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TrustScoreDisplayProps {
  score: number; // 0-100
  isKycVerified: boolean;
  totalBookings?: number;
  averageRating?: number;
  className?: string;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  score,
  isKycVerified,
  totalBookings = 0,
  averageRating = 0,
  className = '',
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trust Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
            <p className="text-sm text-muted-foreground">{getScoreLabel(score)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={score} className="h-2" />

        {/* Trust Factors */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              KYC Status
            </span>
            <span className={isKycVerified ? 'text-success font-medium' : 'text-muted-foreground'}>
              {isKycVerified ? 'Verified ✓' : 'Not Verified'}
            </span>
          </div>

          {totalBookings > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed Bookings</span>
              <span className="font-medium">{totalBookings}</span>
            </div>
          )}

          {averageRating > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                Average Rating
              </span>
              <span className="font-medium">{averageRating.toFixed(1)} / 5.0</span>
            </div>
          )}
        </div>

        {/* KYC Prompt */}
        {!isKycVerified && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Complete KYC verification to boost your trust score by +20 points
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
