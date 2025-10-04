# 🚀 SwipeRight - Complete Guide (All-in-One)

> **Credit Card Optimization Web App - React + Vite + TypeScript**

---

## 📍 Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [What is SwipeRight?](#what-is-swiperight)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Detailed Setup](#detailed-setup)
6. [Features & User Flow](#features--user-flow)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Next.js to React Conversion Notes](#nextjs-to-react-conversion-notes)

---

# Quick Start (5 Minutes)

## Step 1: Install Dependencies

```bash
cd SwipeRight
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag resolves peer dependency conflicts between packages.

## Step 2: Configure Auth0 (2 minutes)

1. Go to **https://auth0.com** and create a free account
2. Create new Application → **Single Page Application** ⚠️ (NOT Regular Web App!)
3. In Settings, add these URLs:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Copy your Domain and Client ID

## Step 3: Get Mapbox Token (1 minute)

1. Sign up at **https://www.mapbox.com/**
2. Copy your **Default Public Token** from account page

## Step 4: Create .env File

Create a `.env` file in the SwipeRight folder:

```env
# Auth0 (REQUIRED)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000

# Mapbox (REQUIRED)
VITE_MAPBOX_TOKEN=your-mapbox-token

# Gemini AI (OPTIONAL - has fallback)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

⚠️ **Important**: All variables must have `VITE_` prefix!

## Step 5: Run the App

```bash
npm run dev
```

Open **http://localhost:3000**

## Step 6: Test the Demo

1. Click **"Get Started Free"**
2. Sign up with Auth0
3. Choose **"Link Bank Account"**
4. Select any bank
5. Use pre-filled credentials: `demo_user` / `demo_pass`
6. Explore the dashboard!

---

# What is SwipeRight?

SwipeRight is a mobile-first fintech web application that helps users optimize their credit card rewards through intelligent, AI-powered recommendations based on location and spending habits.

## Key Features

✅ **Auth0 Authentication** - Secure user login and session management  
✅ **Interactive Maps** - Mapbox GL JS with nearby merchant detection  
✅ **AI Recommendations** - Gemini API for intelligent card suggestions  
✅ **Mock Plaid Integration** - Realistic bank linking simulation  
✅ **Smart Onboarding** - Link bank or manual budget setup  
✅ **Real-Time Location** - Browser Geolocation API  
✅ **Card Management** - Track and optimize multiple credit cards  
✅ **Mobile-First Design** - Touch-friendly, responsive interface  
✅ **Progressive Web App** - Installable with offline capabilities  

## What You'll See

- 🗺️ Interactive map with merchant markers
- 💳 Credit card carousel (6 detailed cards)
- 🤖 AI-powered recommendations
- 📱 Mobile-responsive design
- 🎨 Smooth animations
- 📊 Budget tracking and visualization

---

# Tech Stack

## Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast development and builds
- **React Router v6** - Client-side routing
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Accessible component library
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management

## Integrations
- **Auth0 React SDK** - Authentication (`@auth0/auth0-react`)
- **Mapbox GL JS** - Interactive maps
- **Gemini API** - AI recommendations (optional)
- **React Query** - Server state management
- **Embla Carousel** - Touch-friendly carousels

## Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

# Project Structure

```
SwipeRight/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── OnboardingChoice.tsx  # Choose setup method
│   │   ├── LinkBankPage.tsx      # Mock Plaid integration
│   │   ├── ManualSetupPage.tsx   # Budget sliders
│   │   ├── DashboardPage.tsx     # Main dashboard
│   │   ├── RecommendationsPage.tsx # Card recommendations
│   │   └── ProfilePage.tsx       # User profile
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── slider.tsx
│   │   ├── cards/                # Card components
│   │   │   ├── CardsCarousel.tsx
│   │   │   ├── CreditCardItem.tsx
│   │   │   └── CardDetailModal.tsx
│   │   ├── map/
│   │   │   └── InteractiveMap.tsx
│   │   ├── navigation/
│   │   │   └── BottomNav.tsx
│   │   └── common/
│   │       └── Loading.tsx
│   ├── lib/                      # Utilities
│   │   ├── utils.ts              # Helper functions
│   │   ├── gemini.ts             # AI integration
│   │   └── geolocation.ts        # Location services
│   ├── hooks/
│   │   └── useGeolocation.ts     # Location hook
│   ├── store/
│   │   └── userStore.ts          # Zustand state
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── data/                     # Mock data
│   │   ├── mock-cards.ts         # 6 credit cards
│   │   ├── mock-merchants.ts     # Nearby merchants
│   │   └── mock-transactions.ts  # Transaction generator
│   ├── App.tsx                   # Main app with routes
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── public/
│   └── manifest.json             # PWA manifest
├── index.html                    # HTML template
├── vite.config.ts                # Vite configuration
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── .env                          # Environment variables
```

---

# Detailed Setup

## Prerequisites

- **Node.js 18+** installed
- **npm**, **yarn**, or **pnpm** package manager
- **Auth0 account** (free tier works)
- **Mapbox account** (free tier works)
- **Gemini API key** (optional - has fallback)

## Installation Steps

### 1. Install Dependencies

```bash
cd SwipeRight
npm install --legacy-peer-deps
```

**Note**: Use `--legacy-peer-deps` to avoid peer dependency conflicts.

This installs 20+ packages including:
- React, React Router, TypeScript
- Vite, Tailwind CSS
- Auth0, Mapbox, Gemini SDKs
- Framer Motion, Zustand, React Query
- Embla Carousel, Lucide icons

### 2. Auth0 Setup (Detailed)

**Create Auth0 Application:**

1. Go to [auth0.com](https://auth0.com) and sign up
2. Dashboard → Applications → **Create Application**
3. Name: "SwipeRight" or any name
4. Type: **Single Page Application** ⚠️ **Important!**
5. Click **Create**

**Configure Settings:**

In the application settings:

- **Allowed Callback URLs**: `http://localhost:3000`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`
- **Allowed Origins (CORS)**: `http://localhost:3000`

**Save Changes**

**Copy Credentials:**

From the Basic Information section:
- Domain (e.g., `dev-abc123.us.auth0.com`)
- Client ID (e.g., `aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

### 3. Mapbox Setup

1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to **Account** → **Tokens**
3. Copy your **Default Public Token** (starts with `pk.`)
4. Token scopes needed: `styles:tiles`, `styles:read`

### 4. Gemini API Setup (Optional)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

**Note**: Gemini is optional. The app has fallback recommendations if not configured.

### 5. Environment Variables

Create `.env` file in root directory:

```env
# Auth0 Configuration (REQUIRED)
VITE_AUTH0_DOMAIN=dev-abc123.us.auth0.com
VITE_AUTH0_CLIENT_ID=aBcDeFgHiJkLmNoPqRsTuVwXyZ
VITE_AUTH0_REDIRECT_URI=http://localhost:3000

# Mapbox Configuration (REQUIRED)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsb...

# Gemini AI (OPTIONAL - has fallback)
VITE_GEMINI_API_KEY=AIzaSyD...
```

⚠️ **Critical**: All variables MUST start with `VITE_` prefix!

### 6. Run Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

You should see:
```
VITE v5.1.4  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

---

# Features & User Flow

## Complete User Journey

### 1. **Homepage (Unauthenticated)**
- **URL**: `/`
- **Features**:
  - Hero section with value proposition
  - Feature showcase (4 key benefits)
  - "Get Started Free" CTA button
  - Mobile-responsive design
- **Action**: Click "Get Started" → Auth0 Login

### 2. **Auth0 Login**
- **Universal Login** page (Auth0 hosted)
- Sign up or log in with:
  - Email/Password
  - Google
  - Other social providers
- **Redirect**: Returns to app after authentication

### 3. **Onboarding Choice**
- **URL**: `/onboarding/choice`
- **Two Options**:

**Option A: Link Bank Account**
- Automatic transaction analysis
- Real spending patterns
- No manual data entry
- Mock Plaid simulation

**Option B: Manual Setup**
- Privacy-focused
- Set own budgets
- Faster setup
- Full control

### 4A. **Link Bank Page** (Mock Plaid)
- **URL**: `/onboarding/link-bank`
- **Flow**:
  1. Select bank (Chase, Bank of America, Wells Fargo, Citi)
  2. Enter credentials (pre-filled: `demo_user` / `demo_pass`)
  3. Processing animation (2 seconds)
  4. Generate 30 days of mock transactions
  5. Calculate spending by category
  6. Redirect to dashboard

### 4B. **Manual Setup Page**
- **URL**: `/onboarding/manual-setup`
- **Features**:
  - 6 budget category sliders:
    - 🍽️ Dining & Restaurants
    - ⛽ Gas & Fuel
    - 🛒 Groceries
    - ✈️ Travel & Hotels
    - 🛍️ Shopping & Retail
    - 🎬 Entertainment
  - Real-time total calculation
  - Range: $0 - $1,000 per category
  - Save to Zustand store
  - Redirect to dashboard

### 5. **Dashboard** (Main App)
- **URL**: `/dashboard`
- **Sections**:

**Header**
- Welcome message with user's first name
- Personalized tagline

**Location Status**
- Loading indicator while fetching location
- Error message if permission denied
- "Try Again" button for retry

**Interactive Map** (300px mobile, 400px desktop)
- User location marker (blue)
- Nearby merchant markers (color-coded by category)
- Click markers for merchant info popup
- 12px border radius, shadow effect
- Navigation controls (zoom, rotate)

**Recommended Cards Carousel**
- Horizontal scrolling (Embla)
- Card size: 280px × 160px
- Show 1.2 cards on mobile, 3 on desktop
- 16px gap between cards
- Gradient backgrounds
- Hover effects and animations
- Click to open detail modal

**Spending Overview**
- Monthly budget by category
- Visual cards with amounts
- Color-coded by category

**Bottom Navigation** (Fixed)
- 4 tabs: Home, For You, Add (disabled), Profile
- Active state highlighting
- Touch-friendly 44px targets
- 80px height with safe area support

### 6. **Recommendations Page**
- **URL**: `/recommendations`
- **Features**:
  - Top 3 personalized card picks
  - AI-based recommendation logic
  - All other cards grid
  - Sign-up bonuses highlighted
  - Annual fee display
  - Click cards for details
  - AI insights based on spending

### 7. **Profile Page**
- **URL**: `/profile`
- **Sections**:

**User Info**
- Profile picture (from Auth0)
- Name and email
- Account status badge
- Data source indicator (Bank/Manual)

**Spending Budget**
- Total monthly budget
- Category breakdown with progress bars
- Visual percentages
- "Update Budget" button

**Credit Cards Section**
- List of user's cards (placeholder)
- "Add Credit Card" button

**Account Actions**
- Settings & Privacy button
- Log Out button (red)

---

# Environment Variables

## Required Variables

### VITE_AUTH0_DOMAIN
- **Description**: Your Auth0 tenant domain
- **Example**: `dev-abc123.us.auth0.com`
- **Where to Find**: Auth0 Dashboard → Applications → Your App → Domain

### VITE_AUTH0_CLIENT_ID
- **Description**: Auth0 application client ID
- **Example**: `aBcDeFgHiJkLmNoPqRsTuVwXyZ123456`
- **Where to Find**: Auth0 Dashboard → Applications → Your App → Client ID

### VITE_AUTH0_REDIRECT_URI
- **Description**: Where Auth0 redirects after login
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

### VITE_MAPBOX_TOKEN
- **Description**: Mapbox public access token
- **Example**: `pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsb...`
- **Where to Find**: Mapbox Dashboard → Account → Tokens
- **Must Start With**: `pk.`

## Optional Variables

### VITE_GEMINI_API_KEY
- **Description**: Google Gemini API key for AI recommendations
- **Example**: `AIzaSyD...`
- **Where to Find**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **If Not Set**: Uses fallback recommendation logic

## Important Notes

⚠️ **All variables must have `VITE_` prefix** for Vite to expose them to the client.

⚠️ **Never commit `.env` file** - It's in `.gitignore` by default.

⚠️ **Production deployment**: Set these in your hosting platform's environment variables.

---

# Deployment

## Deploy to Vercel

### Step 1: Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/swiperight.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **"Deploy"**

### Step 3: Configure Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `.env` file:
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`
   - `VITE_AUTH0_REDIRECT_URI` (update to your Vercel URL!)
   - `VITE_MAPBOX_TOKEN`
   - `VITE_GEMINI_API_KEY` (optional)
3. Click **"Save"**
4. Redeploy to apply changes

### Step 4: Update Auth0

1. Go to Auth0 Dashboard
2. Update your application settings:
   - **Allowed Callback URLs**: Add `https://yourdomain.vercel.app`
   - **Allowed Logout URLs**: Add `https://yourdomain.vercel.app`
   - **Allowed Web Origins**: Add `https://yourdomain.vercel.app`
3. Save changes

## Deploy to Netlify

### Option 1: Drag & Drop

```bash
npm run build
```

Drag the `dist` folder to Netlify's drop zone.

### Option 2: Git Integration

1. Go to [netlify.com](https://www.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`
6. Add environment variables in **Site settings** → **Environment variables**
7. Deploy!

### Configure Redirects

Create `public/_redirects` file:

```
/*    /index.html   200
```

This ensures React Router works correctly.

## Other Hosting Options

- **AWS Amplify**: Supports Vite out of the box
- **Cloudflare Pages**: Fast global CDN
- **GitHub Pages**: Free static hosting
- **Firebase Hosting**: Google's hosting solution

---

# Troubleshooting

## Common Issues

### 1. Auth0 Errors

**"Callback URL mismatch"**
- ✅ Check Auth0 dashboard URLs match exactly
- ✅ No trailing slashes in URLs
- ✅ Protocol must match (http vs https)
- ✅ Port number must match

**"Invalid state"**
- ✅ Clear browser cache and cookies
- ✅ Try incognito/private window
- ✅ Check `VITE_AUTH0_REDIRECT_URI` is correct

**"Login required"**
- ✅ Verify Auth0 application type is **Single Page Application**
- ✅ Check all `VITE_AUTH0_*` variables are set
- ✅ Ensure no typos in domain or client ID

### 2. Map Issues

**Map not showing**
- ✅ Verify `VITE_MAPBOX_TOKEN` is set correctly
- ✅ Token must start with `pk.`
- ✅ Check browser console for errors
- ✅ Verify token hasn't expired

**Markers not appearing**
- ✅ Check location permission was granted
- ✅ Look for console errors
- ✅ Verify merchants data is generating correctly

### 3. Location Errors

**"Location permission denied"**
- ✅ Click "Try Again" button
- ✅ Check browser location settings
- ✅ Enable location for localhost in browser
- ✅ Try Chrome if using Firefox (better support)

**"Location unavailable"**
- ✅ Check internet connection
- ✅ Disable VPN if using one
- ✅ Try different browser

### 4. Build Errors

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
npx tsc --noEmit
```
Fix reported errors, then:
```bash
npm run dev
```

**Vite errors**
```bash
rm -rf node_modules .vite dist
npm install
npm run dev
```

### 5. Environment Variable Issues

**Variables not loading**
- ✅ All variables must have `VITE_` prefix
- ✅ Restart dev server after changing `.env`
- ✅ Check for typos in variable names
- ✅ Ensure `.env` is in root directory (not `src/`)

**Console shows "undefined"**
```javascript
// ❌ Wrong
const token = process.env.VITE_MAPBOX_TOKEN

// ✅ Correct
const token = import.meta.env.VITE_MAPBOX_TOKEN
```

### 6. Performance Issues

**Slow page load**
- ✅ Check network tab in DevTools
- ✅ Verify API responses are cached
- ✅ Check bundle size: `npm run build`

**Map lagging**
- ✅ Reduce number of markers
- ✅ Check for memory leaks
- ✅ Close browser tabs

### 7. Deployment Issues

**Vercel deployment fails**
- ✅ Check build logs for errors
- ✅ Verify all environment variables are set
- ✅ Test production build locally: `npm run build && npm run preview`

**404 on refresh**
- ✅ Add redirects configuration
- ✅ For Vercel: Create `vercel.json`
- ✅ For Netlify: Create `public/_redirects`

## Getting Help

1. **Check Browser Console** (F12) - Most errors show here
2. **Read Error Messages** - They usually tell you what's wrong
3. **Check Documentation** - This guide covers most issues
4. **Verify Environment Variables** - 90% of issues are config-related
5. **Try Incognito Mode** - Rules out cache issues

---

# Next.js to React Conversion Notes

## What Changed

Your app was converted from **Next.js 14** to **React 18 + Vite**. Here's what's different:

### Framework Changes

**Before (Next.js)**:
- File-based routing in `src/app/`
- Server Components + Client Components
- API Routes in `src/app/api/`
- `@auth0/nextjs-auth0` SDK
- `next.config.js` configuration

**After (React + Vite)**:
- React Router v6 with `src/pages/`
- All client-side components
- No API routes (pure frontend)
- `@auth0/auth0-react` SDK
- `vite.config.ts` configuration

### Auth0 Setup Changed

**Before**: Regular Web Application  
**After**: Single Page Application ⚠️

**Before**: Server-side sessions with `AUTH0_SECRET`  
**After**: Client-side tokens (no secret needed)

### Environment Variables Changed

**Before**:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=...
AUTH0_SECRET=...
AUTH0_BASE_URL=...
```

**After**:
```env
VITE_MAPBOX_TOKEN=...
# No AUTH0_SECRET needed
VITE_AUTH0_REDIRECT_URI=...
```

### Code Changes

**Navigation**:
```tsx
// Before
import Link from 'next/link'
<Link href="/dashboard">Dashboard</Link>

// After
import { Link } from 'react-router-dom'
<Link to="/dashboard">Dashboard</Link>
```

**Authentication**:
```tsx
// Before
import { getSession } from '@auth0/nextjs-auth0'
const session = await getSession()

// After
import { useAuth0 } from '@auth0/auth0-react'
const { user, isAuthenticated } = useAuth0()
```

**Environment Variables**:
```tsx
// Before
process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// After
import.meta.env.VITE_MAPBOX_TOKEN
```

## Benefits of React + Vite

1. ⚡ **Faster Development**: Instant HMR, no slow rebuilds
2. 📦 **Smaller Bundles**: No Next.js runtime overhead
3. 🔧 **Simpler Setup**: Pure client-side, easier to understand
4. 🚀 **Better Performance**: Faster page loads, optimized builds
5. 💰 **Cheaper Hosting**: Static files only, no server needed

## All Features Preserved

Everything works exactly the same:
- ✅ Auth0 authentication
- ✅ Interactive maps
- ✅ AI recommendations
- ✅ Mock Plaid integration
- ✅ All 7 pages/routes
- ✅ State management
- ✅ Mobile design
- ✅ Animations

---

# Additional Resources

## Commands Reference

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without compiling

# Cleanup
rm -rf node_modules  # Remove dependencies
rm -rf .vite dist    # Remove build cache
```

## File Management

**Configuration Files**:
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS config
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.cjs` - ESLint rules
- `postcss.config.js` - PostCSS plugins

**Entry Points**:
- `index.html` - HTML template
- `src/main.tsx` - JavaScript entry point
- `src/App.tsx` - Main app component
- `src/index.css` - Global styles

## Design Principles

- **Mobile-First**: Design for mobile, enhance for desktop
- **Touch-Friendly**: 44px minimum touch targets
- **Accessible**: ARIA labels, keyboard navigation
- **Performant**: <2s load time, >90 Lighthouse score
- **Progressive**: Core features work without JS

## Tech Decisions

**Why React + Vite?**
- Faster development than Next.js
- Simpler architecture for this use case
- Better suited for pure client-side apps
- Lower hosting costs

**Why Zustand?**
- Lightweight (1KB)
- Simple API
- No boilerplate
- Perfect for this app's needs

**Why React Router?**
- Industry standard
- Excellent TypeScript support
- Client-side navigation
- Easy to learn

**Why Tailwind CSS?**
- Rapid development
- Consistent design
- Mobile-first
- Great with Shadcn/ui

---

# 🎉 You're All Set!

Your SwipeRight fintech app is ready to go! Here's your checklist:

- ✅ Dependencies installed (`npm install`)
- ✅ Auth0 configured (Single Page Application)
- ✅ Mapbox token added
- ✅ `.env` file created with all variables
- ✅ Dev server running (`npm run dev`)
- ✅ App opens at http://localhost:3000

## Quick Test

1. Open http://localhost:3000
2. Click "Get Started Free"
3. Sign up with Auth0
4. Choose "Link Bank Account"
5. Use demo credentials: `demo_user` / `demo_pass`
6. Explore the dashboard!

## Next Steps

- 📱 Test on mobile device
- 🎨 Customize colors in `tailwind.config.ts`
- 🗺️ Add more merchants in `src/data/mock-merchants.ts`
- 💳 Add more cards in `src/data/mock-cards.ts`
- 🚀 Deploy to Vercel or Netlify
- 🔄 Connect real Plaid API
- 📊 Add analytics

## Support

- **Issues?** Check the [Troubleshooting](#troubleshooting) section
- **Questions?** Review this guide
- **Bugs?** Check browser console (F12)
- **Auth0?** Verify SPA configuration
- **Maps?** Check Mapbox token

---

**Built with ❤️ for HackUTA 2024**

*React 18 • Vite • TypeScript • Tailwind CSS • Auth0 • Mapbox • Gemini AI*

