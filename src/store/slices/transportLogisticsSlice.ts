import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Trip Logger Types
export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  startTimestamp: string;
  startLocation: GPSCoordinate;
  endTimestamp?: string;
  endLocation?: GPSCoordinate;
  odometerStart?: number;
  odometerEnd?: number;
  gpsTrackingPoints: GPSCoordinate[];
  distanceKm?: number;
  status: 'active' | 'completed';
  syncedToServer: boolean;
}

// Fuel Entry Types
export interface FuelEntry {
  id: string;
  tripId?: string;
  vehicleId: string;
  cost: number; // in ₹
  volume: number; // in liters
  pumpPhoto: string;
  efficiency?: number; // km/L
  flaggedAsFraud: boolean;
  fraudReason?: string;
  createdAt: string;
  createdBy: string;
  syncedToServer: boolean;
  immutable: boolean;
}

// Geofence Types
export interface GeofenceConfig {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  isActive: boolean;
}

export interface OutstationTrigger {
  id: string;
  vehicleId: string;
  allowanceTrigger: 'OUTSTATION';
  timestamp: string;
  distanceFromCenterKm: number;
  syncedToServer: boolean;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: 'car' | 'van' | 'truck';
  fuelType: 'petrol' | 'diesel' | 'cng';
  expectedEfficiency: number; // km/L
}

interface TransportLogisticsState {
  // Trips
  trips: Trip[];
  activeTrip: Trip | null;
  
  // Fuel Entries
  fuelEntries: FuelEntry[];
  
  // Geofence
  geofenceConfigs: GeofenceConfig[];
  outstationTriggers: OutstationTrigger[];
  
  // Vehicles
  vehicles: Vehicle[];
  
  // UI State
  isTracking: boolean;
  currentLocation: GPSCoordinate | null;
  offlineQueue: Array<{
    type: 'trip' | 'fuel' | 'outstation';
    action: 'create' | 'update';
    payload: unknown;
    timestamp: string;
  }>;
}

// Sample Vehicles
const initialVehicles: Vehicle[] = [
  { id: 'veh-1', name: 'Production Van 1', registrationNumber: 'MH-02-AB-1234', type: 'van', fuelType: 'diesel', expectedEfficiency: 12 },
  { id: 'veh-2', name: 'Talent Car', registrationNumber: 'MH-02-CD-5678', type: 'car', fuelType: 'petrol', expectedEfficiency: 14 },
  { id: 'veh-3', name: 'Equipment Truck', registrationNumber: 'MH-02-EF-9012', type: 'truck', fuelType: 'diesel', expectedEfficiency: 8 },
  { id: 'veh-4', name: 'Camera Car', registrationNumber: 'MH-02-GH-3456', type: 'car', fuelType: 'diesel', expectedEfficiency: 15 },
];

// Default Mumbai Geofence
const initialGeofenceConfigs: GeofenceConfig[] = [
  {
    id: 'geo-1',
    name: 'Mumbai City Center',
    centerLatitude: 19.0760,
    centerLongitude: 72.8777,
    radiusKm: 50,
    isActive: true,
  },
];

const initialState: TransportLogisticsState = {
  trips: [],
  activeTrip: null,
  fuelEntries: [],
  geofenceConfigs: initialGeofenceConfigs,
  outstationTriggers: [],
  vehicles: initialVehicles,
  isTracking: false,
  currentLocation: null,
  offlineQueue: [],
};

