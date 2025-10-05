import { Router, Request, Response } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const router = Router();

// Initialize Plaid client
const getPlaidClient = () => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
        'PLAID-SECRET': process.env.PLAID_SECRET || '',
      },
    },
  });

  return new PlaidApi(configuration);
};

/**
 * Create a Link token for Plaid Link
 * POST /api/plaid/create_link_token
 */
router.post('/create_link_token', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const plaidClient = getPlaidClient();
    
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'SwipeRight',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    
    return res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Error creating link token:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to create link token',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * Exchange public token for access token
 * POST /api/plaid/exchange_public_token
 */
router.post('/exchange_public_token', async (req: Request, res: Response) => {
  try {
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    
    return res.json({
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    });
  } catch (error: any) {
    console.error('Error exchanging public token:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to exchange public token',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * Get transactions
 * POST /api/plaid/transactions
 */
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const { access_token, start_date, end_date } = req.body;
    
    if (!access_token || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'access_token, start_date, and end_date are required' 
      });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: start_date,
      end_date: end_date,
      options: {
        count: 250,
        offset: 0,
      },
    });
    
    return res.json({
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total_transactions: response.data.total_transactions,
    });
  } catch (error: any) {
    console.error('Error getting transactions:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to get transactions',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * Get account balance
 * POST /api/plaid/balance
 */
router.post('/balance', async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.accountsBalanceGet({
      access_token: access_token,
    });
    
    return res.json({
      accounts: response.data.accounts,
    });
  } catch (error: any) {
    console.error('Error getting balance:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to get account balance',
      details: error.response?.data || error.message 
    });
  }
});

export default router;

