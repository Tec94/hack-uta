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
 * Exchange public token for access token
 * This is called after user successfully links their account
 */
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/plaid/exchange_public_token`, {
      public_token: publicToken,
    });

    return {
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Failed to exchange public token');
  }
}

/**
 * Get account balance
 */
export async function getBalance(accessToken: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/plaid/balance`, {
      access_token: accessToken,
    });

    return response.data.accounts;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new Error('Failed to get account balance');
  }
}

/**
 * Get transactions (last 30 days)
 */
export async function getTransactions(accessToken: string, startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  try {
    const response = await axios.post(`${BACKEND_URL}/api/plaid/transactions`, {
      access_token: accessToken,
      start_date: start,
      end_date: end,
    });

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

