import React, { createContext, useContext, useState, useCallback } from 'react';
import { IOSNotification, NotificationData, NotificationType } from '@/components/notifications/IOSNotification';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [, setQueue] = useState<NotificationData[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const newNotification: NotificationData = {
      id: Date.now().toString(),
      message,
      type,
    };

    // If there's already a notification showing, add to queue
    if (notification) {
      setQueue((prev) => [...prev, newNotification]);
    } else {
      setNotification(newNotification);
    }
  }, [notification]);

  const handleDismiss = useCallback(() => {
    setNotification(null);

    // Show next notification in queue if any
    setTimeout(() => {
      setQueue((prev) => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setNotification(next);
          return rest;
        }
        return prev;
      });
    }, 100);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <IOSNotification
        notification={notification}
        onDismiss={handleDismiss}
        autoHideDuration={4000}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

