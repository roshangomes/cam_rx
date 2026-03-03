import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Calendar, Trash2, Search, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/bookings/BookingModal';
import { RootState } from '@/store/store';
import { removeFromFavorites } from '@/store/slices/favoritesSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { useToast } from '@/hooks/use-toast';

export const Favorites: React.FC = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { items: favorites } = useSelector((state: RootState) => state.favorites);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFavorite = (equipmentId: string, name: string) => {
    dispatch(removeFromFavorites(equipmentId));
    toast({
      title: "Removed from Favorites",
      description: `${name} has been removed from your favorites.`,
    });
  };

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({
      id: `cart-${item.equipmentId}`,
      equipmentId: item.equipmentId,
      name: item.name,
      brand: item.brand,
      vendor: item.vendor,
      dailyRate: item.dailyRate,
      weeklyRate: item.weeklyRate,
      image: item.image,
      category: item.category,
    }));
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleBookNow = (item: any) => {
    setSelectedEquipment({
      id: item.equipmentId,
      name: item.name,
      vendor: item.vendor,
      dailyRate: item.dailyRate,
      weeklyRate: item.weeklyRate,
      image: item.image,
    });
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        <p className="text-muted-foreground mt-2">
          Equipment you've saved for later ({favorites.length} items)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search favorites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No results found'}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {favorites.length === 0 
                ? 'Start adding equipment to your favorites to see them here'
                : 'Try adjusting your search'}
            </p>
            <Link to="/customer/browse">
              <Button variant="gradient">Browse Equipment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  className={`absolute top-2 left-2 ${
                    item.availability === 'available' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {item.availability === 'available' ? 'Available' : 'Rented'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFavorite(item.equipmentId, item.name)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.vendor} • {item.category}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(item.rating)
                            ? 'text-warning'
                            : 'text-muted'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.rating} ({item.reviewCount})
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ₹{item.dailyRate}
                  </span>
                  <span className="text-sm text-muted-foreground">/day</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ₹{item.weeklyRate}/week
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="gradient"
                      className="flex-1"
                      onClick={() => handleBookNow(item)}
                      disabled={item.availability !== 'available'}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {item.availability === 'available' ? 'Book Now' : 'Rented'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.availability !== 'available'}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/customer/equipment/${item.equipmentId}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedEquipment && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          equipment={selectedEquipment}
        />
      )}
    </div>
  );
};
