import { Router, Request, Response } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import database from '../config/database';

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
 * Exchange public token for access token and persist to database
 * POST /api/plaid/exchange_public_token
 */
router.post('/exchange_public_token', async (req: Request, res: Response) => {
  try {
    const { public_token, user_id } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const { access_token, item_id } = response.data;

    // Check if user already has a bank link
    const existingBankLink = await database.getBankLinkByUserId(user_id);
    
    let bankLink;
    if (existingBankLink) {
      // Update existing bank link
      bankLink = await database.updateBankLinkToken(user_id, access_token);
      console.log(`Updated bank link for user ${user_id}`);
    } else {
      // Create new bank link
      bankLink = await database.createBankLink(user_id, access_token);
      console.log(`Created new bank link for user ${user_id}`);
    }
    
    return res.json({
      access_token: access_token,
      item_id: item_id,
      bank_link_id: bankLink.id,
      created_at: bankLink.created_at,
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
 * Get user's stored access token
 * GET /api/plaid/access_token/:user_id
 */
router.get('/access_token/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const bankLink = await database.getBankLinkByUserId(user_id);
    
    if (!bankLink) {
      return res.status(404).json({ 
        error: 'No bank link found for this user',
        has_bank_link: false 
      });
    }
    
    return res.json({
      access_token: bankLink.plaid_token,
      bank_link_id: bankLink.id,
      created_at: bankLink.created_at,
      has_bank_link: true,
    });
  } catch (error: any) {
    console.error('Error getting access token:', error);
    return res.status(500).json({ 
      error: 'Failed to get access token',
      details: error.message 
    });
  }
});

/**
 * Get transactions (can use either access_token directly or user_id)
 * POST /api/plaid/transactions
 */
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const { access_token, user_id, start_date, end_date } = req.body;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'start_date and end_date are required' 
      });
    }

    let token = access_token;
    
    // If no access_token provided, try to get it from user_id
    if (!token && user_id) {
      const bankLink = await database.getBankLinkByUserId(user_id);
      if (!bankLink) {
        return res.status(404).json({ 
          error: 'No bank link found for this user. Please link your bank account first.' 
        });
      }
      token = bankLink.plaid_token;
    }
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Either access_token or user_id is required' 
      });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.transactionsGet({
      access_token: token,
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
 * Get account balance (can use either access_token directly or user_id)
 * POST /api/plaid/balance
 */
router.post('/balance', async (req: Request, res: Response) => {
  try {
    const { access_token, user_id } = req.body;
    
    let token = access_token;
    
    // If no access_token provided, try to get it from user_id
    if (!token && user_id) {
      const bankLink = await database.getBankLinkByUserId(user_id);
      if (!bankLink) {
        return res.status(404).json({ 
          error: 'No bank link found for this user. Please link your bank account first.' 
        });
      }
      token = bankLink.plaid_token;
    }
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Either access_token or user_id is required' 
      });
    }

    const plaidClient = getPlaidClient();
    
    const response = await plaidClient.accountsBalanceGet({
      access_token: token,
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

