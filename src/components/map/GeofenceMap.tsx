import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeofenceConfig, GPSCoordinate } from '@/store/slices/transportLogisticsSlice';

const vehicleIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GeofenceMapProps {
  geofences: GeofenceConfig[];
  currentLocation?: GPSCoordinate | null;
  selectedGeofenceId?: string;
  height?: string;
  onGeofenceClick?: (geofence: GeofenceConfig) => void;
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}

export function GeofenceMap({
  geofences,
  currentLocation,
  selectedGeofenceId,
  height = '400px',
  onGeofenceClick
}: GeofenceMapProps) {
  // Determine map center
  const getCenter = (): [number, number] => {
    if (currentLocation) {
      return [currentLocation.latitude, currentLocation.longitude];
    }
    if (geofences.length > 0) {
      return [geofences[0].centerLatitude, geofences[0].centerLongitude];
    }
    // Default to Mumbai
    return [19.076, 72.8777];
  };

  const center = getCenter();

  // Check if current location is outside a geofence
  const isOutsideGeofence = (geofence: GeofenceConfig): boolean => {
    if (!currentLocation) return false;
    const distance = calculateDistance(
      geofence.centerLatitude,
      geofence.centerLongitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    return distance > geofence.radiusKm;
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Geofence circles */}
        {geofences.map((geofence) => {
          const isOutside = isOutsideGeofence(geofence);
          const isSelected = geofence.id === selectedGeofenceId;
          
          return (
            <React.Fragment key={geofence.id}>
              {/* Geofence boundary circle */}
              <Circle
                center={[geofence.centerLatitude, geofence.centerLongitude]}
                radius={geofence.radiusKm * 1000} // Convert km to meters
                pathOptions={{
                  color: isOutside ? 'hsl(0, 84%, 60%)' : 'hsl(142, 76%, 36%)',
                  fillColor: isOutside ? 'hsl(0, 84%, 60%)' : 'hsl(142, 76%, 36%)',
                  fillOpacity: isSelected ? 0.3 : 0.15,
                  weight: isSelected ? 3 : 2,
                  dashArray: geofence.isActive ? undefined : '5, 10'
                }}
                eventHandlers={{
                  click: () => onGeofenceClick?.(geofence)
                }}
              />

              {/* Geofence center marker */}
              <Marker
                position={[geofence.centerLatitude, geofence.centerLongitude]}
                icon={centerIcon}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <strong>{geofence.name}</strong>
                    <p className="text-muted-foreground">
                      Radius: {geofence.radiusKm} km
                    </p>
                    <p className={geofence.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                      {geofence.isActive ? '● Active' : '○ Inactive'}
                    </p>
                    {currentLocation && (
                      <p className={isOutside ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {isOutside ? '⚠ Vehicle outside zone' : '✓ Vehicle inside zone'}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Current vehicle location */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Current Location</strong>
                <p className="text-muted-foreground">
                  Lat: {currentLocation.latitude.toFixed(6)}
                </p>
                <p className="text-muted-foreground">
                  Lng: {currentLocation.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(currentLocation.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
