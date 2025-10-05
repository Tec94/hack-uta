import { Merchant } from '@/types';

// Backend API URL - defaults to localhost:3000 for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fetch nearby places using Google Places API via our backend proxy
 * Shows ALL establishments within walking distance (300m)
 */
export async function fetchNearbyPlacesGoogle(
  lat: number,
  lng: number,
  radiusMeters: number = 300
): Promise<Merchant[]> {
  try {
    const url = `${API_URL}/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Backend API error: ${response.status}`, errorData);
      return [];
    }

    const data = await response.json();
    const places = data.places || [];

    if (places.length > 0) {
      return places;
    }

    return [];
  } catch (error) {
    console.error('Error calling backend places API:', error);
    return [];
  }
}


