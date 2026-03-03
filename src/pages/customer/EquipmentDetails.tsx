import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, Star, Heart, ShoppingCart, Calendar, MapPin, 
  Shield, Clock, Package, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BookingModal } from '@/components/bookings/BookingModal';
import { VendorRatingBadge } from '@/components/ratings/VendorRatingBadge';
import { KycBadge } from '@/components/kyc/KycBadge';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';
import canonR5 from '@/assets/canon-eos-r5.jpg';
import sonyA7s3 from '@/assets/sony-a7s3.jpg';
import canon2470 from '@/assets/canon-24-70mm.jpg';
import arriSkypanel from '@/assets/arri-skypanel.jpg';
import rodeVideomic from '@/assets/rode-videomic.jpg';
import djiRonin from '@/assets/dji-ronin-4d.jpg';

// Equipment database
const equipmentData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Canon EOS R5',
    brand: 'Canon',
    category: 'cameras',
    dailyRate: 150,
    weeklyRate: 900,
    rating: 4.9,
    reviewCount: 42,
    availability: 'available',
    images: [canonR5],
    vendor: 'Pro Rental Co.',
    vendorVerified: true,
    description: '45MP Full-Frame Mirrorless Camera with 8K Video',
    longDescription: 'The Canon EOS R5 is a professional full-frame mirrorless camera that offers stunning 45MP resolution and groundbreaking 8K RAW video recording capabilities. Perfect for both stills and video production.',
    specifications: {
      'Sensor': '45MP Full-Frame CMOS',
      'Video': '8K RAW, 4K 120fps',
      'Autofocus': 'Dual Pixel CMOS AF II',
      'ISO Range': '100-51200',
      'Stabilization': '8-stop IBIS',
      'Storage': 'CFexpress + SD UHS-II',
    },
    accessories: ['Battery', 'Charger', 'Strap', 'Body Cap'],
    location: 'Mumbai, Maharashtra',
  },
  '2': {
    id: '2',
    name: 'Sony A7S III',
    brand: 'Sony',
    category: 'cameras',
    dailyRate: 140,
    weeklyRate: 840,
    rating: 4.8,
    reviewCount: 38,
    availability: 'available',
    images: [sonyA7s3],
    vendor: 'Film Studio Gear',
    vendorVerified: true,
    description: '4K Full-Frame Mirrorless Camera for Video',
    longDescription: 'The Sony A7S III is the ultimate low-light video camera with exceptional 4K 120fps recording and industry-leading autofocus performance.',
    specifications: {
      'Sensor': '12.1MP Full-Frame BSI CMOS',
      'Video': '4K 120fps, 10-bit 4:2:2',
      'Autofocus': 'Real-time Eye AF',
      'ISO Range': '80-102400 (Expandable)',
      'Stabilization': '5.5-stop IBIS',
      'Storage': 'Dual CFexpress/SD',
    },
    accessories: ['Battery', 'Charger', 'USB-C Cable'],
    location: 'Delhi NCR',
  },
  '3': {
    id: '3',
    name: 'Canon 24-70mm f/2.8L',
    brand: 'Canon',
    category: 'lenses',
    dailyRate: 80,
    weeklyRate: 480,
    rating: 4.9,
    reviewCount: 56,
    availability: 'available',
    images: [canon2470],
    vendor: 'Lens Masters',
    vendorVerified: true,
    description: 'Professional Standard Zoom Lens',
    longDescription: 'The Canon EF 24-70mm f/2.8L II USM is a professional standard zoom lens offering exceptional sharpness and versatility.',
    specifications: {
      'Mount': 'Canon RF',
      'Aperture': 'f/2.8 constant',
      'Focal Length': '24-70mm',
      'Filter Size': '82mm',
      'Stabilization': 'Optical IS',
      'Weight': '900g',
    },
    accessories: ['Lens Hood', 'Front/Rear Caps', 'Soft Case'],
    location: 'Bangalore, Karnataka',
  },
  '4': {
    id: '4',
    name: 'Arri SkyPanel S60-C',
    brand: 'Arri',
    category: 'lighting',
    dailyRate: 120,
    weeklyRate: 720,
    rating: 4.9,
    reviewCount: 24,
    availability: 'available',
    images: [arriSkypanel],
    vendor: 'Lighting Masters',
    vendorVerified: true,
    description: 'Full-Color LED Panel with Remote Control',
    longDescription: 'The ARRI SkyPanel S60-C is a professional LED soft light with full RGB+W color mixing capability.',
    specifications: {
      'Output': '1480 lux at 3m',
      'Color Range': 'Full RGB+W',
      'CCT Range': '2800K-10000K',
      'CRI': '95+',
      'Power': '358W',
      'Control': 'DMX, WiFi, Manual',
    },
    accessories: ['Power Cable', 'Yoke Mount', 'Diffusion Panel'],
    location: 'Chennai, Tamil Nadu',
  },
  '5': {
    id: '5',
    name: 'Rode VideoMic Pro+',
    brand: 'Rode',
    category: 'audio',
    dailyRate: 35,
    weeklyRate: 210,
    rating: 4.7,
    reviewCount: 31,
    availability: 'rented',
    images: [rodeVideomic],
    vendor: 'Sound Solutions',
    vendorVerified: false,
    description: 'Professional On-Camera Microphone',
    longDescription: 'The RØDE VideoMic Pro+ is a premium on-camera shotgun microphone with exceptional audio quality.',
    specifications: {
      'Type': 'Shotgun Condenser',
      'Pattern': 'Super-cardioid',
      'Frequency': '20Hz-20kHz',
      'Output': '3.5mm TRS',
      'Power': 'LB-1 Battery / USB',
      'Features': 'High-pass filter, -10dB pad',
    },
    accessories: ['Windshield', 'Shock Mount', 'Cable'],
    location: 'Hyderabad, Telangana',
  },
  '6': {
    id: '6',
    name: 'DJI Ronin 4D',
    brand: 'DJI',
    category: 'stabilization',
    dailyRate: 200,
    weeklyRate: 1200,
    rating: 4.8,
    reviewCount: 19,
    availability: 'available',
    images: [djiRonin],
    vendor: 'Motion Pictures',
    vendorVerified: true,
    description: 'Cinema Camera Gimbal System',
    longDescription: 'The DJI Ronin 4D is a revolutionary 4-axis cinema camera with built-in gimbal stabilization.',
    specifications: {
      'Sensor': 'Full-Frame 6K',
      'Stabilization': '4-axis active gimbal',
      'Video': '6K ProRes, 4K 120fps',
      'Autofocus': 'LiDAR Focus',
      'Transmission': 'O3 Pro',
      'Recording': 'Internal 1TB SSD',
    },
    accessories: ['Hand Grips', 'Focus Motor', 'Monitor', 'Batteries x2'],
    location: 'Pune, Maharashtra',
  },
};

