import { UserLocation } from '@/types';

export interface GeolocationError {
  code: number;
  message: string;
}

export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: getErrorMessage(error.code),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location permission denied. Please enable location access in your browser settings.';
    case 2:
      return 'Location information is unavailable.';
    case 3:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}

export function watchLocation(
  onSuccess: (location: UserLocation) => void,
  onError: (error: GeolocationError) => void
): number | null {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'Geolocation is not supported by your browser',
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: getErrorMessage(error.code),
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    }
  );
}

export function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

