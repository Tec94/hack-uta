# Plaid CORS Error - Explanation & Solutions

## 🚨 What's Happening?

You're seeing this error in the console:
```
Access to XMLHttpRequest at 'https://sandbox.plaid.com/link/token/create' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 🔍 Why This Error Occurs

**Root Cause**: You're trying to call Plaid API directly from the browser (frontend), which is **NOT ALLOWED** for security reasons.

### The Problem:

```typescript
// ❌ WRONG: Calling Plaid API directly from frontend
// In src/lib/plaid.ts
export async function createLinkToken(userId: string): Promise<string> {
  const response = await axios.post(`${PLAID_API_URL}/link/token/create`, {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,  // ⚠️ NEVER expose your secret in the frontend!
    // ...
  });
}
```

### Why This is Dangerous:

1. **Security Risk**: Your `PLAID_SECRET` is exposed in the browser
2. **Anyone can steal it**: Users can view your secret in DevTools → Network tab
3. **CORS Protection**: Plaid blocks browser requests on purpose to prevent this

## ✅ The Correct Architecture

Plaid API calls **MUST** go through a backend server:

```
Frontend (React)  →  Backend Server  →  Plaid API
                     (Node/Express)
```

### Flow:
1. **Frontend**: Request a link token from YOUR backend
2. **Backend**: Calls Plaid API with your secret (secret stays on server)
3. **Backend**: Returns link token to frontend
4. **Frontend**: Uses link token to open Plaid Link UI
5. **Plaid**: User connects their bank
6. **Frontend**: Sends public token to YOUR backend
7. **Backend**: Exchanges public token with Plaid for access token

## 🛠️ Solutions

### Option 1: Create a Backend Server (RECOMMENDED)

You need to create a simple Express server to proxy Plaid API calls.

#### Step 1: Create Backend Directory

```bash
mkdir backend
cd backend
npm init -y
npm install express cors plaid dotenv
```

#### Step 2: Create `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(configuration);

// Create link token
app.post('/api/create_link_token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'SwipeRight',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exchange public token
app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    
    res.json({
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;
    
    const response = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: start_date,
      end_date: end_date,
    });
    
    res.json({
      transactions: response.data.transactions,
      accounts: response.data.accounts,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Step 3: Create `backend/.env`

```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox
PORT=5000
```

#### Step 4: Update Frontend `src/lib/plaid.ts`

```typescript
// ✅ CORRECT: Call YOUR backend instead of Plaid directly
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/create_link_token`, {
      userId: userId,
    });
    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw new Error('Failed to create Plaid link token');
  }
}

export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/exchange_public_token`, {
      public_token: publicToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Failed to exchange public token');
  }
}

export async function getTransactions(accessToken: string, startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  try {
    const response = await axios.post(`${BACKEND_URL}/api/transactions`, {
      access_token: accessToken,
      start_date: start,
      end_date: end,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to get transactions');
  }
}
```

#### Step 5: Add to Frontend `.env`

```env
VITE_BACKEND_URL=http://localhost:5000
```

#### Step 6: Run Both Servers

Terminal 1 (Backend):
```bash
cd backend
node server.js
```

Terminal 2 (Frontend):
```bash
cd SwipeRight
npm run dev
```

### Option 2: Use Plaid Link Only (Quick Fix)

If you don't want to set up a backend yet, you can use mock data for now:

#### Update `src/pages/LinkBankPage.tsx`:

```typescript
// Skip the backend integration, use mock data
const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
  console.log('Plaid Link success:', metadata);
  setStep('processing');
  setLoading(true);

  try {
    // For now, use mock spending data
    const mockSpending = {
      dining: 300,
      gas: 150,
      groceries: 400,
      travel: 200,
      shopping: 250,
      entertainment: 100,
    };

    setBudget(mockSpending);
    setLinkedBank(true);
    setStep('success');
    setLoading(false);

    setTimeout(() => {
      setOnboardingCompleted(true);
      navigate('/dashboard');
    }, 2000);
  } catch (err) {
    console.error('Error:', err);
    setError('An error occurred. Please try again.');
    setLoading(false);
    setStep('setup');
  }
};
```

### Option 3: Use Serverless Functions (Modern Approach)

Deploy serverless functions on:
- **Vercel Functions**
- **Netlify Functions**
- **AWS Lambda**
- **Firebase Functions**

Example with Vercel:

Create `api/create_link_token.js`:
```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);
  const { userId } = req.body;

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'SwipeRight',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 📋 Summary

| Approach | Security | Complexity | Recommendation |
|----------|----------|------------|----------------|
| **Backend Server** | ✅ Secure | Medium | ⭐ Best for production |
| **Serverless Functions** | ✅ Secure | Low | ⭐ Best for modern apps |
| **Mock Data (no backend)** | ⚠️ Development only | Very Low | 🧪 Testing only |
| **Direct API calls** | ❌ INSECURE | N/A | ❌ NEVER do this |

## 🎯 Quick Decision Guide

1. **Want to test UI only?** → Use Option 2 (Mock Data)
2. **Building for production?** → Use Option 1 (Backend) or Option 3 (Serverless)
3. **Have a hackathon/demo?** → Option 2 is fine temporarily

## 🔐 Security Best Practices

1. **NEVER** expose `PLAID_SECRET` in frontend code
2. **NEVER** commit `.env` files to git
3. **ALWAYS** use HTTPS in production
4. **ALWAYS** validate requests on backend
5. **STORE** access tokens securely (encrypted database, not localStorage)

## Need Help?

If you need help setting up the backend, let me know which option you'd like to pursue!

