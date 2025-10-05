import { Merchant } from '@/types';
import { fetchNearbyPlacesGoogle } from './google-places';

/**
 * Fetch nearby places using Google Places API only
 * Shows ALL establishments within 300m walking distance
 * No fallback - returns empty array if API fails
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusMeters: number = 300
): Promise<Merchant[]> {
  try {
    const places = await fetchNearbyPlacesGoogle(lat, lng, radiusMeters);
    
    if (places.length > 0) {
      return places;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch places:', error);
    return [];
  }
}

