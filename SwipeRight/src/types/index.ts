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
  dining: number;
  gas: number;
  groceries: number;
  travel: number;
  shopping: number;
  entertainment: number;
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

export type SpendingCategory = 'dining' | 'gas' | 'groceries' | 'travel' | 'shopping' | 'entertainment';

