/**
 * Plaid Sandbox Integration
 * Based on: https://plaid.com/docs/sandbox/
 * 
 * Sandbox credentials: user_good / pass_good
 */

import axios from 'axios';

const PLAID_ENV = import.meta.env.VITE_PLAID_ENV || 'sandbox';
const PLAID_CLIENT_ID = import.meta.env.VITE_PLAID_CLIENT_ID || '';
const PLAID_SECRET = import.meta.env.VITE_PLAID_SECRET || '';

// Plaid Sandbox endpoint
const PLAID_API_URL = 'https://sandbox.plaid.com';

interface PlaidConfig {
  client_id: string;
  secret: string;
  client_name: string;
  country_codes: string[];
  language: string;
  user: {
    client_user_id: string;
  };
  products: string[];
  redirect_uri?: string;
}

/**
 * Create a Link token for Plaid Link
 * This is called before showing the Plaid Link UI
 */
export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await axios.post(`${PLAID_API_URL}/link/token/create`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      client_name: 'SwipeRight',
      user: {
        client_user_id: userId,
      },
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: '', // Optional: Add your webhook URL here
      redirect_uri: window.location.origin, // For OAuth flow
    });

    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw new Error('Failed to create Plaid link token');
  }
}

/**
 * Exchange public token for access token
 * This is called after user successfully links their account
 */
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await axios.post(`${PLAID_API_URL}/item/public_token/exchange`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
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
    const response = await axios.post(`${PLAID_API_URL}/accounts/balance/get`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
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
    const response = await axios.post(`${PLAID_API_URL}/transactions/get`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
      start_date: start,
      end_date: end,
      options: {
        count: 250,
        offset: 0,
      },
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
 * SANDBOX ONLY: Create a public token directly (bypass Link UI)
 * Useful for automated testing
 * Reference: https://plaid.com/docs/sandbox/#bypassing-link
 */
export async function createSandboxPublicToken(
  institutionId: string = 'ins_109508', // Chase
  initialProducts: string[] = ['auth', 'transactions'],
  options?: {
    webhook?: string;
    override_username?: string;
    override_password?: string;
  }
) {
  try {
    const response = await axios.post(`${PLAID_API_URL}/sandbox/public_token/create`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      institution_id: institutionId,
      initial_products: initialProducts,
      options: options || {},
    });

    return response.data.public_token;
  } catch (error) {
    console.error('Error creating sandbox public token:', error);
    throw new Error('Failed to create sandbox public token');
  }
}

/**
 * SANDBOX ONLY: Reset login for testing update mode
 * Reference: https://plaid.com/docs/sandbox/#itemloginrequired
 */
export async function resetItemLogin(accessToken: string) {
  try {
    const response = await axios.post(`${PLAID_API_URL}/sandbox/item/reset_login`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error resetting item login:', error);
    throw new Error('Failed to reset item login');
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

