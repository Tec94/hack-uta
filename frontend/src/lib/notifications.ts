import { CreditCard, Merchant } from '@/types';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return { granted: false, denied: true, default: false };
  }

  return {
    granted: Notification.permission === 'granted',
    denied: Notification.permission === 'denied',
    default: Notification.permission === 'default',
  };
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Show a browser push notification for a recommended card at a merchant
 */
export function showCardRecommendationNotification(
  merchant: Merchant,
  card: CreditCard,
  earnings: string
): void {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const title = `Great rewards nearby at ${merchant.name}`;
    const body = `Use ${card.name} to earn ${earnings}`;
    
    const notification = new Notification(title, {
      body,
      icon: card.logoUrl || '/vite.svg',
      badge: '/vite.svg',
      tag: `merchant-${merchant.id}`,
      requireInteraction: false,
      silent: false,
      data: {
        merchantId: merchant.id,
        cardId: card.id,
        timestamp: Date.now(),
      },
    });

    // Handle notification click - navigate to dashboard
    notification.onclick = () => {
      window.focus();
      // Close the notification
      notification.close();
      // Navigate to dashboard if not already there
      if (!window.location.pathname.includes('/dashboard')) {
        window.location.href = '/dashboard';
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    console.log('✅ Notification displayed:', title);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show a generic notification
 */
export function showNotification(
  title: string,
  body: string,
  options?: NotificationOptions
): void {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      ...options,
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

