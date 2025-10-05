import { useState, useEffect, useRef, useCallback } from 'react';
import { UserLocation } from '@/types';
import { watchLocation, clearWatch } from '@/lib/geolocation';

interface LocationMonitorState {
  currentLocation: UserLocation | null;
  isDwelling: boolean;
  dwellTimeSeconds: number;
  error: string | null;
}

interface UseLocationMonitorOptions {
  dwellThresholdSeconds: number; // e.g., 300 for 5 minutes
  dwellRadiusMeters: number; // e.g., 30 for 30 meters
  onDwellDetected?: (location: UserLocation, dwellTime: number) => void;
  enabled?: boolean;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Hook to monitor user location and detect dwelling
 * Tracks when user stays in one place for a specified duration
 */
export function useLocationMonitor({
  dwellThresholdSeconds,
  dwellRadiusMeters,
  onDwellDetected,
  enabled = true,
}: UseLocationMonitorOptions): LocationMonitorState {
  const [state, setState] = useState<LocationMonitorState>({
    currentLocation: null,
    isDwelling: false,
    dwellTimeSeconds: 0,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const anchorLocationRef = useRef<UserLocation | null>(null);
  const dwellStartTimeRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const dwellNotifiedRef = useRef<boolean>(false);

  const updateDwellTime = useCallback(() => {
    if (!dwellStartTimeRef.current) return;

    const now = Date.now();
    const dwellSeconds = Math.floor((now - dwellStartTimeRef.current) / 1000);
    
    setState((prev) => ({
      ...prev,
      dwellTimeSeconds: dwellSeconds,
      isDwelling: dwellSeconds >= dwellThresholdSeconds,
    }));

    // Trigger callback when threshold is reached (only once)
    if (
      dwellSeconds >= dwellThresholdSeconds &&
      !dwellNotifiedRef.current &&
      anchorLocationRef.current &&
      onDwellDetected
    ) {
      dwellNotifiedRef.current = true;
      onDwellDetected(anchorLocationRef.current, dwellSeconds);
      console.log(
        `🏠 Dwelling detected: ${dwellSeconds}s at location`,
        anchorLocationRef.current
      );
    }
  }, [dwellThresholdSeconds, onDwellDetected]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if monitoring is disabled
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Start watching location
    const onSuccess = (location: UserLocation) => {
      const now = Date.now();
      lastUpdateTimeRef.current = now;

      // Check if this is the first location or user has moved significantly
      if (!anchorLocationRef.current) {
        // First location - set as anchor
        anchorLocationRef.current = location;
        dwellStartTimeRef.current = now;
        dwellNotifiedRef.current = false;
        console.log('📍 Initial location set as anchor', location);
      } else {
        // Calculate distance from anchor
        const distance = getDistance(
          anchorLocationRef.current.lat,
          anchorLocationRef.current.lng,
          location.lat,
          location.lng
        );

        if (distance < dwellRadiusMeters) {
          // Still within dwelling radius - continue dwelling
          updateDwellTime();
        } else {
          // Moved outside dwelling radius - reset
          console.log(
            `🚶 Moved ${distance.toFixed(0)}m from anchor - resetting dwell timer`
          );
          anchorLocationRef.current = location;
          dwellStartTimeRef.current = now;
          dwellNotifiedRef.current = false;
          setState((prev) => ({
            ...prev,
            isDwelling: false,
            dwellTimeSeconds: 0,
          }));
        }
      }

      setState((prev) => ({
        ...prev,
        currentLocation: location,
        error: null,
      }));
    };

    const onError = (error: { code: number; message: string }) => {
      console.error('Location monitoring error:', error);
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
    };

    // Start watching position
    watchIdRef.current = watchLocation(onSuccess, onError);

    // Set up interval to update dwell time
    const intervalId = setInterval(() => {
      updateDwellTime();
    }, 1000); // Update every second

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
      }
      clearInterval(intervalId);
    };
  }, [enabled, dwellRadiusMeters, updateDwellTime]);

  return state;
}

export { getDistance };

