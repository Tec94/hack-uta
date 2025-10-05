import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { useLocationMonitor } from './useLocationMonitor';
import { fetchNearbyPlaces } from '@/lib/places';
import { recommendCardsForMerchant, calculatePotentialEarnings } from '@/lib/recommendations';
import { SmartNotification, UserLocation, CreditCard } from '@/types';

const COOLDOWN_MILLISECONDS = 30 * 60 * 1000; // 30 minutes

interface UseSmartNotificationsOptions {
  cards: CreditCard[];
  enabled?: boolean;
}

interface SmartNotificationsState {
  currentNotification: SmartNotification | null;
  isProcessing: boolean;
  permissionGranted: boolean;
}

/**
 * Smart notifications hook that monitors location and triggers card recommendations
 */
export function useSmartNotifications({
  cards,
  enabled = true,
}: UseSmartNotificationsOptions): SmartNotificationsState {
  const {
    notificationsEnabled,
    lastNotificationTimestamp,
    setLastNotificationTimestamp,
    dwellTimeSeconds,
    dwellRadiusMeters,
  } = useUserStore();

  const [state, setState] = useState<SmartNotificationsState>({
    currentNotification: null,
    isProcessing: false,
    permissionGranted: true, // Always true for custom notifications
  });

  const handleDwellDetected = useCallback(
    async (location: UserLocation, dwellTime: number) => {
      console.log('🏠 Dwell detected, checking for notifications...', {
        location,
        dwellTime,
        enabled,
        notificationsEnabled,
        cardsCount: cards.length,
      });

      // Check if notifications are enabled
      if (!enabled || !notificationsEnabled) {
        console.log('⏸️ Notifications disabled');
        return;
      }

      // Check if we have cards to recommend
      if (cards.length === 0) {
        console.log('⚠️ No cards available for recommendations');
        return;
      }

      // Check cooldown period
      const now = Date.now();
      if (
        lastNotificationTimestamp &&
        now - lastNotificationTimestamp < COOLDOWN_MILLISECONDS
      ) {
        const remainingMinutes = Math.ceil(
          (COOLDOWN_MILLISECONDS - (now - lastNotificationTimestamp)) / 60000
        );
        console.log(
          `⏰ Cooldown active: ${remainingMinutes} minutes remaining`
        );
        return;
      }

      setState((prev) => ({ ...prev, isProcessing: true }));

      try {
        // Fetch nearby places
        console.log('🔍 Fetching nearby places...');
        const nearbyPlaces = await fetchNearbyPlaces(
          location.lat,
          location.lng,
          100 // 100m radius for nearby check
        );

        if (nearbyPlaces.length === 0) {
          console.log('📍 No nearby places found');
          setState((prev) => ({ ...prev, isProcessing: false }));
          return;
        }

        // Get the closest merchant
        const closestMerchant = nearbyPlaces[0];
        console.log('🏪 Found nearby merchant:', closestMerchant.name);

        // Get recommended cards for this merchant
        const recommendedCards = recommendCardsForMerchant(
          closestMerchant,
          cards
        );

        if (recommendedCards.length === 0) {
          console.log('⚠️ No card recommendations available');
          setState((prev) => ({ ...prev, isProcessing: false }));
          return;
        }

        const bestCard = recommendedCards[0];
        const earnings = calculatePotentialEarnings(
          closestMerchant,
          bestCard
        );

        console.log('💳 Best card recommendation:', {
          merchant: closestMerchant.name,
          card: bestCard.name,
          earnings,
        });

        // Create notification object
        const notification: SmartNotification = {
          merchant: closestMerchant,
          recommendedCard: bestCard,
          reason: `Best rewards for ${closestMerchant.category}`,
          estimatedEarnings: earnings,
          timestamp: now,
        };

        // Update state with notification (will show iOS-style toast)
        setState((prev) => ({
          ...prev,
          currentNotification: notification,
          isProcessing: false,
        }));

        // Update last notification timestamp
        setLastNotificationTimestamp(now);

        console.log('✅ Notification created successfully');
      } catch (error) {
        console.error('❌ Error processing smart notification:', error);
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [
      enabled,
      notificationsEnabled,
      cards,
      lastNotificationTimestamp,
      setLastNotificationTimestamp,
    ]
  );

  // Use location monitor to detect dwelling
  const { isDwelling, dwellTimeSeconds: currentDwellTime, error } = useLocationMonitor({
    dwellThresholdSeconds: dwellTimeSeconds,
    dwellRadiusMeters: dwellRadiusMeters,
    onDwellDetected: handleDwellDetected,
    enabled: enabled && notificationsEnabled,
  });

  // Log dwelling status
  useEffect(() => {
    if (isDwelling) {
      console.log(`🏠 Currently dwelling: ${currentDwellTime}s`);
    }
  }, [isDwelling, currentDwellTime]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Location monitoring error:', error);
    }
  }, [error]);

  return state;
}

/**
 * Clear the current notification
 */
export function useClearNotification() {
  return useCallback((setState: React.Dispatch<React.SetStateAction<SmartNotificationsState>>) => {
    setState((prev) => ({
      ...prev,
      currentNotification: null,
    }));
  }, []);
}

