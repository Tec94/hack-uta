import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartNotification, CreditCard } from '@/types';
import { X, MapPin, TrendingUp } from 'lucide-react';

interface ToastNotificationProps {
  notification: SmartNotification | null;
  onDismiss: () => void;
  onTap?: () => void;
  onCardClick?: (card: CreditCard) => void;
  autoHideDuration?: number; // milliseconds, default 8000
}

export function ToastNotification({
  notification,
  onDismiss,
  onTap,
  onCardClick,
  autoHideDuration = 8000,
}: ToastNotificationProps) {
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

  const handleTap = () => {
    if (onTap) {
      onTap();
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

  const emoji = categoryEmoji[notification.merchant.category.toLowerCase()] || '📍';

  // Extract cashback rate from card's rewards structure
  const getCashbackRate = () => {
    const category = notification.merchant.category.toLowerCase();
    const categoryReward = notification.recommendedCard.rewardsStructure.find(r => {
      const rCat = r.category.toLowerCase();
      return rCat.includes(category) || 
             (category === 'dining' && (rCat.includes('restaurant') || rCat.includes('dining'))) ||
             (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
             (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel'))) ||
             (category === 'personal_care' && (rCat.includes('salon') || rCat.includes('spa') || rCat.includes('beauty'))) ||
             (category === 'auto_services' && (rCat.includes('auto') || rCat.includes('car'))) ||
             (category === 'healthcare' && (rCat.includes('health') || rCat.includes('medical') || rCat.includes('pharmacy')));
    });
    
    return categoryReward?.rate || '1% cash back';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(notification.recommendedCard);
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -150, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 400,
            mass: 0.8
          }}
          className="fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md pointer-events-auto"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={handleTap}
            className="relative bg-card rounded-[20px] shadow-2xl overflow-hidden cursor-pointer backdrop-blur-xl border"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Gradient accent bar on top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* App Icon / Emoji */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[12px] flex items-center justify-center text-2xl shadow-lg">
                  {emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        SwipeRight
                      </p>
                      <p className="text-sm font-bold truncate mt-0.5">
                        Great rewards nearby!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="font-medium truncate max-w-[120px]">{notification.merchant.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss();
                        }}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Recommendation */}
              <div 
                onClick={handleCardClick}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-[14px] p-3 border border-green-100 cursor-pointer hover:border-green-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  {/* Card Logo */}
                  <div className="flex-shrink-0 w-10 h-10 bg-card rounded-lg shadow-sm flex items-center justify-center overflow-hidden border">
                    {notification.recommendedCard.logoUrl ? (
                      <img
                        src={notification.recommendedCard.logoUrl}
                        alt={notification.recommendedCard.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded" />
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-900 truncate">
                      {notification.recommendedCard.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700">
                        {getCashbackRate()}
                      </span>
                    </div>
                  </div>

                  {/* Chevron indicator */}
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tap to view hint */}
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Tap to view details
              </p>
            </div>

            {/* Subtle bottom shine effect */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

