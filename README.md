# SwipeRight - Smart Credit Card Recommendations

AI-powered credit card recommendation platform that helps users maximize their rewards based on location and spending habits.

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

#### Frontend (.env)
Create `frontend/.env`:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### Backend (.env)
Create `backend/.env`:
```env
PORT=3001
DATABASE_URL=your_database_url
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

### Running the Application

#### Development Mode

**Frontend** (from `frontend/` directory):
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

**Backend** (from `backend/` directory):
```bash
npm run dev
```
The backend will run on `http://localhost:3001`

#### Production Build

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

**Backend**:
```bash
cd backend
npm run build
npm start
```

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **ShadCN UI** - Component library
- **Framer Motion** - Animations
- **Mapbox GL** - Interactive maps
- **Auth0** - Authentication
- **Zustand** - State management
- **React Query** - Data fetching
- **Plaid Link** - Bank account linking

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Plaid API** - Financial data integration

## 📱 Features

- 🗺️ **Location-based recommendations** - Find the best credit cards for nearby merchants
- 🤖 **AI-powered insights** - Smart recommendations using Google Gemini AI
- 💳 **Credit card comparison** - Detailed card information and benefits
- 📊 **Spending analysis** - Track and categorize your spending
- 🏦 **Bank integration** - Connect accounts via Plaid
- 🎯 **Personalized profiles** - Custom budget and spending categories

## 🔒 Security

- Secure authentication via Auth0
- Bank-level encryption for financial data
- Environment variables for sensitive credentials
- CORS protection on backend API

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributors

Built with ❤️ for HackUTA

---

**Note**: This is a hackathon project. For production use, additional security measures and error handling should be implemented.
