import { Merchant } from '@/types';

/**
 * @deprecated Use fetchNearbyPlaces from @/lib/places instead for real location data
 * Generates mock merchants with random locations around a center point
 */
export function generateNearbyMerchants(
  centerLat: number,
  centerLng: number,
  radiusMiles: number = 2
): Merchant[] {
  const merchants: Merchant[] = [];
  const categories = [
    { name: 'dining', merchants: ['Chipotle', 'Starbucks', 'McDonald\'s', 'Panera Bread', 'Local Bistro'] },
    { name: 'gas', merchants: ['Shell', 'Chevron', 'BP', 'ExxonMobil', '7-Eleven'] },
    { name: 'groceries', merchants: ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Walmart', 'Target'] },
    { name: 'shopping', merchants: ['Best Buy', 'Apple Store', 'Nordstrom', 'Macy\'s', 'HomeGoods'] },
    { name: 'entertainment', merchants: ['AMC Theatres', 'Dave & Buster\'s', 'Top Golf', 'Bowling Alley', 'Arcade'] },
  ];

  let id = 1;
  categories.forEach(category => {
    category.merchants.forEach(merchantName => {
      // Generate random location within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusMiles;
      const latOffset = (distance / 69) * Math.cos(angle); // 69 miles per degree latitude
      const lngOffset = (distance / (69 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

      merchants.push({
        id: `merchant-${id++}`,
        name: merchantName,
        category: category.name,
        location: {
          lat: centerLat + latOffset,
          lng: centerLng + lngOffset,
        },
        address: `${Math.floor(Math.random() * 9000 + 1000)} Main St`,
        estimatedSpend: Math.floor(Math.random() * 50 + 10),
      });
    });
  });

  return merchants;
}

export const defaultMerchants: Merchant[] = [
  {
    id: 'merchant-1',
    name: 'Chipotle',
    category: 'dining',
    location: { lat: 40.7589, lng: -73.9851 },
    address: '1234 Broadway, New York, NY',
    estimatedSpend: 15,
  },
  {
    id: 'merchant-2',
    name: 'Shell Gas Station',
    category: 'gas',
    location: { lat: 40.7614, lng: -73.9776 },
    address: '5678 7th Ave, New York, NY',
    estimatedSpend: 50,
  },
  {
    id: 'merchant-3',
    name: 'Whole Foods',
    category: 'groceries',
    location: { lat: 40.7549, lng: -73.9840 },
    address: '910 8th Ave, New York, NY',
    estimatedSpend: 85,
  },
  {
    id: 'merchant-4',
    name: 'Starbucks',
    category: 'dining',
    location: { lat: 40.7580, lng: -73.9855 },
    address: '1122 Broadway, New York, NY',
    estimatedSpend: 8,
  },
  {
    id: 'merchant-5',
    name: 'Best Buy',
    category: 'shopping',
    location: { lat: 40.7625, lng: -73.9800 },
    address: '3344 W 44th St, New York, NY',
    estimatedSpend: 200,
  },
];

