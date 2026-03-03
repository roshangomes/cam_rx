import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  startTrip,
  updateTripLocation,
  endTrip,
  setOdometerStart,
  setCurrentLocation,
} from '@/store/slices/transportLogisticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  MapPin,
  Play,
  Square,
  Navigation,
  Gauge,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function TripLoggerPage() {
  const dispatch = useDispatch();
  const { activeTrip, trips, vehicles, currentLocation, isTracking, offlineQueue } = useSelector(
    (state: RootState) => state.transportLogistics
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [odometerStart, setOdometerStartValue] = useState('');
  const [odometerEnd, setOdometerEndValue] = useState('');
  const [endTripDialogOpen, setEndTripDialogOpen] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  const isOnline = navigator.onLine;
  
  // Get current GPS location
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }, []);
  
  // GPS tracking interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isTracking && activeTrip) {
      // Update location every 60 seconds
      intervalId = setInterval(async () => {
        try {
          const position = await getCurrentLocation();
          dispatch(updateTripLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('GPS tracking error:', error);
        }
      }, 60000); // 60 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, activeTrip, dispatch, getCurrentLocation]);
  
  const handleStartTrip = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    
    try {
      setGpsError(null);
      const position = await getCurrentLocation();
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      
      dispatch(startTrip({
        vehicleId: selectedVehicle,
        vehicleName: vehicle?.name || 'Unknown Vehicle',
        driverId: user?.id || 'anonymous',
        driverName: user?.name || user?.email || 'Unknown Driver',
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        },
      }));
      
      if (odometerStart) {
        dispatch(setOdometerStart(parseFloat(odometerStart)));
      }
      
      toast.success('Trip started - GPS tracking active');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to get GPS location';
      setGpsError(errorMessage);
      toast.error('Failed to get GPS location');
    }
  };
  
  const handleEndTrip = async () => {
    if (!odometerEnd) {
      toast.error('Please enter odometer reading');
      return;
    }
    
    try {
      const position = await getCurrentLocation();
      
      dispatch(endTrip({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        },
        odometerReading: parseFloat(odometerEnd),
      }));
      
      setEndTripDialogOpen(false);
      setOdometerEndValue('');
      setSelectedVehicle('');
      setOdometerStartValue('');
      toast.success('Trip completed and saved');
    } catch (error) {
      toast.error('Failed to get GPS location for trip end');
    }
  };
  
  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trip Logger</h1>
          <p className="text-muted-foreground">GPS-verified vehicle movement tracking</p>
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
          {offlineQueue.filter(q => q.type === 'trip').length > 0 && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {offlineQueue.filter(q => q.type === 'trip').length} pending sync
            </Badge>
          )}
        </div>
      </div>
      
      {/* Active Trip Card */}
      {activeTrip ? (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <div className="relative">
                <Navigation className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              Trip in Progress
            </CardTitle>
            <CardDescription>{activeTrip.vehicleName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Started</div>
                <div className="font-medium">
                  {new Date(activeTrip.startTimestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="font-medium">{formatDuration(activeTrip.startTimestamp)}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">GPS Points</div>
                <div className="font-medium">{activeTrip.gpsTrackingPoints.length}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Tracking</div>
                <div className="font-medium text-green-500">Active</div>
              </div>
            </div>
            
            {currentLocation && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Current Location</div>
                <div className="font-mono text-sm">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </div>
              </div>
            )}
            
            <Button
              size="lg"
              variant="destructive"
              className="w-full"
              onClick={() => setEndTripDialogOpen(true)}
            >
              <Square className="w-4 h-4 mr-2" />
              End Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start New Trip
            </CardTitle>
            <CardDescription>Select a vehicle to begin GPS tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        {vehicle.name} ({vehicle.registrationNumber})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                Odometer Reading (optional)
              </Label>
              <Input
                type="number"
                placeholder="Enter current odometer reading"
                value={odometerStart}
                onChange={(e) => setOdometerStartValue(e.target.value)}
              />
            </div>
            
            {gpsError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {gpsError}
              </div>
            )}
            
            <Button
              size="lg"
              className="w-full"
              onClick={handleStartTrip}
              disabled={!selectedVehicle}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Trip
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Trip History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>{trips.length} trips recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trips recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...trips].reverse().slice(0, 10).map(trip => (
                <div
                  key={trip.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">{trip.vehicleName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {trip.distanceKm ? `${trip.distanceKm} km` : 'Distance N/A'}
                      </Badge>
                      {trip.syncedToServer ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start:</span>
                      <br />
                      {new Date(trip.startTimestamp).toLocaleString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span>
                      <br />
                      {trip.endTimestamp
                        ? new Date(trip.endTimestamp).toLocaleString()
                        : 'In progress'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <br />
                      {formatDuration(trip.startTimestamp, trip.endTimestamp)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">GPS Points:</span>
                      <br />
                      {trip.gpsTrackingPoints.length}
                    </div>
                  </div>
                  
                  {trip.odometerStart && trip.odometerEnd && (
                    <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                      <Gauge className="w-4 h-4 inline mr-2" />
                      Odometer: {trip.odometerStart} → {trip.odometerEnd} km
                      ({trip.odometerEnd - trip.odometerStart} km driven)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* End Trip Dialog */}
      <Dialog open={endTripDialogOpen} onOpenChange={setEndTripDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Trip</DialogTitle>
            <DialogDescription>
              Enter the current odometer reading to complete the trip
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                Odometer Reading *
              </Label>
              <Input
                type="number"
                placeholder="Enter current odometer reading"
                value={odometerEnd}
                onChange={(e) => setOdometerEndValue(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This reading will be validated against GPS distance for accuracy
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndTripDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEndTrip} disabled={!odometerEnd}>
              <Square className="w-4 h-4 mr-2" />
              End Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
