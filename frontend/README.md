# Credily - Credit Card Optimization App

> **React + Vite + TypeScript fintech application for optimizing credit card rewards**

## 🚀 Quick Start

```bash
cd Credily
npm install --legacy-peer-deps
# Create .env file (see below)
npm run dev
```

## 📚 Complete Documentation

**👉 Everything you need is in [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)**

This single file contains:
- ✅ 5-minute quick start
- ✅ Detailed setup instructions  
- ✅ Complete feature list
- ✅ Troubleshooting guide
- ✅ Deployment instructions
- ✅ Architecture details

## ⚡ Super Quick Setup

### 1. Install
```bash
npm install --legacy-peer-deps
```

### 2. Configure Auth0
- Create **Single Page Application** at [auth0.com](https://auth0.com)
- Add callback URL: `http://localhost:5173`

### 3. Get Mapbox Token
- Sign up at [mapbox.com](https://www.mapbox.com/)
- Copy your public token

### 4. Create `.env`
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_GEMINI_API_KEY=optional-gemini-key
VITE_BACKEND_URL=http://localhost:3000
```

### 5. Run
```bash
npm run dev
```

Open http://localhost:5173

## 🎯 Demo Flow

1. Click "Get Started Free"
2. Sign up with Auth0
3. Choose "Link Bank Account"
4. Use demo credentials: `demo_user` / `demo_pass`
5. Explore dashboard with interactive map!

## 🛠️ Tech Stack

- **React 18** + **Vite** for blazing-fast development
- **TypeScript** for type safety
- **React Router** for navigation
- **Tailwind CSS** + **Shadcn/ui** for styling
- **Auth0** for authentication
- **Mapbox** for interactive maps
- **Gemini AI** for recommendations (optional)
- **Framer Motion** for animations
- **Zustand** for state management

## 📁 Project Structure

```
src/
├── pages/          # Route components
├── components/     # Reusable UI components
├── lib/            # Utilities & integrations
├── hooks/          # Custom React hooks
├── store/          # Zustand state
├── data/           # Mock data
└── types/          # TypeScript types
```

## 📖 Full Documentation

For everything else, see **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)**:

- Complete setup instructions
- Auth0 configuration details
- Mapbox integration
- Feature documentation
- Deployment guides (Vercel, Netlify)
- Troubleshooting
- Environment variables reference
- API integration details
- And much more...

## 🚀 Deployment

```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static host

See [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md#deployment) for detailed instructions.

## 🤝 Features

- ✅ Auth0 authentication
- ✅ Interactive Mapbox maps
- ✅ AI-powered recommendations
- ✅ Mock Plaid bank linking
- ✅ Credit card carousel
- ✅ Budget tracking
- ✅ Mobile-first design
- ✅ Progressive Web App

## 📞 Need Help?

1. Read [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)
2. Check browser console (F12)
3. Verify `.env` variables have `VITE_` prefix
4. Ensure Auth0 is configured as **Single Page Application**

---

**Built for HackUTA 2024** 🎉
