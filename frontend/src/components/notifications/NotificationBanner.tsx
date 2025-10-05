import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartNotification, CreditCard } from '@/types';
import { X, MapPin, CreditCard as CreditCardIcon, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBannerProps {
  notification: SmartNotification | null;
  onDismiss: () => void;
  onCardClick?: (card: CreditCard) => void;
  autoHideDuration?: number; // milliseconds, default 10000
}

export function NotificationBanner({
  notification,
  onDismiss,
  onCardClick,
  autoHideDuration = 10000,
}: NotificationBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);

      // Auto-dismiss after specified duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, autoHideDuration]);

  const handleDismiss = () => {
    setVisible(false);
    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleCardClick = () => {
    if (notification && onCardClick) {
      onCardClick(notification.recommendedCard);
    }
    handleDismiss();
  };

  if (!notification) return null;

  const categoryEmoji: Record<string, string> = {
    dining: '🍽️',
    gas: '⛽',
    groceries: '🛒',
    shopping: '🛍️',
    entertainment: '🎬',
    travel: '✈️',
    personal_care: '💅',
    auto_services: '🔧',
    healthcare: '⚕️',
  };

  const emoji =
    categoryEmoji[notification.merchant.category.toLowerCase()] || '📍';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      Great Rewards Nearby!
                    </p>
                    <div className="flex items-center gap-1 text-white/90 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{notification.merchant.name}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Dismiss notification"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Recommendation */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {notification.recommendedCard.logoUrl ? (
                        <img
                          src={notification.recommendedCard.logoUrl}
                          alt={notification.recommendedCard.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CreditCardIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {notification.recommendedCard.name}
                    </p>
                    <p className="text-xs text-gray-600 mb-1 capitalize">
                      {notification.merchant.category} rewards
                    </p>
                    <div className="flex items-center gap-1 text-green-700">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        Earn {notification.estimatedEarnings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCardClick}
                  size="sm"
                  className="flex-1 bg-white text-green-700 hover:bg-white/90 font-semibold"
                >
                  View Details
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

