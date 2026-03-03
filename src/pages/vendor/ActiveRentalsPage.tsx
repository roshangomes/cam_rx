import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateBookingStatus } from '@/store/slices/bookingsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { PaymentTracker } from '@/components/bookings/PaymentTracker';

export const ActiveRentalsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Filter for only confirmed bookings (active rentals)
  const activeRentals = bookings.filter(b => b.status === 'confirmed');

  const handleCompleteRental = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setShowCompleteDialog(true);
  };

  const confirmComplete = () => {
    if (selectedBooking) {
      dispatch(updateBookingStatus({ 
        id: selectedBooking, 
        status: 'completed',
        paymentStatus: 'released'
      }));
      toast.success('Rental marked as completed', {
        description: 'Payment has been released to your account'
      });
      setShowCompleteDialog(false);
      setSelectedBooking(null);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, variant: 'destructive' as const };
    if (days === 0) return { text: 'Due today', variant: 'secondary' as const };
    if (days <= 2) return { text: `${days} days left`, variant: 'secondary' as const };
    return { text: `${days} days left`, variant: 'default' as const };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Rentals</h1>
        <p className="text-muted-foreground">
          Currently rented equipment and their status
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}</div>
            <p className="text-xs text-muted-foreground">Equipment currently out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRentals.filter(b => {
                const days = differenceInDays(new Date(b.endDate), new Date());
                return days >= 0 && days <= 2;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Returns in next 2 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRentals.filter(b => 
                differenceInDays(new Date(b.endDate), new Date()) < 0
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Past return date</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Rentals List */}
      {activeRentals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Rentals</h3>
            <p className="text-muted-foreground text-center">
              All equipment is currently available. Active rentals will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeRentals.map((booking) => {
            const daysInfo = getDaysRemaining(booking.endDate);
            const rentalDuration = differenceInDays(new Date(booking.endDate), new Date(booking.startDate));
            
            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-secondary border-b">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{booking.equipmentName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={daysInfo.variant}>
                          {daysInfo.text}
                        </Badge>
                        <Badge variant="outline">
                          {rentalDuration} day rental
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="gradient"
                      size="sm"
                      onClick={() => handleCompleteRental(booking.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Returned
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Customer Details
                      </h4>
                      <div className="space-y-3 ml-6">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{booking.customerEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Rental Period
                      </h4>
                      <div className="space-y-3 ml-6">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Pickup Date</p>
                          <p className="font-medium">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Return Date</p>
                          <p className="font-medium">
                            {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Tracker */}
                  {booking.invoice && (
                    <div className="mt-6 pt-6 border-t">
                      <PaymentTracker booking={booking} />
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Booking ID: {booking.id}</span>
                      <span>•</span>
                      <span>Created {format(new Date(booking.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      ₹{booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Complete Rental Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Rental as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the equipment as returned and release the payment to your account.
              Make sure you have received the equipment back in good condition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBooking(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
