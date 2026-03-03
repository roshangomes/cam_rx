import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { requestNotificationPermission } from '@/lib/notificationSystem';
import { useToast } from '@/hooks/use-toast';
import { NotificationHistory } from './NotificationHistory';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const NotificationBell: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const { notifications } = useSelector((state: RootState) => state.bookings);
  const { toast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    
    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive updates about your bookings and invoices.",
      });
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {!hasPermission && (
            <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Enable browser notifications to get real-time updates
              </p>
              <Button 
                size="sm" 
                onClick={handleEnableNotifications}
                className="w-full"
              >
                Enable Notifications
              </Button>
            </div>
          )}
          <NotificationHistory />
        </div>
      </SheetContent>
    </Sheet>
  );
};
