# Plaid Sandbox Integration Guide

This guide explains how to integrate Plaid Sandbox API into SwipeRight for real bank account linking.

Reference: [Plaid Sandbox Documentation](https://plaid.com/docs/sandbox/)

## 🎯 What's Integrated

Your app now uses **real Plaid Sandbox API** instead of mock data:

✅ **Real Plaid Link UI** - Official bank selection interface  
✅ **Live Transaction Data** - Real Sandbox transaction history  
✅ **Automatic Categorization** - Plaid's transaction categories  
✅ **Spending Analysis** - Calculate budgets from real transactions  
✅ **Test Credentials** - Standard Sandbox credentials (`user_good`/`pass_good`)  

## 🔧 Setup Instructions

### Step 1: Get Plaid API Keys

1. Go to [Plaid Dashboard](https://dashboard.plaid.com/signup)
2. Create a free account
3. From the Dashboard, go to **Team Settings** → **Keys**
4. Copy your:
   - **Client ID**
   - **Sandbox Secret** (starts with `sandbox-`)

### Step 2: Add Environment Variables

Add these to your `.env` file:

```env
# Plaid Configuration
VITE_PLAID_ENV=sandbox
VITE_PLAID_CLIENT_ID=your-plaid-client-id
VITE_PLAID_SECRET=your-plaid-sandbox-secret
```

**Important**: 
- Use `VITE_` prefix for client-side variables
- Use your **Sandbox secret**, not Development or Production

### Step 3: Test the Integration

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/onboarding/link-bank`

3. Click **"Connect Bank with Plaid"**

4. In the Plaid Link UI:
   - Select any bank (e.g., Chase, Bank of America)
   - Use credentials:
     - **Username**: `user_good`
     - **Password**: `pass_good`

5. The app will:
   - Connect to Plaid
   - Fetch last 30 days of transactions
   - Calculate spending by category
   - Save budget to user store
   - Redirect to dashboard

## 📚 How It Works

### Architecture

```
User → Plaid Link UI → Public Token → Your App → Exchange → Access Token → Transactions
```

### Flow Breakdown

1. **Create Link Token**
   ```typescript
   const linkToken = await createLinkToken(userId);
   ```
   - Generates a temporary token for Plaid Link
   - Called on page load

2. **User Links Account**
   - Plaid Link UI opens
   - User selects bank and enters credentials
   - Returns `public_token` on success

3. **Exchange Token**
   ```typescript
   const { access_token } = await exchangePublicToken(publicToken);
   ```
   - Exchanges public token for permanent access token
   - Access token is used for all future API calls

4. **Fetch Transactions**
   ```typescript
   const { transactions } = await getTransactions(access_token);
   ```
   - Gets last 30 days of transactions
   - Includes merchant name, amount, date, category

5. **Calculate Spending**
   ```typescript
   const spending = calculateSpendingFromTransactions(transactions);
   ```
   - Categorizes transactions (dining, gas, groceries, etc.)
   - Calculates total spending per category

## 🧪 Sandbox Features

### Test Credentials

Default credentials work for all institutions:
- **Username**: `user_good`
- **Password**: `pass_good`

### Test Institutions

Available in Sandbox:
- Chase (`ins_109508`)
- Bank of America (`ins_109509`)
- Wells Fargo (`ins_109510`)
- Citibank (`ins_109511`)
- US Bank (`ins_109512`)

### Bypass Link UI (Automated Testing)

For automated tests, create tokens directly:

```typescript
import { createSandboxPublicToken } from '@/lib/plaid';

// Create token without UI
const publicToken = await createSandboxPublicToken('ins_109508'); // Chase
const { access_token } = await exchangePublicToken(publicToken);
```

Reference: [Bypassing Link](https://plaid.com/docs/sandbox/#bypassing-link)

### Testing Update Mode

Simulate expired logins:

```typescript
import { resetItemLogin } from '@/lib/plaid';

// Force ITEM_LOGIN_REQUIRED error
await resetItemLogin(access_token);
```

Items automatically expire after 30 days in Sandbox.

## 📂 File Structure

```
src/
├── lib/
│   └── plaid.ts              # Plaid API functions
├── components/
│   └── plaid/
│       └── PlaidLink.tsx     # React Plaid Link component
└── pages/
    └── LinkBankPage.tsx      # Updated with real Plaid
```

## 🔒 Security Notes

### Never Expose Secrets

❌ **DON'T** put `PLAID_SECRET` in `VITE_*` variables  
✅ **DO** keep secrets server-side only

In production, you'll need a backend to:
1. Create link tokens (requires secret)
2. Exchange public tokens (requires secret)
3. Make API calls (requires access token + secret)

### Current Setup

This demo uses client-side calls for simplicity. **For production**:

1. Create a backend API:
   ```typescript
   // Backend: /api/plaid/create-link-token
   export async function POST(req) {
     const linkToken = await createLinkToken(userId);
     return { linkToken };
   }
   ```

2. Call from frontend:
   ```typescript
   const { linkToken } = await fetch('/api/plaid/create-link-token').then(r => r.json());
   ```

## 🎯 Available Functions

### `createLinkToken(userId: string)`
Creates a Link token for initializing Plaid Link UI

### `exchangePublicToken(publicToken: string)`
Exchanges public token for permanent access token

### `getBalance(accessToken: string)`
Gets current account balances

### `getTransactions(accessToken: string, startDate?, endDate?)`
Fetches transactions for date range (default: last 30 days)

### `calculateSpendingFromTransactions(transactions: any[])`
Analyzes transactions and groups by category

### `createSandboxPublicToken(institutionId, products, options)` **[Sandbox Only]**
Creates public token directly without UI (for testing)

### `resetItemLogin(accessToken)` **[Sandbox Only]**
Forces ITEM_LOGIN_REQUIRED state (for testing update mode)

## 🚀 Next Steps

### Current: Sandbox Mode
- Free forever
- Test data only
- Standard test credentials
- All features available

### Moving to Production

1. **Apply for Production Access**
   - Go to Plaid Dashboard
   - Complete verification
   - Select use cases

2. **Create Backend API**
   - Move secret to server-side
   - Create API routes for token exchange
   - Store access tokens securely

3. **Update Environment**
   ```env
   VITE_PLAID_ENV=production
   PLAID_SECRET=your-production-secret
   ```

4. **Handle Real Data**
   - Real financial data (not test)
   - Real bank credentials
   - Production webhooks
   - Error handling for real scenarios

## 📖 Additional Resources

- [Plaid Sandbox Docs](https://plaid.com/docs/sandbox/)
- [Plaid Quickstart](https://plaid.com/docs/quickstart/)
- [React Plaid Link](https://github.com/plaid/react-plaid-link)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Sandbox Test Credentials](https://plaid.com/docs/sandbox/test-credentials/)

## 🐛 Troubleshooting

### "Failed to create link token"
- Check `VITE_PLAID_CLIENT_ID` is set
- Check `VITE_PLAID_SECRET` is set and correct
- Verify you're using **Sandbox** secret (not Development)

### Plaid Link doesn't open
- Check browser console for errors
- Verify link token was created successfully
- Check `react-plaid-link` is installed

### No transactions returned
- Sandbox accounts have limited test data
- Try different institution (e.g., Chase)
- Check date range (default: last 30 days)

### "Invalid credentials"
- Use `user_good` / `pass_good` for all Sandbox institutions
- Don't use real bank credentials in Sandbox

## ✅ Testing Checklist

- [ ] Plaid credentials added to `.env`
- [ ] Link token creates successfully
- [ ] Plaid Link UI opens
- [ ] Can select bank and login
- [ ] Public token received
- [ ] Access token exchanged
- [ ] Transactions fetched
- [ ] Spending calculated correctly
- [ ] Budget saved to store
- [ ] Redirects to dashboard

---

**You're now using real Plaid Sandbox API!** 🎉

The mock Plaid implementation has been replaced with the official Plaid SDK and real Sandbox data.

