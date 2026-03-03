import React, { useState, useEffect } from 'react';
import { X, Info, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RatingCriteria {
  label: string;
  key: string;
  rating: number;
  tooltip: string;
}

interface EnhancedRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  otherPartyName: string;
  userRole: 'renter' | 'vendor';
  equipmentName?: string;
}

export const EnhancedRatingModal: React.FC<EnhancedRatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  otherPartyName,
  userRole,
  equipmentName,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getCriteria = (): RatingCriteria[] => {
    if (userRole === 'renter') {
      return [
        {
          label: 'Equipment Condition',
          key: 'equipmentCondition',
          rating: 0,
          tooltip: 'Was gear operational, clean, well-maintained?',
        },
        {
          label: 'Inventory Accuracy',
          key: 'inventoryAccuracy',
          rating: 0,
          tooltip: 'Were all accessories included and functional?',
        },
        {
          label: 'Communication/Support',
          key: 'communication',
          rating: 0,
          tooltip: 'Was vendor responsive with clear instructions?',
        },
        {
          label: 'Punctuality/Logistics',
          key: 'punctuality',
          rating: 0,
          tooltip: 'Was equipment available on time?',
        },
      ];
    } else {
      return [
        {
          label: 'Care of Equipment',
          key: 'equipmentCare',
          rating: 0,
          tooltip: 'Was gear returned in original condition?',
        },
        {
          label: 'Punctuality/Return Time',
          key: 'returnTime',
          rating: 0,
          tooltip: 'Was equipment returned on time?',
        },
        {
          label: 'Adherence to Terms',
          key: 'adherenceToTerms',
          rating: 0,
          tooltip: 'Did renter respect rental period and usage area?',
        },
        {
          label: 'Communication/Flexibility',
          key: 'communication',
          rating: 0,
          tooltip: 'Was renter communicative and respectful?',
        },
      ];
    }
  };

  const [criteria, setCriteria] = useState<RatingCriteria[]>(getCriteria());

  useEffect(() => {
    if (isOpen) {
      setCriteria(getCriteria());
      setComment('');
      setShowConfirmation(false);
    }
  }, [isOpen, userRole]);

  const updateRating = (index: number, newRating: number) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index].rating = newRating;
    setCriteria(updatedCriteria);
  };

  const calculateAverageRating = (): number => {
    const sum = criteria.reduce((acc, criterion) => acc + criterion.rating, 0);
    return criteria.length > 0 ? sum / criteria.length : 0;
  };

  const isValid = (): boolean => {
    return criteria.every((criterion) => criterion.rating > 0);
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      toast({
        title: 'Please rate all criteria',
        description: 'All rating fields are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const ratingData = {
        bookingId,
        userRole,
        ratings: criteria.reduce((acc, criterion) => {
          acc[criterion.key] = criterion.rating;
          return acc;
        }, {} as Record<string, number>),
        overallRating: calculateAverageRating(),
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('Submitting rating:', ratingData);

      setShowConfirmation(true);
      
      setTimeout(() => {
        toast({
          title: 'Review submitted!',
          description: 'Your rating will be visible once both parties submit their reviews.',
        });
        onClose();
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    toast({
      title: 'Review skipped',
      description: 'You can submit your review later from your bookings page.',
    });
  };

  const averageRating = calculateAverageRating();
  const characterCount = comment.length;
  const maxCharacters = 500;

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
            <p className="text-muted-foreground">
              Your rating will be visible once {otherPartyName} submits their review.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Rate {userRole === 'renter' ? 'Vendor' : 'Renter'}: {otherPartyName}
          </DialogTitle>
          <DialogDescription>
            {equipmentName && `Rental: ${equipmentName} • `}
            Your feedback helps build trust in our community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Individual Criteria Ratings */}
          <TooltipProvider>
            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={criterion.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium flex-1">
                      {criterion.label}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{criterion.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <StarRating
                    rating={criterion.rating}
                    onRatingChange={(rating) => updateRating(index, rating)}
                    size="md"
                    showValue
                  />
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Overall Rating Display */}
          {isValid() && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(averageRating)} readonly size="md" />
                  <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Review (Optional)
            </label>
            <Textarea
              placeholder={`Share your experience with ${otherPartyName}...`}
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                  setComment(e.target.value);
                }
              }}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end">
              <span className={`text-xs ${
                characterCount > maxCharacters * 0.9 ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
