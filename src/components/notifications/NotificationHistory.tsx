import React from 'react';
import { Bell, CheckCircle, XCircle, FileText, DollarSign, X, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { markNotificationRead, markAllNotificationsRead } from '@/store/slices/bookingsSlice';
import { formatDistanceToNow } from 'date-fns';
import { downloadInvoice } from '@/lib/invoiceGenerator';

export const NotificationHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, bookings } = useSelector((state: RootState) => state.bookings);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'booking_rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'invoice_generated':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'payment_status':
        return <DollarSign className="h-5 w-5 text-accent" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDownloadInvoice = (notification: typeof notifications[0]) => {
    if (notification.bookingId) {
      const booking = bookings.find(b => b.id === notification.bookingId);
      if (booking?.invoice) {
        downloadInvoice(booking.invoice, booking.customerName, booking.equipmentName);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${
                    !notification.read ? 'bg-accent/5 border-accent/20' : 'bg-card'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {notification.invoiceRef && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              Invoice: {notification.invoiceRef}
                            </Badge>
                            {notification.type === 'invoice_generated' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(notification)}
                                className="h-7 gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download PDF
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
