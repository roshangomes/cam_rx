import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addFuelEntry } from '@/store/slices/transportLogisticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Fuel,
  Camera,
  IndianRupee,
  Droplet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function FuelEntryPage() {
  const dispatch = useDispatch();
  const { fuelEntries, vehicles, trips } = useSelector(
    (state: RootState) => state.transportLogistics
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [cost, setCost] = useState('');
  const [volume, setVolume] = useState('');
  const [pumpPhoto, setPumpPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const completedTrips = trips.filter(t => t.status === 'completed');
  const vehicleTrips = completedTrips.filter(t => t.vehicleId === selectedVehicle);
  const fraudEntries = fuelEntries.filter(e => e.flaggedAsFraud);
  
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPumpPhoto(reader.result as string);
        toast.success('Photo captured');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || !cost || !volume || !pumpPhoto) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    dispatch(addFuelEntry({
      vehicleId: selectedVehicle,
      tripId: selectedTrip || undefined,
      cost: parseFloat(cost),
      volume: parseFloat(volume),
      pumpPhoto,
      userId: user?.id || 'anonymous',
    }));
    
    toast.success('Fuel entry recorded');
    
    // Reset form
    setCost('');
    setVolume('');
    setPumpPhoto('');
    setSelectedTrip('');
  };
  
  const calculateStats = () => {
    const vehicleEntries = fuelEntries.filter(e => e.vehicleId === selectedVehicle);
    const totalCost = vehicleEntries.reduce((sum, e) => sum + e.cost, 0);
    const totalVolume = vehicleEntries.reduce((sum, e) => sum + e.volume, 0);
    const avgEfficiency = vehicleEntries.filter(e => e.efficiency).reduce((sum, e, _, arr) => 
      sum + (e.efficiency || 0) / arr.length, 0
    );
    
    return { totalCost, totalVolume, avgEfficiency, count: vehicleEntries.length };
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fuel Entry & Audit</h1>
          <p className="text-muted-foreground">Track fuel consumption with fraud detection</p>
        </div>
        {fraudEntries.length > 0 && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {fraudEntries.length} Flagged
          </Badge>
        )}
      </div>
      
      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entry">New Entry</TabsTrigger>
          <TabsTrigger value="history">History ({fuelEntries.length})</TabsTrigger>
          <TabsTrigger value="audit">
            Audit
            {fraudEntries.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                {fraudEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* New Entry */}
        <TabsContent value="entry">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5" />
                  Log Fuel Entry
                </CardTitle>
                <CardDescription>All entries are immutable after submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vehicle Selection */}
                <div className="space-y-2">
                  <Label>Vehicle *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
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
                
                {/* Trip Selection (optional) */}
                {selectedVehicle && vehicleTrips.length > 0 && (
                  <div className="space-y-2">
                    <Label>Link to Trip (optional)</Label>
                    <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a completed trip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No trip selected</SelectItem>
                        {vehicleTrips.slice(-5).reverse().map(trip => (
                          <SelectItem key={trip.id} value={trip.id}>
                            {new Date(trip.startTimestamp).toLocaleDateString()} - {trip.distanceKm} km
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Cost and Volume */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      Cost (₹) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2500"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Droplet className="w-4 h-4" />
                      Volume (Liters) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 30.5"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Price per liter display */}
                {cost && volume && parseFloat(volume) > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Price per liter: </span>
                    <span className="font-medium">₹{(parseFloat(cost) / parseFloat(volume)).toFixed(2)}</span>
                  </div>
                )}
                
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Pump Screen Photo *
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  
                  {pumpPhoto ? (
                    <div className="relative">
                      <img
                        src={pumpPhoto}
                        alt="Pump screen"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
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
                      type="button"
                      variant="outline"
                      className="w-full h-32 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p>Tap to capture pump screen</p>
                      </div>
                    </Button>
                  )}
                </div>
                
                <Button type="submit" size="lg" className="w-full">
                  Submit Fuel Entry
                </Button>
              </CardContent>
            </Card>
          </form>
          
          {/* Vehicle Stats */}
          {selectedVehicle && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Vehicle Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{calculateStats().count}</div>
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {calculateStats().totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{calculateStats().totalVolume.toFixed(1)} L</div>
                    <div className="text-sm text-muted-foreground">Total Volume</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {calculateStats().avgEfficiency.toFixed(1)} km/L
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Entry History</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Fuel className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No fuel entries recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...fuelEntries].reverse().map(entry => {
                    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 border rounded-lg ${entry.flaggedAsFraud ? 'border-red-500/50 bg-red-500/5' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span className="font-medium">{vehicle?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.flaggedAsFraud && (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                            {entry.syncedToServer ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <br />
                            <span className="font-medium flex items-center">
                              <IndianRupee className="w-3 h-3" />
                              {entry.cost.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <br />
                            <span className="font-medium">{entry.volume} L</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Efficiency:</span>
                            <br />
                            <span className={`font-medium flex items-center gap-1 ${
                              entry.efficiency && entry.efficiency < 5 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {entry.efficiency ? (
                                <>
                                  {entry.efficiency.toFixed(1)} km/L
                                  {entry.efficiency < 5 ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3" />
                                  )}
                                </>
                              ) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Audit */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Fraud Detection Audit
              </CardTitle>
              <CardDescription>
                Entries flagged for low efficiency (&lt;2 km/L)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fraudEntries.length === 0 ? (
                <div className="text-center py-8 text-green-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>No suspicious entries detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fraudEntries.map(entry => {
                    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
                    return (
                      <div
                        key={entry.id}
                        className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{vehicle?.name}</span>
                          </div>
                          <Badge variant="destructive">Potential Fraud</Badge>
                        </div>
                        
                        <p className="text-sm text-red-400 mb-3">
                          {entry.fraudReason}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <br />
                            ₹{entry.cost.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <br />
                            {entry.volume} L
                          </div>
                          <div>
                            <span className="text-muted-foreground">Efficiency:</span>
                            <br />
                            <span className="text-red-400 font-bold">
                              {entry.efficiency?.toFixed(2)} km/L
                            </span>
                          </div>
                        </div>
                        
                        {entry.pumpPhoto && (
                          <div className="mt-3">
                            <img
                              src={entry.pumpPhoto}
                              alt="Pump screen evidence"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-3">
                          Recorded: {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
