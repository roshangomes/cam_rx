import React from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RatingNotificationProps {
  vendorName: string;
  equipmentName: string;
  onRateNow: () => void;
  onDismiss: () => void;
}

export const RatingNotification: React.FC<RatingNotificationProps> = ({
  vendorName,
  equipmentName,
  onRateNow,
  onDismiss,
}) => {
  return (
    <Card className="p-4 border-l-4 border-l-primary bg-primary/5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm">Rate your recent rental</h4>
              <p className="text-sm text-muted-foreground mt-1">
                How was your experience with <span className="font-medium text-foreground">{vendorName}</span> for {equipmentName}?
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 -mt-1"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onRateNow} size="sm" className="w-full sm:w-auto">
            Leave Your Review
          </Button>
        </div>
      </div>
    </Card>
  );
};