// Helper function to calculate distance between two GPS points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const transportLogisticsSlice = createSlice({
  name: 'transportLogistics',
  initialState,
  reducers: {
    // Trip Actions
    startTrip: (state, action: PayloadAction<{
      vehicleId: string;
      vehicleName: string;
      driverId: string;
      driverName: string;
      location: GPSCoordinate;
    }>) => {
      const trip: Trip = {
        id: `TRIP-${Date.now()}`,
        vehicleId: action.payload.vehicleId,
        vehicleName: action.payload.vehicleName,
        driverId: action.payload.driverId,
        driverName: action.payload.driverName,
        startTimestamp: action.payload.location.timestamp,
        startLocation: action.payload.location,
        gpsTrackingPoints: [action.payload.location],
        status: 'active',
        syncedToServer: false,
      };
      state.activeTrip = trip;
      state.isTracking = true;
    },
    
    updateTripLocation: (state, action: PayloadAction<GPSCoordinate>) => {
      if (state.activeTrip) {
        state.activeTrip.gpsTrackingPoints.push(action.payload);
        state.currentLocation = action.payload;
        
        // Check geofence triggers
        state.geofenceConfigs.forEach(geofence => {
          if (geofence.isActive) {
            const distance = calculateDistance(
              geofence.centerLatitude,
              geofence.centerLongitude,
              action.payload.latitude,
              action.payload.longitude
            );
            
            if (distance > geofence.radiusKm) {
              // Check if already triggered for this trip
              const alreadyTriggered = state.outstationTriggers.some(
                t => t.vehicleId === state.activeTrip?.vehicleId &&
                     new Date(t.timestamp).toDateString() === new Date().toDateString()
              );
              
              if (!alreadyTriggered && state.activeTrip) {
                const trigger: OutstationTrigger = {
                  id: `OUT-${Date.now()}`,
                  vehicleId: state.activeTrip.vehicleId,
                  allowanceTrigger: 'OUTSTATION',
                  timestamp: action.payload.timestamp,
                  distanceFromCenterKm: distance,
                  syncedToServer: false,
                };
                state.outstationTriggers.push(trigger);
                
                state.offlineQueue.push({
                  type: 'outstation',
                  action: 'create',
                  payload: trigger,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        });
      }
    },
    
    endTrip: (state, action: PayloadAction<{
      location: GPSCoordinate;
      odometerReading: number;
    }>) => {
      if (state.activeTrip) {
        state.activeTrip.endTimestamp = action.payload.location.timestamp;
        state.activeTrip.endLocation = action.payload.location;
        state.activeTrip.odometerEnd = action.payload.odometerReading;
        state.activeTrip.status = 'completed';
        
        // Calculate total GPS distance
        let totalDistance = 0;
        for (let i = 1; i < state.activeTrip.gpsTrackingPoints.length; i++) {
          const prev = state.activeTrip.gpsTrackingPoints[i - 1];
          const curr = state.activeTrip.gpsTrackingPoints[i];
          totalDistance += calculateDistance(
            prev.latitude,
            prev.longitude,
            curr.latitude,
            curr.longitude
          );
        }
        state.activeTrip.distanceKm = Math.round(totalDistance * 100) / 100;
        
        state.trips.push(state.activeTrip);
        
        state.offlineQueue.push({
          type: 'trip',
          action: 'create',
          payload: state.activeTrip,
          timestamp: new Date().toISOString(),
        });
        
        state.activeTrip = null;
        state.isTracking = false;
      }
    },
    
    setOdometerStart: (state, action: PayloadAction<number>) => {
      if (state.activeTrip) {
        state.activeTrip.odometerStart = action.payload;
      }
    },
    
    // Fuel Entry Actions
    addFuelEntry: (state, action: PayloadAction<{
      vehicleId: string;
      cost: number;
      volume: number;
      pumpPhoto: string;
      userId: string;
      tripId?: string;
    }>) => {
      // Find the most recent completed trip for this vehicle to calculate efficiency
      const recentTrip = action.payload.tripId
        ? state.trips.find(t => t.id === action.payload.tripId)
        : state.trips
            .filter(t => t.vehicleId === action.payload.vehicleId && t.status === 'completed')
            .sort((a, b) => new Date(b.endTimestamp!).getTime() - new Date(a.endTimestamp!).getTime())[0];
      
      let efficiency: number | undefined;
      let flaggedAsFraud = false;
      let fraudReason: string | undefined;
      
      if (recentTrip?.distanceKm) {
        efficiency = Math.round((recentTrip.distanceKm / action.payload.volume) * 100) / 100;
        
        // Fraud detection: if efficiency < 2 km/L, flag as potential fraud
        if (efficiency < 2) {
          flaggedAsFraud = true;
          fraudReason = `Abnormally low efficiency: ${efficiency} km/L (Trip distance: ${recentTrip.distanceKm} km, Fuel: ${action.payload.volume} L)`;
        }
      }
      
      const fuelEntry: FuelEntry = {
        id: `FUEL-${Date.now()}`,
        tripId: action.payload.tripId,
        vehicleId: action.payload.vehicleId,
        cost: action.payload.cost,
        volume: action.payload.volume,
        pumpPhoto: action.payload.pumpPhoto,
        efficiency,
        flaggedAsFraud,
        fraudReason,
        createdAt: new Date().toISOString(),
        createdBy: action.payload.userId,
        syncedToServer: false,
        immutable: true, // Records are immutable after submission
      };
      
      state.fuelEntries.push(fuelEntry);
      
      state.offlineQueue.push({
        type: 'fuel',
        action: 'create',
        payload: fuelEntry,
        timestamp: new Date().toISOString(),
      });
    },
    
    // Geofence Actions
    addGeofence: (state, action: PayloadAction<Omit<GeofenceConfig, 'id'>>) => {
      const geofence: GeofenceConfig = {
        ...action.payload,
        id: `geo-${Date.now()}`,
      };
      state.geofenceConfigs.push(geofence);
    },
    
    updateGeofence: (state, action: PayloadAction<GeofenceConfig>) => {
      const index = state.geofenceConfigs.findIndex(g => g.id === action.payload.id);
      if (index >= 0) {
        state.geofenceConfigs[index] = action.payload;
      }
    },
    
    toggleGeofence: (state, action: PayloadAction<string>) => {
      const geofence = state.geofenceConfigs.find(g => g.id === action.payload);
      if (geofence) {
        geofence.isActive = !geofence.isActive;
      }
    },
    
    // Vehicle Actions
    addVehicle: (state, action: PayloadAction<Omit<Vehicle, 'id'>>) => {
      const vehicle: Vehicle = {
        ...action.payload,
        id: `veh-${Date.now()}`,
      };
      state.vehicles.push(vehicle);
    },
    
    // Location Actions
    setCurrentLocation: (state, action: PayloadAction<GPSCoordinate | null>) => {
      state.currentLocation = action.payload;
    },
    
    // Sync Actions
    syncOfflineQueue: (state) => {
      // Simulate sync - in real app would call API
      state.offlineQueue = [];
      state.trips.forEach(t => { t.syncedToServer = true; });
      state.fuelEntries.forEach(f => { f.syncedToServer = true; });
      state.outstationTriggers.forEach(o => { o.syncedToServer = true; });
    },
  },
});

export const {
  startTrip,
  updateTripLocation,
  endTrip,
  setOdometerStart,
  addFuelEntry,
  addGeofence,
  updateGeofence,
  toggleGeofence,
  addVehicle,
  setCurrentLocation,
  syncOfflineQueue,
} = transportLogisticsSlice.actions;

export default transportLogisticsSlice.reducer;
