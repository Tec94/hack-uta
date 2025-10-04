import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserBudget, UserLocation } from '@/types';

interface UserState {
  location: UserLocation | null;
  budget: UserBudget | null;
  currentCards: string[];
  onboardingCompleted: boolean;
  linkedBank: boolean;
  setLocation: (location: UserLocation) => void;
  setBudget: (budget: UserBudget) => void;
  setCurrentCards: (cards: string[]) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLinkedBank: (linked: boolean) => void;
  reset: () => void;
}

const initialState = {
  location: null,
  budget: null,
  currentCards: [],
  onboardingCompleted: false,
  linkedBank: false,
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
      reset: () => set(initialState),
    }),
    {
      name: 'user-storage',
    }
  )
);

