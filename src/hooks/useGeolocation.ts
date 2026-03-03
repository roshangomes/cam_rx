import { useState, useEffect, useCallback, useRef } from 'react';
import { GPSCoordinate } from '@/store/slices/transportLogisticsSlice';

interface GeolocationState {
  location: GPSCoordinate | null;
  error: string | null;
  isTracking: boolean;
  accuracy: number | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  trackingInterval?: number; // in milliseconds
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    trackingInterval = 60000, // 60 seconds default
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isTracking: false,
    accuracy: null,
    permissionStatus: 'unknown',
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingPointsRef = useRef<GPSCoordinate[]>([]);

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ 
        ...prev, 
        permissionStatus: result.state as 'granted' | 'denied' | 'prompt'
      }));

      result.addEventListener('change', () => {
        setState(prev => ({ 
          ...prev, 
          permissionStatus: result.state as 'granted' | 'denied' | 'prompt'
        }));
      });
    } catch {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
    }
  }, []);

  // Get current location once
  const getCurrentLocation = useCallback((): Promise<GPSCoordinate> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsCoordinate: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };

          setState(prev => ({
            ...prev,
            location: gpsCoordinate,
            accuracy: position.coords.accuracy,
            error: null,
          }));

          resolve(gpsCoordinate);
        },
        (error) => {
          let errorMessage: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }

          setState(prev => ({ ...prev, error: errorMessage }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Start continuous tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser' 
      }));
      return;
    }

    // Clear any existing tracking
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    trackingPointsRef.current = [];
    setState(prev => ({ ...prev, isTracking: true, error: null }));

    // Use watchPosition for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const gpsCoordinate: GPSCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        trackingPointsRef.current.push(gpsCoordinate);

        setState(prev => ({
          ...prev,
          location: gpsCoordinate,
          accuracy: position.coords.accuracy,
          error: null,
        }));
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        setState(prev => ({ ...prev, error: errorMessage }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    // Also set up interval-based tracking for guaranteed 60-second pings
    intervalRef.current = setInterval(async () => {
      try {
        await getCurrentLocation();
      } catch (err) {
        console.warn('Interval location fetch failed:', err);
      }
    }, trackingInterval);

    // Haptic feedback on start
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [enableHighAccuracy, timeout, maximumAge, trackingInterval, getCurrentLocation]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({ ...prev, isTracking: false }));

    // Haptic feedback on stop
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Return collected tracking points
    return [...trackingPointsRef.current];
  }, []);

  // Get all collected tracking points
  const getTrackingPoints = useCallback(() => {
    return [...trackingPointsRef.current];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    checkPermission();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkPermission]);

  return {
    ...state,
    getCurrentLocation,
    startTracking,
    stopTracking,
    getTrackingPoints,
    checkPermission,
  };
}
