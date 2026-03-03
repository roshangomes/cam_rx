import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateRFQStatus } from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  IndianRupee,
  Package,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CustomerRFQPage = () => {
  const dispatch = useDispatch();
  const { rfqs } = useSelector((state: RootState) => state.cameraDepartment);
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter RFQs for current customer (in real app, filter by customer ID)
  const customerRfqs = rfqs;

  const pendingRfqs = customerRfqs.filter(r => r.status === 'pending');
  const quotedRfqs = customerRfqs.filter(r => r.status === 'quoted');
  const acceptedRfqs = customerRfqs.filter(r => r.status === 'accepted');
  const rejectedRfqs = customerRfqs.filter(r => r.status === 'rejected');

  const handleAccept = (rfqId: string) => {
    dispatch(updateRFQStatus({ rfqId, status: 'accepted' }));
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(150);
    }
    
    toast.success('Quote accepted! Vendor will be notified.');
  };

  const handleReject = (rfqId: string) => {
    dispatch(updateRFQStatus({ rfqId, status: 'rejected' }));
    toast.info('Quote rejected.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'quoted':
        return <Badge className="bg-amber-500 hover:bg-amber-600"><IndianRupee className="mr-1 h-3 w-3" />Quoted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RFQCard = ({ rfq }: { rfq: typeof rfqs[0] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{rfq.id}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(rfq.rentalStartDate), 'MMM d')} - {format(new Date(rfq.rentalEndDate), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          {getStatusBadge(rfq.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <Package className="h-4 w-4" />
            Items ({rfq.items.length})
          </p>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            {rfq.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.equipmentName}</span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
            ))}
            {rfq.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{rfq.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Quote Details */}
        {rfq.status === 'quoted' && rfq.totalCost && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Quoted Price</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                ₹{rfq.totalCost.toLocaleString()}
              </p>
            </div>
            {rfq.vendorNotes && (
              <p className="text-sm text-muted-foreground">{rfq.vendorNotes}</p>
            )}
          </div>
        )}

        {/* Accepted Quote */}
        {rfq.status === 'accepted' && rfq.totalCost && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">Booking Confirmed</p>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              ₹{rfq.totalCost.toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {rfq.status === 'quoted' && (
          <div className="flex gap-3">
            <Button
              onClick={() => handleAccept(rfq.id)}
              className="flex-1 h-12 min-h-[48px]"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Accept Quote
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReject(rfq.id)}
              className="flex-1 h-12 min-h-[48px]"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Reject
            </Button>
          </div>
        )}

        {/* Created Date */}
        <p className="text-xs text-muted-foreground text-right">
          Submitted {format(new Date(rfq.createdAt), 'MMM d, yyyy h:mm a')}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Quote Requests</h1>
        <p className="text-muted-foreground">
          Track your equipment rental requests and manage quotes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingRfqs.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <IndianRupee className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{quotedRfqs.length}</p>
              <p className="text-xs text-muted-foreground">Quoted</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acceptedRfqs.length}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedRfqs.length}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quoted" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="quoted" className="relative">
            Quoted
            {quotedRfqs.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {quotedRfqs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="quoted">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {quotedRfqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <IndianRupee className="h-12 w-12 mb-4 opacity-50" />
                <p>No quotes to review</p>
              </div>
            ) : (
              quotedRfqs.map(rfq => <RFQCard key={rfq.id} rfq={rfq} />)
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pending">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {pendingRfqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mb-4 opacity-50" />
                <p>No pending requests</p>
              </div>
            ) : (
              pendingRfqs.map(rfq => <RFQCard key={rfq.id} rfq={rfq} />)
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="accepted">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {acceptedRfqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
                <p>No accepted quotes yet</p>
              </div>
            ) : (
              acceptedRfqs.map(rfq => <RFQCard key={rfq.id} rfq={rfq} />)
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {customerRfqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>No RFQs submitted yet</p>
              </div>
            ) : (
              customerRfqs.map(rfq => <RFQCard key={rfq.id} rfq={rfq} />)
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerRFQPage;
