import React from 'react';
import { DollarSign, Clock, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Booking } from '@/store/slices/bookingsSlice';

interface PaymentTrackerProps {
  booking: Booking;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ booking }) => {
  const getPaymentStatus = () => {
    if (!booking.paymentStatus) return 'pending';
    return booking.paymentStatus;
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Payment Pending',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          icon: <Clock className="h-4 w-4" />,
          progress: 25,
          description: 'Waiting for payment confirmation'
        };
      case 'held_in_escrow':
        return {
          label: 'Held in Escrow',
          color: 'bg-blue-500 hover:bg-blue-600',
          icon: <Shield className="h-4 w-4" />,
          progress: 50,
          description: 'Payment secured until delivery confirmation'
        };
      case 'released':
        return {
          label: 'Payment Released',
          color: 'bg-green-500 hover:bg-green-600',
          icon: <CheckCircle className="h-4 w-4" />,
          progress: 100,
          description: 'Payment successfully transferred'
        };
      case 'refunded':
        return {
          label: 'Refunded',
          color: 'bg-purple-500 hover:bg-purple-600',
          icon: <RefreshCw className="h-4 w-4" />,
          progress: 100,
          description: 'Payment refunded to customer'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-500',
          icon: <DollarSign className="h-4 w-4" />,
          progress: 0,
          description: 'Payment status unknown'
        };
    }
  };

  const status = getPaymentStatus();
  const statusDetails = getStatusDetails(status);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Status
          </CardTitle>
          <Badge className={statusDetails.color}>
            {statusDetails.icon}
            <span className="ml-1">{statusDetails.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{statusDetails.progress}%</span>
          </div>
          <Progress value={statusDetails.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{statusDetails.description}</p>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">₹{booking.totalAmount.toLocaleString()}</span>
          </div>
          {booking.paymentDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Date</span>
              <span>{new Date(booking.paymentDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {status === 'held_in_escrow' && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <Shield className="inline h-3 w-3 mr-1" />
              Your payment is secured in escrow and will be released upon successful delivery confirmation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
