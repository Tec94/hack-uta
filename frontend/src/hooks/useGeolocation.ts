import { useState, useEffect } from 'react';
import { UserLocation } from '@/types';
import { getCurrentLocation, GeolocationError } from '@/lib/geolocation';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await getCurrentLocation();
      setLocation(position);
    } catch (err) {
      setError(err as GeolocationError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    error,
    loading,
    refetch: requestLocation,
  };
}

