/**
 * Temporary Plaid Integration Fix
 * 
 * This file provides a workaround for the CORS error.
 * 
 * ⚠️ IMPORTANT: This is for DEVELOPMENT/TESTING ONLY!
 * For production, you MUST set up a backend server.
 * See PLAID_CORS_FIX.md for proper implementation.
 */

import axios from 'axios';

// Toggle between modes
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Plaid Sandbox (for direct calls - NOT RECOMMENDED)
const PLAID_API_URL = 'https://sandbox.plaid.com';
const PLAID_CLIENT_ID = import.meta.env.VITE_PLAID_CLIENT_ID || '';
const PLAID_SECRET = import.meta.env.VITE_PLAID_SECRET || '';

/**
 * Create a Link token for Plaid Link
 */
export async function createLinkToken(userId: string): Promise<string> {
  if (USE_BACKEND) {
    // ✅ CORRECT WAY: Use your backend
    try {
      const response = await axios.post(`${BACKEND_URL}/api/create_link_token`, {
        userId: userId,
      });
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating link token via backend:', error);
      throw new Error('Failed to create Plaid link token. Make sure your backend is running on ' + BACKEND_URL);
    }
  } else {
    // ❌ TEMPORARY FIX: Direct call (will cause CORS error)
    // This won't work due to CORS, but keeping for reference
    try {
      const response = await axios.post(`${PLAID_API_URL}/link/token/create`, {
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        client_name: 'Credily',
        user: {
          client_user_id: userId,
        },
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
        redirect_uri: window.location.origin,
      });
      return response.data.link_token;
    } catch (error) {
      console.error('❌ CORS ERROR: Cannot call Plaid API directly from browser!');
      console.error('📚 Solution: See PLAID_CORS_FIX.md for how to fix this');
      throw new Error('Failed to create Plaid link token (CORS error - you need a backend server)');
    }
  }
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(publicToken: string) {
  if (USE_BACKEND) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/exchange_public_token`, {
        public_token: publicToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error exchanging public token via backend:', error);
      throw new Error('Failed to exchange public token');
    }
  } else {
    // MOCK: Return fake data for testing
    console.warn('⚠️ MOCK MODE: Using fake access token (backend not available)');
    return {
      access_token: 'access-sandbox-mock-token',
      item_id: 'item-sandbox-mock-id',
    };
  }
}

/**
 * Get transactions
 */
export async function getTransactions(accessToken: string, startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  if (USE_BACKEND) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/transactions`, {
        access_token: accessToken,
        start_date: start,
        end_date: end,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting transactions via backend:', error);
      throw new Error('Failed to get transactions');
    }
  } else {
    // MOCK: Return fake transactions for testing
    console.warn('⚠️ MOCK MODE: Using fake transactions (backend not available)');
    return {
      transactions: generateMockTransactions(),
      accounts: [],
      total_transactions: 50,
    };
  }
}

/**
 * Generate realistic mock transactions
 */
function generateMockTransactions() {
  const categories = [
    { name: ['Food and Drink', 'Restaurants'], amount: 45 },
    { name: ['Food and Drink', 'Restaurants'], amount: 32 },
    { name: ['Food and Drink', 'Coffee Shop'], amount: 6 },
    { name: ['Travel', 'Gas Stations'], amount: 55 },
    { name: ['Travel', 'Gas Stations'], amount: 48 },
    { name: ['Shops', 'Supermarkets and Groceries'], amount: 120 },
    { name: ['Shops', 'Supermarkets and Groceries'], amount: 85 },
    { name: ['Shops', 'Supermarkets and Groceries'], amount: 95 },
    { name: ['Travel', 'Airlines and Aviation Services'], amount: 350 },
    { name: ['Recreation', 'Entertainment'], amount: 45 },
    { name: ['Shops', 'Clothing and Accessories'], amount: 89 },
    { name: ['Food and Drink', 'Restaurants'], amount: 78 },
    { name: ['Travel', 'Gas Stations'], amount: 52 },
  ];

  return categories.map((cat, index) => ({
    transaction_id: `mock-tx-${index}`,
    amount: cat.amount,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Mock Transaction',
    category: cat.name,
  }));
}

/**
 * Calculate spending by category from transactions
 */
export function calculateSpendingFromTransactions(transactions: any[]) {
  const spending = {
    dining: 0,
    gas: 0,
    groceries: 0,
    travel: 0,
    shopping: 0,
    entertainment: 0,
  };

  transactions.forEach((tx) => {
    if (tx.amount > 0) {
      const category = tx.category?.[0]?.toLowerCase() || '';
      
      if (category.includes('food') || category.includes('restaurant')) {
        spending.dining += tx.amount;
      } else if (category.includes('gas') || category.includes('fuel')) {
        spending.gas += tx.amount;
      } else if (category.includes('groceries') || category.includes('supermarket')) {
        spending.groceries += tx.amount;
      } else if (category.includes('travel') || category.includes('airline') || category.includes('hotel')) {
        spending.travel += tx.amount;
      } else if (category.includes('shops') || category.includes('clothing') || category.includes('retail')) {
        spending.shopping += tx.amount;
      } else if (category.includes('entertainment') || category.includes('recreation')) {
        spending.entertainment += tx.amount;
      }
    }
  });

  return spending;
}

// Sandbox test credentials
export const SANDBOX_CREDENTIALS = {
  username: 'user_good',
  password: 'pass_good',
};

// Helper to check if backend is available
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

