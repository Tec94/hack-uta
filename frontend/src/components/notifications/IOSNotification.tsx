import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationData {
  id: string;
  message: string;
  type: NotificationType;
}

interface IOSNotificationProps {
  notification: NotificationData | null;
  onDismiss: () => void;
  autoHideDuration?: number; // milliseconds, default 4000
}

const notificationConfig = {
  info: {
    icon: Info,
    bgGradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-primary',
    borderColor: 'border-primary/20',
  },
  success: {
    icon: CheckCircle,
    bgGradient: 'from-green-500 to-green-600',
    iconBg: 'bg-green-500',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-500',
    borderColor: 'border-amber-200',
  },
  error: {
    icon: AlertCircle,
    bgGradient: 'from-red-500 to-red-600',
    iconBg: 'bg-red-500',
    borderColor: 'border-red-200',
  },
};

export function IOSNotification({
  notification,
  onDismiss,
  autoHideDuration = 4000,
}: IOSNotificationProps) {
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

  if (!notification) return null;

  const config = notificationConfig[notification.type];
  const Icon = config.icon;

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
            mass: 0.8,
          }}
          className="fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md pointer-events-auto"
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={handleDismiss}
            className={`relative bg-white rounded-[20px] shadow-2xl overflow-hidden cursor-pointer backdrop-blur-xl border ${config.borderColor}`}
            style={{
              boxShadow:
                '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Gradient accent bar on top */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.bgGradient}`}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-[12px] flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtle bottom shine effect */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

