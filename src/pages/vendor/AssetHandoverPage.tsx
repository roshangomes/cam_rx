import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  startHandover,
  updateHandoverItemStatus,
  setCasePhoto,
  confirmHandover,
  cancelHandover,
  sampleRentalOrders,
  HandoverItemStatus,
} from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Package,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function AssetHandoverPage() {
  const dispatch = useDispatch();
  const { activeHandover, handovers, offlineQueue } = useSelector(
    (state: RootState) => state.cameraDepartment
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState('');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isOnline = navigator.onLine;
  
  const handleStartHandover = () => {
    const order = sampleRentalOrders.find(o => o.id === selectedOrderId);
    if (order) {
      dispatch(startHandover({
        rentalOrderId: order.id,
        items: order.items,
      }));
      toast.success('Handover started');
    }
  };
  
  const handleSwipeAction = (itemId: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      dispatch(updateHandoverItemStatus({ itemId, status: 'received' }));
      toast.success('Item marked as received');
      // Auto-advance to next item
      if (activeHandover && currentItemIndex < activeHandover.items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
      }
    } else {
      setCurrentItemId(itemId);
      setIssueDialogOpen(true);
    }
  };
  
  const handleIssueSubmit = () => {
    if (!issueDescription.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    dispatch(updateHandoverItemStatus({
      itemId: currentItemId,
      status: 'issue',
      issueDescription: issueDescription,
    }));
    setIssueDialogOpen(false);
    setIssueDescription('');
    toast.warning('Issue reported');
    // Auto-advance to next item
    if (activeHandover && currentItemIndex < activeHandover.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    }
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setCasePhoto(reader.result as string));
        toast.success('Case photo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleConfirm = () => {
    dispatch(confirmHandover({ userId: user?.id || 'anonymous' }));
    toast.success('Handover confirmed and saved');
  };
  
  const handleCancel = () => {
    dispatch(cancelHandover());
    setCurrentItemIndex(0);
    toast.info('Handover cancelled');
  };
  
  const allItemsProcessed = activeHandover?.items.every(i => i.status !== 'pending') ?? false;
  const hasPhoto = !!activeHandover?.casePhoto;
  const canConfirm = allItemsProcessed && hasPhoto;
  
  const getStatusBadge = (status: HandoverItemStatus) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Received</Badge>;
      case 'issue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Issue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Handover</h1>
          <p className="text-muted-foreground">Digital manifesto for equipment receipt</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-green-500/20 text-green-400">
              <Wifi className="w-3 h-3 mr-1" /> Online
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400">
              <WifiOff className="w-3 h-3 mr-1" /> Offline
            </Badge>
          )}
          {offlineQueue.length > 0 && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" /> {offlineQueue.length} pending sync
            </Badge>
          )}
        </div>
      </div>
      
      {!activeHandover ? (
        <>
          {/* Select Rental Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Start New Handover
              </CardTitle>
              <CardDescription>Select an approved rental order to begin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rental Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rental order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleRentalOrders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {order.items.length} items
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedOrderId && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium">Items in this order:</h4>
                  {sampleRentalOrders.find(o => o.id === selectedOrderId)?.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <Button onClick={handleStartHandover} disabled={!selectedOrderId} className="w-full">
                Start Handover
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Handovers */}
          {handovers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Handovers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {handovers.slice(-5).reverse().map(handover => (
                    <div
                      key={handover.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{handover.rentalOrderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(handover.confirmedAt!).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">
                          {handover.items.filter(i => i.status === 'received').length} received
                        </Badge>
                        {handover.items.some(i => i.status === 'issue') && (
                          <Badge className="bg-red-500/20 text-red-400">
                            {handover.items.filter(i => i.status === 'issue').length} issues
                          </Badge>
                        )}
                        {handover.syncedToServer ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Active Handover - Swipeable Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order: {activeHandover.rentalOrderId}</span>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </CardTitle>
              <CardDescription>
                Swipe right for RECEIVED, left for ISSUE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>
                    {activeHandover.items.filter(i => i.status !== 'pending').length} / {activeHandover.items.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(activeHandover.items.filter(i => i.status !== 'pending').length / activeHandover.items.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              
              {/* Current Item Card */}
              <div className="relative">
                {activeHandover.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`${index === currentItemIndex ? 'block' : 'hidden'}`}
                  >
                    <div className="p-6 bg-muted/50 rounded-xl border-2 border-border">
                      <div className="flex items-center justify-between mb-4">
                        <Camera className="w-12 h-12 text-primary" />
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      <p className="text-muted-foreground mb-1">
                        Category: {item.category}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        S/N: {item.serialNumber}
                      </p>
                      
                      {item.status === 'issue' && item.issueDescription && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-400">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            {item.issueDescription}
                          </p>
                        </div>
                      )}
                      
                      {item.status === 'pending' && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleSwipeAction(item.id, 'left')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Issue
                          </Button>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleSwipeAction(item.id, 'right')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Received
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Navigation */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentItemIndex === 0}
                    onClick={() => setCurrentItemIndex(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentItemIndex + 1} of {activeHandover.items.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentItemIndex === activeHandover.items.length - 1}
                    onClick={() => setCurrentItemIndex(prev => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Item List Overview */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeHandover.items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentItemIndex(index)}
                    className={`p-2 rounded-lg text-xs text-center transition-all ${
                      index === currentItemIndex
                        ? 'bg-primary text-primary-foreground'
                        : item.status === 'received'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'issue'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Case Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Case Photo
              </CardTitle>
              <CardDescription>
                Mandatory: Upload a wide-angle photo of open gear cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {activeHandover.casePhoto ? (
                <div className="relative">
                  <img
                    src={activeHandover.casePhoto}
                    alt="Case photo"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Retake
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p>Tap to capture case photo</p>
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Confirm Button */}
          <Button
            size="lg"
            className="w-full"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {!allItemsProcessed
              ? 'Process all items first'
              : !hasPhoto
              ? 'Upload case photo first'
              : 'Confirm Handover'}
          </Button>
        </>
      )}
      
      {/* Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>
              Please describe the issue with this item (missing, damaged, etc.)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleIssueSubmit}>
              Report Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
