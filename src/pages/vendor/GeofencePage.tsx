import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  addGeofence,
  updateGeofence,
  toggleGeofence,
  calculateDistance,
} from '@/store/slices/transportLogisticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  MapPin,
  Plus,
  Target,
  Navigation,
  CheckCircle,
  Clock,
  IndianRupee,
  Map,
  Compass,
} from 'lucide-react';

export default function GeofencePage() {
  const dispatch = useDispatch();
  const { geofenceConfigs, outstationTriggers, vehicles, currentLocation } = useSelector(
    (state: RootState) => state.transportLogistics
  );
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    centerLatitude: 19.0760,
    centerLongitude: 72.8777,
    radiusKm: 50,
  });
  
  const handleAddGeofence = () => {
    if (!newGeofence.name) {
      toast.error('Please enter a name');
      return;
    }
    
    dispatch(addGeofence({
      ...newGeofence,
      isActive: true,
    }));
    
    setAddDialogOpen(false);
    setNewGeofence({
      name: '',
      centerLatitude: 19.0760,
      centerLongitude: 72.8777,
      radiusKm: 50,
    });
    toast.success('Geofence added');
  };
  
  const handleToggle = (id: string) => {
    dispatch(toggleGeofence(id));
  };
  
  const getCurrentLocationStatus = (geofence: typeof geofenceConfigs[0]) => {
    if (!currentLocation) return null;
    
    const distance = calculateDistance(
      geofence.centerLatitude,
      geofence.centerLongitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    return {
      distance: distance.toFixed(1),
      isOutside: distance > geofence.radiusKm,
    };
  };
  
  // Group triggers by date
  const triggersByDate = outstationTriggers.reduce((acc, trigger) => {
    const date = new Date(trigger.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(trigger);
    return acc;
  }, {} as Record<string, typeof outstationTriggers>);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Geofence & Outstation</h1>
          <p className="text-muted-foreground">Automated outstation allowance triggers</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Geofence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Geofence Zone</DialogTitle>
              <DialogDescription>
                Define a center point and radius for outstation detection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zone Name</Label>
                <Input
                  placeholder="e.g., Mumbai City Center"
                  value={newGeofence.name}
                  onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newGeofence.centerLatitude}
                    onChange={(e) => setNewGeofence({ ...newGeofence, centerLatitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newGeofence.centerLongitude}
                    onChange={(e) => setNewGeofence({ ...newGeofence, centerLongitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Radius (km)</Label>
                <Input
                  type="number"
                  value={newGeofence.radiusKm}
                  onChange={(e) => setNewGeofence({ ...newGeofence, radiusKm: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGeofence}>Add Geofence</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Current Location */}
      {currentLocation && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Navigation className="w-6 h-6 text-blue-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </div>
              <div>
                <p className="font-medium">Current Location</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{geofenceConfigs.length}</div>
            <div className="text-sm text-muted-foreground">Geofences</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {geofenceConfigs.filter(g => g.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{outstationTriggers.length}</div>
            <div className="text-sm text-muted-foreground">Outstation Triggers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Object.keys(triggersByDate).length}
            </div>
            <div className="text-sm text-muted-foreground">Trigger Days</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Geofence Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Geofence Zones
          </CardTitle>
          <CardDescription>Active zones trigger outstation allowance when crossed</CardDescription>
        </CardHeader>
        <CardContent>
          {geofenceConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No geofence zones configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {geofenceConfigs.map(geofence => {
                const locationStatus = getCurrentLocationStatus(geofence);
                return (
                  <div
                    key={geofence.id}
                    className={`p-4 border rounded-lg ${geofence.isActive ? 'border-green-500/30' : 'border-muted'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${geofence.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <div>
                          <h4 className="font-medium">{geofence.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Radius: {geofence.radiusKm} km
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={geofence.isActive}
                        onCheckedChange={() => handleToggle(geofence.id)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Center:</span>
                        <br />
                        <span className="font-mono">
                          {geofence.centerLatitude.toFixed(4)}, {geofence.centerLongitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Boundary:</span>
                        <br />
                        <span className="font-medium">{geofence.radiusKm} km from center</span>
                      </div>
                    </div>
                    
                    {locationStatus && (
                      <div className={`mt-3 p-2 rounded text-sm ${
                        locationStatus.isOutside 
                          ? 'bg-orange-500/10 text-orange-400' 
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        <Compass className="w-4 h-4 inline mr-2" />
                        {locationStatus.isOutside 
                          ? `Outside zone (${locationStatus.distance} km from center)`
                          : `Inside zone (${locationStatus.distance} km from center)`
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Outstation Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Outstation Allowance Triggers
          </CardTitle>
          <CardDescription>Automatic records when vehicles cross geofence boundaries</CardDescription>
        </CardHeader>
        <CardContent>
          {outstationTriggers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No outstation triggers recorded</p>
              <p className="text-sm">Triggers are created when active trips cross geofence boundaries</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(triggersByDate).reverse().map(([date, triggers]) => (
                <div key={date}>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Badge variant="outline">{date}</Badge>
                    <span className="text-muted-foreground text-sm">
                      {triggers.length} trigger{triggers.length > 1 ? 's' : ''}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {triggers.map(trigger => {
                      const vehicle = vehicles.find(v => v.id === trigger.vehicleId);
                      return (
                        <div
                          key={trigger.id}
                          className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-500/20 text-orange-400">
                                OUTSTATION
                              </Badge>
                              <span className="font-medium">{vehicle?.name || 'Unknown'}</span>
                            </div>
                            {trigger.syncedToServer ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span>Distance from center: {trigger.distanceFromCenterKm.toFixed(1)} km</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(trigger.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
