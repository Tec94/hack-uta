/**
 * Plaid Integration via Backend Server
 * Based on: https://plaid.com/docs/sandbox/
 * 
 * Sandbox credentials: user_good / pass_good
 * 
 * NOTE: All Plaid API calls go through the backend server for security.
 * The backend server handles the Plaid API credentials.
 */

import axios from 'axios';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Create a Link token for Plaid Link
 * This is called before showing the Plaid Link UI
 */
export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/plaid/create_link_token`, {
      userId: userId,
    });

    return response.data.link_token;
  } catch (error: any) {
    console.error('Error creating link token:', error);
    const errorMsg = error.response?.data?.error || 'Failed to create Plaid link token';
    throw new Error(`${errorMsg}. Make sure your backend server is running on ${BACKEND_URL}`);
  }
}

/**
 * Exchange public token for access token and persist to database
 * This is called after user successfully links their account
 */
export async function exchangePublicToken(publicToken: string, userId: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/plaid/exchange_public_token`, {
      public_token: publicToken,
      user_id: userId,
    });

    return {
      access_token: response.data.access_token,
      item_id: response.data.item_id,
      bank_link_id: response.data.bank_link_id,
      created_at: response.data.created_at,
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Failed to exchange public token');
  }
}

/**
 * Get user's stored access token from database
 */
export async function getStoredAccessToken(userId: string) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/plaid/access_token/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { has_bank_link: false };
    }
    console.error('Error getting stored access token:', error);
    throw new Error('Failed to get stored access token');
  }
}

/**
 * Get account balance (can use either accessToken directly or userId)
 */
export async function getBalance(accessToken?: string, userId?: string) {
  try {
    const requestBody: any = {};
    
    if (accessToken) {
      requestBody.access_token = accessToken;
    } else if (userId) {
      requestBody.user_id = userId;
    } else {
      throw new Error('Either accessToken or userId is required');
    }

    const response = await axios.post(`${BACKEND_URL}/api/plaid/balance`, requestBody);
    return response.data.accounts;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new Error('Failed to get account balance');
  }
}

/**
 * Get transactions (can use either accessToken directly or userId)
 */
export async function getTransactions(accessToken?: string, userId?: string, startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  try {
    const requestBody: any = {
      start_date: start,
      end_date: end,
    };
    
    if (accessToken) {
      requestBody.access_token = accessToken;
    } else if (userId) {
      requestBody.user_id = userId;
    } else {
      throw new Error('Either accessToken or userId is required');
    }

    const response = await axios.post(`${BACKEND_URL}/api/plaid/transactions`, requestBody);

    return {
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total_transactions: response.data.total_transactions,
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to get transactions');
  }
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
    if (tx.amount > 0) { // Only count outflows
      const category = tx.category?.[0]?.toLowerCase() || '';
      
      if (category.includes('food') || category.includes('restaurant')) {
        spending.dining += tx.amount;
      } else if (category.includes('gas') || category.includes('fuel')) {
        spending.gas += tx.amount;
      } else if (category.includes('groceries') || category.includes('supermarket')) {
        spending.groceries += tx.amount;
      } else if (category.includes('travel') || category.includes('airline') || category.includes('hotel')) {
        spending.travel += tx.amount;
      } else if (category.includes('shopping') || category.includes('retail')) {
        spending.shopping += tx.amount;
      } else if (category.includes('entertainment') || category.includes('recreation')) {
        spending.entertainment += tx.amount;
      }
    }
  });

  return spending;
}

// Sandbox test institutions
// Reference: https://plaid.com/docs/sandbox/test-credentials/
export const SANDBOX_INSTITUTIONS = [
  { id: 'ins_109508', name: 'Chase' },
  { id: 'ins_109509', name: 'Bank of America' },
  { id: 'ins_109510', name: 'Wells Fargo' },
  { id: 'ins_109511', name: 'Citibank' },
  { id: 'ins_109512', name: 'US Bank' },
];

// Default test credentials for Sandbox
// Reference: https://plaid.com/docs/sandbox/#using-sandbox
export const SANDBOX_CREDENTIALS = {
  username: 'user_good',
  password: 'pass_good',
};

