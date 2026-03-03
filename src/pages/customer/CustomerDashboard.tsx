import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Camera, Star, Calendar, TrendingUp, Search, Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/store/store';
import canonR5 from '@/assets/canon-eos-r5.jpg';
import sonyA7s3 from '@/assets/sony-a7s3.jpg';
import arriSkypanel from '@/assets/arri-skypanel.jpg';

export const CustomerDashboard: React.FC = () => {
  const { items: favorites } = useSelector((state: RootState) => state.favorites);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const featuredEquipment = [
    {
      id: '1',
      name: 'Canon EOS R5',
      category: 'Camera',
      dailyRate: 150,
      rating: 4.9,
      image: canonR5,
      vendor: 'Pro Rental Co.'
    },
    {
      id: '2',
      name: 'Sony FX6',
      category: 'Camera',
      dailyRate: 200,
      rating: 4.8,
      image: sonyA7s3,
      vendor: 'Film Studio Gear'
    },
    {
      id: '3',
      name: 'Arri SkyPanel S60-C',
      category: 'Lighting',
      dailyRate: 80,
      rating: 4.9,
      image: arriSkypanel,
      vendor: 'Lighting Masters'
    }
  ];

  const recentBookings = [
    {
      id: '1',
      equipment: 'Sony A7S III',
      dates: 'Jan 15-17, 2024',
      status: 'confirmed',
      total: 450
    },
    {
      id: '2',
      equipment: 'DJI Ronin 4D',
      dates: 'Jan 10-12, 2024',
      status: 'completed',
      total: 300
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Discover and rent professional filmmaking equipment
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground">
              Equipment saved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cartItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to book
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,350</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              Completed rentals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your next rental</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild variant="gradient">
            <Link to="/customer/browse">
              <Search className="mr-2 h-4 w-4" />
              Browse Equipment
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customer/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart ({cartItems.length})
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customer/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Featured Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Equipment</CardTitle>
            <CardDescription>Popular gear available now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredEquipment.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.vendor}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-sm font-medium">₹{item.dailyRate}/day</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/customer/browse">View All Equipment</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest rental activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{booking.equipment}</h4>
                  <p className="text-sm text-muted-foreground">{booking.dates}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                  <p className="text-sm font-medium">₹{booking.total}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/customer/bookings">View All Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};