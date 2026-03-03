import React, { useState } from 'react';
import { Calendar, Clock, User, Package, CheckCircle, XCircle, MapPin, Truck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateBookingStatus, addNotification } from '@/store/slices/bookingsSlice';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { EnhancedRatingModal } from '@/components/ratings/EnhancedRatingModal';
import { generateInvoice } from '@/lib/invoiceGenerator';
import { notifyBookingAccepted, notifyBookingRejected, notifyInvoiceGenerated, notifyPaymentStatus } from '@/lib/notificationSystem';
import { InvoiceCard } from '@/components/bookings/InvoiceCard';
import { PaymentTracker } from '@/components/bookings/PaymentTracker';

export const VendorBookingsPage: React.FC = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const [activeTab, setActiveTab] = useState('pending');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleAccept = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Calculate daily rate from total amount and date range
    const days = Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    ) + 1;
    const dailyRate = booking.totalAmount / days;

    // Generate invoice
    const invoice = generateInvoice(
      booking.id,
      booking.equipmentName,
      booking.customerName,
      booking.startDate,
      booking.endDate,
      dailyRate,
      (booking as any).quantity || 1
    );

    dispatch(updateBookingStatus({ 
      id: bookingId, 
      status: 'confirmed',
      invoice,
      paymentStatus: 'held_in_escrow'
    }));

    // Send notifications and add to history
    const bookingNotif = notifyBookingAccepted(booking.equipmentName, invoice.referenceNumber, bookingId);
    const invoiceNotif = notifyInvoiceGenerated(invoice.referenceNumber, bookingId);
    const paymentNotif = notifyPaymentStatus('held_in_escrow', booking.totalAmount, bookingId);
    
    dispatch(addNotification(bookingNotif));
    dispatch(addNotification(invoiceNotif));
    dispatch(addNotification(paymentNotif));

    toast({
      title: "Booking Accepted ✓",
      description: `Invoice ${invoice.referenceNumber} generated. Payment held in escrow.`,
    });
  };

  const handleReject = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    dispatch(updateBookingStatus({ id: bookingId, status: 'cancelled' }));
    
    if (booking) {
      const rejectNotif = notifyBookingRejected(booking.equipmentName, bookingId);
      dispatch(addNotification(rejectNotif));
    }

    toast({
      title: "Booking Rejected",
      description: "The renter has been notified.",
      variant: "destructive",
    });
  };

  const handleLeaveReview = (booking: any) => {
    setSelectedBooking(booking);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedBooking(null);
  };

  const getFilteredBookings = (filter: string) => {
    switch (filter) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'confirmed':
        return bookings.filter(b => b.status === 'confirmed');
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'all':
        return bookings;
      default:
        return bookings;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const filteredBookings = getFilteredBookings(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
        <p className="text-muted-foreground">
          Manage incoming rental requests and track bookings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{booking.equipmentName}</h3>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{booking.customerName}</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Rental Period</p>
                          <p className="text-muted-foreground">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Quantity</p>
                          <p className="text-muted-foreground">{(booking as any).quantity || 1} unit(s)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(booking as any).deliveryOption === 'delivery' ? (
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="text-sm">
                          <p className="font-medium">Delivery</p>
                          <p className="text-muted-foreground">
                            {(booking as any).deliveryOption === 'delivery' ? 'Home Delivery' : 'Self Pickup'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Requested</p>
                          <p className="text-muted-foreground">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                     <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹{booking.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice & Payment Section */}
                  {(booking.status === 'confirmed' || booking.status === 'completed') && booking.invoice && (
                    <div className="lg:w-80 space-y-4">
                      <InvoiceCard 
                        invoice={booking.invoice}
                        customerName={booking.customerName}
                        equipmentName={booking.equipmentName}
                      />
                      <PaymentTracker booking={booking} />
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex lg:flex-col gap-3 lg:w-48">
                      <Button
                        onClick={() => handleAccept(booking.id)}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(booking.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {booking.status === 'completed' && !(booking as any).vendorReviewed && (
                    <div className="flex lg:flex-col gap-3 lg:w-48">
                      <Button
                        onClick={() => handleLeaveReview(booking)}
                        className="flex-1"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Leave Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBookings.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? "You don't have any pending booking requests"
                    : `No ${activeTab} bookings at the moment`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rating Modal */}
      {selectedBooking && (
        <EnhancedRatingModal
          isOpen={ratingModalOpen}
          onClose={handleCloseRatingModal}
          bookingId={selectedBooking.id}
          equipmentName={selectedBooking.equipmentName}
          otherPartyName={selectedBooking.customerName}
          userRole="vendor"
        />
      )}
    </div>
  );
};
