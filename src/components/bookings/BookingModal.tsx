import React, { useState } from 'react';
import { Calendar as CalendarIcon, Truck, MapPin, Package } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setBookings } from '@/store/slices/bookingsSlice';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    name: string;
    vendor: string;
    dailyRate: number;
    weeklyRate: number;
    image: string;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  equipment,
}) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    
    const days = differenceInDays(endDate, startDate) + 1;
    const basePrice = days >= 7 
      ? Math.floor(days / 7) * equipment.weeklyRate + (days % 7) * equipment.dailyRate
      : days * equipment.dailyRate;
    
    const deliveryFee = deliveryOption === 'delivery' ? 500 : 0;
    return (basePrice * quantity) + deliveryFee;
  };

  const getDurationDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleConfirmBooking = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Invalid Dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBooking = {
      id: `booking-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      customerName: user.name,
      customerEmail: user.email,
      vendorName: equipment.vendor,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalAmount: calculateTotal(),
      deliveryOption,
      quantity,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    // Add to bookings
    dispatch(setBookings([...bookings, newBooking]));

    toast({
      title: "Booking Submitted!",
      description: `Your booking request for ${equipment.name} has been sent to the vendor.`,
    });

    setIsSubmitting(false);
    onClose();

    // Reset form
    setStartDate(undefined);
    setEndDate(undefined);
    setDeliveryOption('pickup');
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Equipment</DialogTitle>
          <DialogDescription>
            Complete your booking details for {equipment.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Equipment Preview */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img 
              src={equipment.image} 
              alt={equipment.name}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div>
              <h3 className="font-semibold text-lg">{equipment.name}</h3>
              <p className="text-sm text-muted-foreground">{equipment.vendor}</p>
              <p className="text-sm font-medium mt-2">
                ₹{equipment.dailyRate}/day · ₹{equipment.weeklyRate}/week
              </p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <div className="flex items-center justify-center w-20 h-10 border rounded-md">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Delivery Option */}
          <div className="space-y-2">
            <Label>Delivery Option</Label>
            <RadioGroup value={deliveryOption} onValueChange={(value: any) => setDeliveryOption(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Self Pickup</p>
                      <p className="text-sm text-muted-foreground">Free - Collect from vendor location</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Home Delivery</p>
                      <p className="text-sm text-muted-foreground">₹500 - Delivered to your location</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Price Breakdown */}
          {startDate && endDate && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Price Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{getDurationDays()} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Rate:</span>
                  <span>₹{equipment.dailyRate}/day</span>
                </div>
                {deliveryOption === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span>₹500</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-semibold text-base">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
          )}

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
              onClick={handleConfirmBooking}
              className="flex-1 bg-gradient-primary"
              disabled={!startDate || !endDate || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
