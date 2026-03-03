import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedRatingModal } from '@/components/ratings/EnhancedRatingModal';
import { InvoiceCard } from '@/components/bookings/InvoiceCard';
import { PaymentTracker } from '@/components/bookings/PaymentTracker';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import canonR5 from '@/assets/canon-eos-r5.jpg';
import sonyA7s3 from '@/assets/sony-a7s3.jpg';
import arriSkypanel from '@/assets/arri-skypanel.jpg';
import djiRonin from '@/assets/dji-ronin-4d.jpg';

export const MyBookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const { bookings: storeBookings } = useSelector((state: RootState) => state.bookings);

  const bookings = [
    {
      id: '1',
      equipment: 'Canon EOS R5',
      vendor: 'Pro Rental Co.',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'confirmed',
      totalAmount: 450,
      dailyRate: 150,
      image: canonR5,
      location: 'Downtown Studio',
      bookingDate: '2024-01-10'
    },
    {
      id: '2',
      equipment: 'DJI Ronin 4D',
      vendor: 'Motion Pictures',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      status: 'pending',
      totalAmount: 600,
      dailyRate: 200,
      image: djiRonin,
      location: 'West Side Location',
      bookingDate: '2024-01-12'
    },
    {
      id: '3',
      equipment: 'Sony A7S III',
      vendor: 'Film Studio Gear',
      startDate: '2024-01-05',
      endDate: '2024-01-07',
      status: 'completed',
      totalAmount: 420,
      dailyRate: 140,
      image: sonyA7s3,
      location: 'North End Studio',
      bookingDate: '2024-01-01',
      rating: 5,
      review: 'Excellent camera, worked perfectly for our shoot!'
    },
    {
      id: '4',
      equipment: 'Arri SkyPanel S60-C',
      vendor: 'Lighting Masters',
      startDate: '2023-12-20',
      endDate: '2023-12-22',
      status: 'completed',
      totalAmount: 360,
      dailyRate: 120,
      image: arriSkypanel,
      location: 'Central Studio',
      bookingDate: '2023-12-15',
      rating: 4,
      review: 'Great lighting equipment, professional quality.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const filterBookings = (status: string) => {
    switch (status) {
      case 'active':
        return bookings.filter(b => ['confirmed', 'pending'].includes(b.status));
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'all':
        return bookings;
      default:
        return bookings;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-warning text-warning' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const handleLeaveReview = (booking: any) => {
    setSelectedBooking(booking);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          Track and manage your equipment rentals
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({filterBookings('active').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filterBookings('completed').length})</TabsTrigger>
          <TabsTrigger value="all">All Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filterBookings(activeTab).map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Equipment Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={booking.image}
                      alt={booking.equipment}
                      className="w-full lg:w-48 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{booking.equipment}</h3>
                        <p className="text-muted-foreground">{booking.vendor}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {calculateDays(booking.startDate, booking.endDate)} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">₹{booking.totalAmount}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{booking.dailyRate}/day
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 lg:mt-0">
                        {booking.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact Vendor
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact Vendor
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </>
                        )}
                        {booking.status === 'completed' && !booking.rating && (
                          <Button 
                            className="bg-gradient-primary" 
                            size="sm"
                            onClick={() => handleLeaveReview(booking)}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Leave Review
                          </Button>
                        )}
                        {booking.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            Book Again
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Review Section for Completed Bookings */}
                    {booking.status === 'completed' && booking.rating && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Your Review:</span>
                          <div className="flex gap-1">
                            {renderStars(booking.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.review}</p>
                      </div>
                    )}
                  </div>

                  {/* Invoice & Payment Section - Check Redux store */}
                  {(() => {
                    const storeBooking = storeBookings.find(b => b.id === booking.id);
                    return storeBooking?.invoice ? (
                      <div className="lg:w-80 space-y-4">
                        <InvoiceCard 
                          invoice={storeBooking.invoice}
                          customerName={booking.vendor}
                          equipmentName={booking.equipment}
                        />
                        <PaymentTracker booking={storeBooking} />
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}

          {filterBookings(activeTab).length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'active' 
                    ? "You don't have any active bookings at the moment"
                    : "You haven't completed any bookings yet"
                  }
                </p>
                <Button className="bg-gradient-primary" asChild>
                  <a href="/customer/browse">Browse Equipment</a>
                </Button>
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
          equipmentName={selectedBooking.equipment}
          otherPartyName={selectedBooking.vendor}
          userRole="renter"
        />
      )}
    </div>
  );
};