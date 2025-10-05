import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserBudget, UserLocation } from '@/types';

interface UserState {
  location: UserLocation | null;
  budget: UserBudget | null;
  currentCards: string[];
  onboardingCompleted: boolean;
  linkedBank: boolean;
  notificationsEnabled: boolean;
  lastNotificationTimestamp: number | null;
  dwellTimeSeconds: number; // Custom dwell time for testing (default: 300 = 5 minutes)
  dwellRadiusMeters: number; // Custom dwell radius for testing (default: 30 meters)
  setLocation: (location: UserLocation) => void;
  setBudget: (budget: UserBudget) => void;
  setCurrentCards: (cards: string[]) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLinkedBank: (linked: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLastNotificationTimestamp: (timestamp: number | null) => void;
  setDwellTimeSeconds: (seconds: number) => void;
  setDwellRadiusMeters: (meters: number) => void;
  reset: () => void;
}

const initialState = {
  location: null,
  budget: null,
  currentCards: [],
  onboardingCompleted: false,
  linkedBank: false,
  notificationsEnabled: true,
  lastNotificationTimestamp: null,
  dwellTimeSeconds: 300, // 5 minutes default
  dwellRadiusMeters: 30, // 30 meters default
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      setLocation: (location) => set({ location }),
      setBudget: (budget) => set({ budget }),
      setCurrentCards: (cards) => set({ currentCards: cards }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      setLinkedBank: (linked) => set({ linkedBank: linked }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setLastNotificationTimestamp: (timestamp) => set({ lastNotificationTimestamp: timestamp }),
      setDwellTimeSeconds: (seconds) => set({ dwellTimeSeconds: seconds }),
      setDwellRadiusMeters: (meters) => set({ dwellRadiusMeters: meters }),
      reset: () => set(initialState),
    }),
    {
      name: 'user-storage',
    }
  )
);

