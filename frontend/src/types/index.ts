export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  logoUrl: string;
  imageUrl: string;
  annualFee: number;
  signupBonus?: string;
  primaryBenefit: string;
  secondaryBenefits: string[];
  rewardsStructure: RewardCategory[];
  creditScoreRequired: string;
  fullDescription: string;
  applicationUrl: string;
}

export interface RewardCategory {
  category: string;
  rate: string;
  description?: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  estimatedSpend?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface UserBudget {
  rent: number;
  groceries: number;
  gas: number;
  dining: number;
  shopping: number;
  entertainment: number;
  travel: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  budget?: UserBudget;
  currentCards: string[];
  onboardingCompleted: boolean;
  linkedBank?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  merchant: string;
  category: string;
  account: string;
}

export interface Recommendation {
  card: CreditCard;
  reason: string;
  estimatedEarnings: string;
  confidence: number;
}

export type SpendingCategory = 'rent' | 'groceries' | 'gas' | 'dining' | 'shopping' | 'entertainment' | 'travel';

// API Credit Card type from the cards API
export interface ApiCreditCard {
  id: string;
  created_at: string;
  bank_name: string;
  card_name: string;
  network: string;
  category: string;
  reward_summary: Record<string, number>;
}

// Notification system types
export interface NotificationState {
  lastNotificationTime: number | null;
  isEnabled: boolean;
  currentDwellingLocation: UserLocation | null;
}

export interface LocationHistory {
  location: UserLocation;
  timestamp: number;
  dwellTimeSeconds: number;
}

export interface SmartNotification {
  merchant: Merchant;
  recommendedCard: CreditCard;
  reason: string;
  estimatedEarnings: string;
  timestamp: number;
}