export const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { items: favorites } = useSelector((state: RootState) => state.favorites);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const equipment = id ? equipmentData[id] : null;

  if (!equipment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-semibold mb-2">Equipment Not Found</h3>
            <p className="text-muted-foreground mb-4">The equipment you're looking for doesn't exist.</p>
            <Button variant="gradient" asChild>
              <Link to="/customer/browse">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Browse
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFavorite = favorites.some(f => f.equipmentId === equipment.id);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: `cart-${equipment.id}`,
      equipmentId: equipment.id,
      name: equipment.name,
      brand: equipment.brand,
      vendor: equipment.vendor,
      dailyRate: equipment.dailyRate,
      weeklyRate: equipment.weeklyRate,
      image: equipment.images[0],
      category: equipment.category,
    }));
    toast({
      title: "Added to Cart",
      description: `${equipment.name} has been added to your cart.`,
    });
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite({
      equipmentId: equipment.id,
      name: equipment.name,
      brand: equipment.brand,
      vendor: equipment.vendor,
      category: equipment.category,
      dailyRate: equipment.dailyRate,
      weeklyRate: equipment.weeklyRate,
      rating: equipment.rating,
      reviewCount: equipment.reviewCount,
      image: equipment.images[0],
      availability: equipment.availability,
      description: equipment.description,
    }));
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorite 
        ? `${equipment.name} has been removed from your favorites.`
        : `${equipment.name} has been added to your favorites.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/customer/browse">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={equipment.images[currentImageIndex]}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
            <Badge 
              className={`absolute top-4 left-4 ${
                equipment.availability === 'available' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {equipment.availability === 'available' ? 'Available' : 'Currently Rented'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-4 right-4 bg-background/80 hover:bg-background ${
                isFavorite ? 'text-red-500' : ''
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            {equipment.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : equipment.images.length - 1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={() => setCurrentImageIndex(i => i < equipment.images.length - 1 ? i + 1 : 0)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {equipment.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {equipment.images.map((img: string, index: number) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Equipment Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{equipment.category}</Badge>
              <Badge variant="outline">{equipment.brand}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{equipment.name}</h1>
            <p className="text-muted-foreground mt-2">{equipment.description}</p>
          </div>

          {/* Vendor Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    {equipment.vendor.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{equipment.vendor}</span>
                      {equipment.vendorVerified && <KycBadge isVerified={true} />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {equipment.location}
                    </div>
                  </div>
                </div>
                <VendorRatingBadge rating={equipment.rating} reviewCount={equipment.reviewCount} />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">₹{equipment.dailyRate}</p>
                  <p className="text-sm text-muted-foreground">per day</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-foreground">₹{equipment.weeklyRate}</p>
                  <p className="text-sm text-muted-foreground">per week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="gradient"
              size="lg"
              className="flex-1"
              disabled={equipment.availability !== 'available'}
              onClick={() => setBookingModalOpen(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {equipment.availability === 'available' ? 'Book Now' : 'Currently Unavailable'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddToCart}
              disabled={equipment.availability !== 'available'}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Insured</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">24/7 Support</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Free Pickup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="accessories">Included</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({equipment.reviewCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{equipment.longDescription}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-foreground">{key}</span>
                    <span className="text-muted-foreground">{value as string}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessories" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Included Accessories</h3>
              <ul className="grid gap-2 md:grid-cols-2">
                {equipment.accessories.map((accessory: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {accessory}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{equipment.rating}</p>
                  <div className="flex gap-1 justify-center my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(equipment.rating)
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{equipment.reviewCount} reviews</p>
                </div>
              </div>
              <Separator />
              <p className="text-center text-muted-foreground py-8">
                Reviews will be displayed here once you connect a backend database.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        equipment={{
          id: equipment.id,
          name: equipment.name,
          vendor: equipment.vendor,
          dailyRate: equipment.dailyRate,
          weeklyRate: equipment.weeklyRate,
          image: equipment.images[0],
        }}
      />
    </div>
  );
};
