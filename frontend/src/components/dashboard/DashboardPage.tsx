'use client';

import { useState, useEffect } from 'react';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { CardsCarousel } from '@/components/cards/CardsCarousel';
import { CardDetailModal } from '@/components/cards/CardDetailModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUserStore } from '@/store/userStore';
import { CreditCard, Merchant } from '@/types';
import { mockCreditCards } from '@/data/mock-cards';
import { generateNearbyMerchants } from '@/data/mock-merchants';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface DashboardPageProps {
  user: any;
}

export function DashboardPage({ user }: DashboardPageProps) {
  const router = useRouter();
  const { location: storedLocation, budget, onboardingCompleted, setLocation } = useUserStore();
  const { location: geoLocation, error: geoError, loading: geoLoading, refetch } = useGeolocation();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!onboardingCompleted) {
      router.push('/onboarding/choice');
    }
  }, [onboardingCompleted, router]);

  // Update stored location when geolocation succeeds
  useEffect(() => {
    if (geoLocation) {
      setLocation(geoLocation);
      const nearby = generateNearbyMerchants(geoLocation.lat, geoLocation.lng);
      setMerchants(nearby);
    }
  }, [geoLocation, setLocation]);

  const currentLocation = geoLocation || storedLocation;

  const handleCardClick = (card: CreditCard) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    // Could trigger AI recommendation here
  };

  if (!onboardingCompleted) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-blue-100">Here are your personalized recommendations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Location Status */}
        {geoLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-900">Getting your location...</span>
          </motion.div>
        )}

        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-orange-900 font-medium mb-1">Location Access Needed</p>
                <p className="text-sm text-orange-800 mb-3">{geoError.message}</p>
                <Button onClick={refetch} size="sm" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map Section */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Nearby Merchants</h2>
                <span className="text-sm text-gray-500">{merchants.length} locations</span>
              </div>
              <InteractiveMap
                userLocation={currentLocation}
                merchants={merchants}
                onMerchantSelect={handleMerchantSelect}
              />
              {selectedMerchant && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-1">Selected Location</h3>
                  <p className="text-blue-800">{selectedMerchant.name}</p>
                  <p className="text-sm text-blue-700">
                    Category: {selectedMerchant.category} • Est: ${selectedMerchant.estimatedSpend}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recommended Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended Cards</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your spending in {budget ? Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0] : 'various categories'}
                </p>
              </div>
            </div>
            <CardsCarousel cards={mockCreditCards} onCardClick={handleCardClick} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Monthly Spending</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(budget)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([category, amount]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize mb-1">{category}</p>
                      <p className="text-2xl font-bold text-primary">${amount}</p>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

