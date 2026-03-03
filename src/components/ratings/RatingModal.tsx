import React, { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RatingCriteria {
  label: string;
  key: string;
  rating: number;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  equipmentName: string;
  otherPartyName: string;
  userRole: 'renter' | 'vendor';
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  equipmentName,
  otherPartyName,
  userRole,
}) => {
  const { toast } = useToast();

  // Define criteria based on user role
  const getCriteria = (): RatingCriteria[] => {
    if (userRole === 'renter') {
      // Renter reviews Vendor
      return [
        { label: 'Equipment Quality & Condition', key: 'equipmentQuality', rating: 0 },
        { label: 'Inventory Accuracy', key: 'inventoryAccuracy', rating: 0 },
        { label: 'Communication & Support', key: 'communication', rating: 0 },
        { label: 'Punctuality & Logistics', key: 'punctuality', rating: 0 },
      ];
    } else {
      // Vendor reviews Renter
      return [
        { label: 'Care of Equipment', key: 'equipmentCare', rating: 0 },
        { label: 'Punctuality of Return', key: 'returnPunctuality', rating: 0 },
        { label: 'Adherence to Terms', key: 'adherenceToTerms', rating: 0 },
        { label: 'Communication & Flexibility', key: 'communication', rating: 0 },
      ];
    }
  };

  const [criteria, setCriteria] = useState<RatingCriteria[]>(getCriteria());
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (index: number, newRating: number) => {
    const updated = [...criteria];
    updated[index].rating = newRating;
    setCriteria(updated);
  };

  const calculateAverageRating = () => {
    const total = criteria.reduce((sum, item) => sum + item.rating, 0);
    return (total / criteria.length).toFixed(1);
  };

  const isValid = () => {
    return criteria.every(item => item.rating > 0);
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      toast({
        title: "Incomplete Rating",
        description: "Please rate all criteria before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ratingData = {
      bookingId,
      reviewerRole: userRole,
      criteria: criteria.reduce((acc, item) => ({
        ...acc,
        [item.key]: item.rating,
      }), {}),
      comment,
      averageRating: calculateAverageRating(),
      timestamp: new Date().toISOString(),
    };

    console.log('Submitting rating:', ratingData);

    toast({
      title: "Review Submitted!",
      description: `Thank you for rating ${otherPartyName}.`,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {userRole === 'renter' ? 'Rate Your Vendor' : 'Rate Your Renter'}
          </DialogTitle>
          <DialogDescription>
            Booking: {equipmentName} with {otherPartyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Criteria */}
          {criteria.map((item, index) => (
            <div key={item.key} className="space-y-2">
              <Label className="text-base font-medium">{item.label}</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateRating(index, star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= item.rating
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {item.rating > 0 ? `${item.rating}/5` : 'Not rated'}
                </span>
              </div>
            </div>
          ))}

          {/* Average Rating Display */}
          {criteria.every(item => item.rating > 0) && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Overall Rating:</span>
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 fill-warning text-warning" />
                  <span className="text-2xl font-bold">{calculateAverageRating()}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder={
                userRole === 'renter'
                  ? "Share your experience with this vendor..."
                  : "Share your experience with this renter..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-primary"
              disabled={!isValid() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
