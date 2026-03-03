import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  addToRFQCart,
  removeFromRFQCart,
  updateRFQCartQuantity,
  clearRFQCart,
  submitRFQ,
  quoteRFQ,
  updateRFQStatus,
  seedEquipmentDatabase,
  RFQStatus,
} from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  Filter,
} from 'lucide-react';

export default function RFQPage() {
  const dispatch = useDispatch();
  const { rfqCart, rfqs } = useSelector((state: RootState) => state.cameraDepartment);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<string>('');
  const [quoteCost, setQuoteCost] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const categories = ['all', ...new Set(seedEquipmentDatabase.map(e => e.category))];
  
  const filteredEquipment = seedEquipmentDatabase.filter(eq => {
    const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const handleAddToCart = (equipment: typeof seedEquipmentDatabase[0]) => {
    dispatch(addToRFQCart({
      id: `cart-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      category: equipment.category,
      quantity: 1,
      dailyRate: equipment.dailyRate,
    }));
    toast.success(`Added ${equipment.name} to cart`);
  };
  
  const handleQuantityChange = (equipmentId: string, delta: number) => {
    const item = rfqCart.find(i => i.equipmentId === equipmentId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        dispatch(removeFromRFQCart(equipmentId));
      } else {
        dispatch(updateRFQCartQuantity({ equipmentId, quantity: newQty }));
      }
    }
  };
  
  const handleSubmitRFQ = () => {
    if (!startDate || !endDate) {
      toast.error('Please select rental dates');
      return;
    }
    if (rfqCart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    dispatch(submitRFQ({
      customerId: user?.id || 'anonymous',
      customerName: user?.name || user?.email || 'Guest User',
      startDate,
      endDate,
    }));
    toast.success('RFQ submitted successfully');
  };
  
  const handleOpenQuoteDialog = (rfqId: string) => {
    setSelectedRFQ(rfqId);
    setQuoteDialogOpen(true);
  };
  
  const handleSubmitQuote = () => {
    if (!quoteCost || parseFloat(quoteCost) <= 0) {
      toast.error('Please enter a valid cost');
      return;
    }
    
    dispatch(quoteRFQ({
      rfqId: selectedRFQ,
      totalCost: parseFloat(quoteCost),
      notes: quoteNotes,
    }));
    setQuoteDialogOpen(false);
    setQuoteCost('');
    setQuoteNotes('');
    toast.success('Quote submitted to customer');
  };
  
  const getStatusBadge = (status: RFQStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'quoted':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><FileText className="w-3 h-3 mr-1" />Quoted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const cartTotal = rfqCart.reduce((sum, item) => sum + (item.dailyRate || 0) * item.quantity, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rental Request & Quotes</h1>
        <p className="text-muted-foreground">Browse equipment and manage RFQs</p>
      </div>
      
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Equipment</TabsTrigger>
          <TabsTrigger value="cart">
            Cart ({rfqCart.length})
          </TabsTrigger>
          <TabsTrigger value="rfqs">
            RFQ Dashboard
          </TabsTrigger>
        </TabsList>
        
        {/* Browse Equipment */}
        <TabsContent value="browse" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(equipment => {
              const inCart = rfqCart.find(i => i.equipmentId === equipment.id);
              return (
                <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{equipment.name}</h3>
                        <Badge variant="outline" className="mt-1">{equipment.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-lg font-bold text-primary">
                        <IndianRupee className="w-4 h-4" />
                        {equipment.dailyRate.toLocaleString()}/day
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(equipment.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{inCart.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(equipment.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleAddToCart(equipment)}>
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Cart */}
        <TabsContent value="cart" className="space-y-4">
          {rfqCart.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground">Browse equipment and add items to request a quote</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rfqCart.map(item => (
                    <div
                      key={item.equipmentId}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{item.equipmentName}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.equipmentId, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.equipmentId, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="font-medium flex items-center justify-end">
                            <IndianRupee className="w-3 h-3" />
                            {((item.dailyRate || 0) * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">/day</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => dispatch(removeFromRFQCart(item.equipmentId))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-semibold">Daily Total</span>
                    <span className="text-2xl font-bold flex items-center text-primary">
                      <IndianRupee className="w-5 h-5" />
                      {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Rental Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => dispatch(clearRFQCart())}
                    >
                      Clear Cart
                    </Button>
                    <Button className="flex-1" onClick={handleSubmitRFQ}>
                      <Send className="w-4 h-4 mr-2" />
                      Submit RFQ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* RFQ Dashboard (Vendor) */}
        <TabsContent value="rfqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incoming RFQs</CardTitle>
              <CardDescription>Review and quote rental requests</CardDescription>
            </CardHeader>
            <CardContent>
              {rfqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No RFQs received yet
                </div>
              ) : (
                <div className="space-y-4">
                  {rfqs.map(rfq => (
                    <div
                      key={rfq.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{rfq.id}</h4>
                          <p className="text-sm text-muted-foreground">{rfq.customerName}</p>
                        </div>
                        {getStatusBadge(rfq.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {rfq.rentalStartDate} to {rfq.rentalEndDate}
                        </span>
                        <span>{rfq.items.length} items</span>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                        {rfq.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.equipmentName}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      {rfq.totalCost && (
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                          <span className="font-medium">Quoted Price</span>
                          <span className="text-lg font-bold flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {rfq.totalCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {rfq.status === 'pending' && (
                        <Button
                          className="w-full"
                          onClick={() => handleOpenQuoteDialog(rfq.id)}
                        >
                          Provide Quote
                        </Button>
                      )}
                      
                      {rfq.status === 'quoted' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => dispatch(updateRFQStatus({ rfqId: rfq.id, status: 'rejected' }))}
                          >
                            Reject
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => dispatch(updateRFQStatus({ rfqId: rfq.id, status: 'accepted' }))}
                          >
                            Accept Quote
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Quote Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Quote</DialogTitle>
            <DialogDescription>
              Enter the total cost for this rental request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Total Cost (₹)</Label>
              <Input
                type="number"
                placeholder="Enter total cost"
                value={quoteCost}
                onChange={(e) => setQuoteCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes for the customer..."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuote}>
              Submit Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
