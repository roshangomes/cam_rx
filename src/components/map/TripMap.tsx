import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSCoordinate } from '@/store/slices/transportLogisticsSlice';

// Fix for default marker icons in React-Leaflet
const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const currentIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TripMapProps {
  trackingPoints: GPSCoordinate[];
  startLocation?: GPSCoordinate;
  endLocation?: GPSCoordinate;
  currentLocation?: GPSCoordinate | null;
  showAccuracyCircle?: boolean;
  accuracy?: number;
  height?: string;
}

// Component to fit map bounds
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = new LatLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export function TripMap({
  trackingPoints,
  startLocation,
  endLocation,
  currentLocation,
  showAccuracyCircle = false,
  accuracy = 50,
  height = '300px'
}: TripMapProps) {
  // Convert GPS coordinates to Leaflet format
  const pathCoordinates: [number, number][] = trackingPoints.map(
    point => [point.latitude, point.longitude]
  );

  // Determine map center
  const getCenter = (): [number, number] => {
    if (currentLocation) {
      return [currentLocation.latitude, currentLocation.longitude];
    }
    if (trackingPoints.length > 0) {
      const last = trackingPoints[trackingPoints.length - 1];
      return [last.latitude, last.longitude];
    }
    // Default to Mumbai
    return [19.076, 72.8777];
  };

  const center = getCenter();

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to track */}
        {pathCoordinates.length > 1 && <FitBounds points={pathCoordinates} />}

        {/* Trip path polyline */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: 'hsl(217, 91%, 60%)',
              weight: 4,
              opacity: 0.8
            }}
          />
        )}

        {/* Start marker */}
        {startLocation && (
          <Marker
            position={[startLocation.latitude, startLocation.longitude]}
            icon={startIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Start Location</strong>
                <p className="text-muted-foreground">
                  {new Date(startLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End marker */}
        {endLocation && (
          <Marker
            position={[endLocation.latitude, endLocation.longitude]}
            icon={endIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>End Location</strong>
                <p className="text-muted-foreground">
                  {new Date(endLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current location marker with optional accuracy circle */}
        {currentLocation && (
          <>
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={currentIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Current Location</strong>
                  <p className="text-muted-foreground">
                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
            {showAccuracyCircle && accuracy > 0 && (
              <Circle
                center={[currentLocation.latitude, currentLocation.longitude]}
                radius={accuracy}
                pathOptions={{
                  color: 'hsl(217, 91%, 60%)',
                  fillColor: 'hsl(217, 91%, 60%)',
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
