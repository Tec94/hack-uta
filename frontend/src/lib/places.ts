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
  console.log(`🔍 Fetching ALL nearby places within ${radiusMeters}m for location: ${lat}, ${lng}`);

  try {
    const places = await fetchNearbyPlacesGoogle(lat, lng, radiusMeters);
    
    if (places.length > 0) {
      console.log(`✅ Successfully fetched ${places.length} places`);
      return places;
    }
    
    console.warn('⚠️ No places found in this area');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch places:', error);
    return [];
  }
}

