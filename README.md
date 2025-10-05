# Credify - Smart Credit Card Optimizer

**Never miss out on credit card rewards again.**

AI-powered platform that ensures you're always using the right card at the right place. Get real-time notifications, personalized recommendations, and maximize every purchase.

## 🏗️ Project Structure

```
hack-uta/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions and integrations
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # State management (Zustand)
│   │   ├── types/        # TypeScript type definitions
│   │   └── data/         # Mock data
│   └── package.json
│
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   └── config/       # Configuration files
│   └── package.json
│
└── package.json       # Root dependencies (Plaid)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hack-uta
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

### Environment Variables

Create `backend/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/credify
GEMINI_API_KEY=your_gemini_api_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

Create `frontend/.env`:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
```

### Running the Application

**Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3000`

**Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Database Setup

Ensure PostgreSQL is installed and running, then create the database:
```bash
createdb credify
```
The backend will automatically create tables on first run.

## 🎨 Tech Stack

### Frontend
- **React 18** + **TypeScript** - UI framework with type safety
- **Vite** - Fast build tool
- **Tailwind CSS** + **Shadcn UI** - Modern styling
- **Framer Motion** - Smooth animations
- **Mapbox GL JS** - Interactive maps
- **Auth0** - Secure authentication
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management

### Backend
- **Node.js** + **Express** + **TypeScript** - Robust API server
- **PostgreSQL** - Production database
- **Google Gemini AI** - AI-powered insights
- **Plaid API** - Bank integration
- **Mapbox Places API** - Location services

## ✨ Key Features

- 🎯 **Smart Location Detection** - Get instant notifications when you arrive at stores
- 🤖 **AI-Powered Insights** - Gemini AI analyzes spending patterns and recommends optimal cards
- 💰 **Budget Optimization** - Track spending, get personalized insights, discover savings opportunities
- ✈️ **Points Maximization** - Compare transfer rates to airline and hotel partners
- 🏦 **Bank Integration** - Securely connect accounts via Plaid
- 🗺️ **Interactive Maps** - Visualize nearby merchants and best card recommendations

## 🔌 API Endpoints

```
Health & Status
GET  /health
GET  /gemini-health

Credit Cards
GET  /api/cards
GET  /api/user-cards/:user_id
POST /api/user-cards
GET  /api/transfer-rates

AI Insights
POST /api/insights/cards
POST /api/insights/recommend-cards
POST /api/insights/budget
```

---

## 🏆 Built for HackUTA

**Credify** - Spend smart. Earn more. Every purchase, optimized.

Made with ❤️ using React, TypeScript, PostgreSQL, and Google Gemini AI.
