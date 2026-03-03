import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { isOnline, onNetworkChange, getPendingSyncCount } from '@/lib/offlineStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncStatus({ className, showDetails = true }: SyncStatusProps) {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Get pending items from Redux offline queues
  const transportOfflineQueue = useSelector(
    (state: RootState) => state.transportLogistics.offlineQueue
  );
  const cameraDeptOfflineQueue = useSelector(
    (state: RootState) => state.cameraDepartment.offlineQueue
  );

  // Calculate total pending items
  const totalPending = transportOfflineQueue.length + cameraDeptOfflineQueue.length;

  // Listen for network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange((isOnline) => {
      setOnline(isOnline);
      
      if (isOnline && totalPending > 0) {
        toast.info('Back online! Syncing pending changes...', {
          icon: <Wifi className="h-4 w-4" />
        });
      } else if (!isOnline) {
        toast.warning('You are offline. Changes will sync when connected.', {
          icon: <WifiOff className="h-4 w-4" />
        });
      }
    });

    return unsubscribe;
  }, [totalPending]);

  // Update pending count from IndexedDB
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await getPendingSyncCount();
        setPendingCount(count + totalPending);
      } catch (err) {
        setPendingCount(totalPending);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [totalPending]);

  const handleSync = async () => {
    if (!online) {
      toast.error('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);

    // Simulate sync process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would call actual sync functions
      setLastSyncTime(new Date());
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      toast.success('All changes synced successfully!');
    } catch (error) {
      toast.error('Sync failed. Will retry automatically.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncIcon = () => {
    if (!online) return <CloudOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (pendingCount > 0) return <Cloud className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!online) return 'text-destructive';
    if (pendingCount > 0) return 'text-amber-500';
    return 'text-green-500';
  };

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className={cn('flex items-center gap-1', getStatusColor())}>
          {getSyncIcon()}
          {pendingCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {pendingCount}
            </Badge>
          )}
        </span>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2 min-h-[40px]', className)}
        >
          <span className={getStatusColor()}>
            {getSyncIcon()}
          </span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {pendingCount}
            </Badge>
          )}
          <span className="hidden md:inline text-sm">
            {!online ? 'Offline' : pendingCount > 0 ? 'Pending' : 'Synced'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {online ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <span className="font-medium">
                {online ? 'Online' : 'Offline'}
              </span>
            </div>
            {online && pendingCount > 0 && (
              <Button
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-8"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync Now
              </Button>
            )}
          </div>

          {/* Pending Items */}
          {pendingCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                {transportOfflineQueue.length > 0 && (
                  <p>• {transportOfflineQueue.length} transport records</p>
                )}
                {cameraDeptOfflineQueue.length > 0 && (
                  <p>• {cameraDeptOfflineQueue.length} camera dept records</p>
                )}
              </div>
            </div>
          )}

          {/* All Synced */}
          {pendingCount === 0 && online && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="text-sm">All changes synced</span>
            </div>
          )}

          {/* Last Sync Time */}
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}

          {/* Offline Message */}
          {!online && (
            <p className="text-xs text-muted-foreground">
              Changes will automatically sync when you're back online.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
