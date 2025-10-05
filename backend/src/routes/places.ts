import { Router } from 'express';
import axios from 'axios';

const router = Router();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

/**
 * GET /api/places/nearby
 * Fetch nearby places using Google Places API (New) - Nearby Search
 * Reference: https://developers.google.com/maps/documentation/places/web-service/search-nearby
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = '300' } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ error: 'Missing lat or lng parameters' });
      return;
    }

    if (!GOOGLE_API_KEY) {
      res.status(500).json({ error: 'Google Places API key not configured' });
      return;
    }

    console.log(`Fetching places near ${lat}, ${lng} with radius ${radius}m`);

    const merchants: any[] = [];
    const seenPlaces = new Set<string>();

    // Place types to category mapping for the NEW Places API
    const typeToCategoryMap: Record<string, string> = {
      // Dining
      'restaurant': 'dining',
      'cafe': 'dining',
      'bakery': 'dining',
      'bar': 'dining',
      'meal_takeaway': 'dining',
      'meal_delivery': 'dining',
      'food': 'dining',
      // Gas
      'gas_station': 'gas',
      // Groceries
      'grocery_store': 'groceries',
      'supermarket': 'groceries',
      'convenience_store': 'groceries',
      // Shopping
      'shopping_mall': 'shopping',
      'department_store': 'shopping',
      'clothing_store': 'shopping',
      'electronics_store': 'shopping',
      'book_store': 'shopping',
      'jewelry_store': 'shopping',
      'shoe_store': 'shopping',
      'furniture_store': 'shopping',
      'home_goods_store': 'shopping',
      'store': 'shopping',
      // Entertainment
      'movie_theater': 'entertainment',
      'gym': 'entertainment',
      'night_club': 'entertainment',
      'bowling_alley': 'entertainment',
      'stadium': 'entertainment',
      'amusement_park': 'entertainment',
      'aquarium': 'entertainment',
      'art_gallery': 'entertainment',
      'casino': 'entertainment',
      'museum': 'entertainment',
      'zoo': 'entertainment',
      'spa': 'entertainment',
      // Travel
      'lodging': 'travel',
      'airport': 'travel',
      'car_rental': 'travel',
      'rv_park': 'travel',
      'campground': 'travel',
      'transit_station': 'travel',
      // Personal Care
      'hair_care': 'personal_care',
      'beauty_salon': 'personal_care',
      // Auto Services
      'car_repair': 'auto_services',
      'car_wash': 'auto_services',
      'car_dealer': 'auto_services',
      'parking': 'auto_services',
      // Healthcare
      'pharmacy': 'healthcare',
      'hospital': 'healthcare',
      'doctor': 'healthcare',
      'dentist': 'healthcare',
      'veterinary_care': 'healthcare',
      'physiotherapist': 'healthcare',
    };

    // Use the NEW Places API with POST request for Nearby Search
    // Note: Can only include up to 50 types, so we'll prioritize the most common ones
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    
    // Priority types - most common business categories
    const includedTypes = [
      'restaurant', 'cafe', 'bakery', 'bar',
      'gas_station',
      'grocery_store', 'supermarket', 'convenience_store',
      'shopping_mall', 'department_store', 'clothing_store', 'electronics_store',
      'movie_theater', 'gym', 'night_club', 'spa',
      'lodging', 'airport', 'car_rental',
      'hair_care', 'beauty_salon',
      'car_repair', 'car_wash', 'parking',
      'pharmacy', 'hospital', 'doctor'
    ];
    
    const requestBody = {
      includedTypes: includedTypes,
      maxResultCount: 20, // Maximum allowed by Google API per request
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(lat as string),
            longitude: parseFloat(lng as string)
          },
          radius: parseFloat(radius as string)
        }
      },
      rankPreference: 'DISTANCE' // Sort by distance to show closest first
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.types,places.location,places.formattedAddress'
    };

    console.log(`Making API request with ${includedTypes.length} place types...`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    const response = await axios.post(url, requestBody, { headers });
    const data = response.data;
    console.log('✅ API Response status:', response.status);

    if (!data.places || data.places.length === 0) {
      console.log('⚠️ No places returned from Google Places API (New)');
      res.json({ places: [], count: 0 });
      return;
    }

    console.log(`✅ Found ${data.places.length} places from API`);

    // Process the results
    for (const place of data.places) {
      const placeId = place.id;
      if (seenPlaces.has(placeId)) continue;

      // Determine category based on place types
      let category = 'shopping'; // default
      if (place.types && Array.isArray(place.types)) {
        for (const type of place.types) {
          if (typeToCategoryMap[type]) {
            category = typeToCategoryMap[type];
            break;
          }
        }
      }

      seenPlaces.add(placeId);

      merchants.push({
        id: placeId,
        name: place.displayName?.text || 'Unknown Place',
        category: category,
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
        address: place.formattedAddress || '',
        estimatedSpend: getEstimatedSpend(category),
      });
    }

    console.log(`✅ Returning ${merchants.length} unique places`);
    res.json({ places: merchants, count: merchants.length });
  } catch (error: any) {
    console.error('❌ Error in /nearby:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

function getEstimatedSpend(category: string): number {
  const estimates: Record<string, number> = {
    dining: Math.floor(Math.random() * 30 + 15),
    gas: Math.floor(Math.random() * 40 + 30),
    groceries: Math.floor(Math.random() * 60 + 40),
    travel: Math.floor(Math.random() * 150 + 100),
    shopping: Math.floor(Math.random() * 80 + 40),
    entertainment: Math.floor(Math.random() * 50 + 20),
    personal_care: Math.floor(Math.random() * 60 + 40),
    auto_services: Math.floor(Math.random() * 80 + 50),
    healthcare: Math.floor(Math.random() * 100 + 50),
  };
  return estimates[category] || 30;
}

export default router;

