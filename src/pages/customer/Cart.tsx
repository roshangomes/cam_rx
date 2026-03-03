import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/store/store';
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { BookingModal } from '@/components/bookings/BookingModal';
import { useToast } from '@/hooks/use-toast';

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items } = useSelector((state: RootState) => state.cart);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.dailyRate * item.quantity), 0);
  };

  const handleRemoveItem = (equipmentId: string) => {
    dispatch(removeFromCart(equipmentId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleUpdateQuantity = (equipmentId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ equipmentId, quantity: newQuantity }));
  };

  const handleBookItem = (item: any) => {
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

  const handleClearCart = () => {
    dispatch(clearCart());
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">Your cart items</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Browse our equipment catalog and add items to your cart
            </p>
            <Button variant="gradient" asChild>
              <Link to="/customer/browse">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Equipment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">{items.length} item(s) in your cart</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.equipmentId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.vendor}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.equipmentId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.equipmentId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.equipmentId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{item.dailyRate * item.quantity}/day
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.dailyRate} each
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleBookItem(item)}
                    >
                      Book This Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.equipmentId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.dailyRate * item.quantity}/day</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Subtotal (per day)</span>
                <span className="text-primary">₹{calculateSubtotal()}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                * Final price will be calculated based on rental duration
              </p>

              <Button variant="gradient" className="w-full" asChild>
                <Link to="/customer/browse">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEquipment && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
        />
      )}
    </div>
  );
};
