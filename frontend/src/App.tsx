import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { HomePage } from './pages/HomePage'
import { OnboardingChoice } from './pages/OnboardingChoice'
import { LinkBankPage } from './pages/LinkBankPage'
import { ManualSetupPage } from './pages/BudgetSetup'
import { DashboardPage } from './pages/DashboardPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { Loading } from './components/common/Loading'
import { Toaster } from './components/ui/toaster'
import { ChatbotAssistant } from './components/chatbot/ChatbotAssistant'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuth0()

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/onboarding/choice"
          element={
            <ProtectedRoute>
              <OnboardingChoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/link-bank"
          element={
            <ProtectedRoute>
              <LinkBankPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/budget-setup"
          element={
            <ProtectedRoute>
              <ManualSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
      {isAuthenticated && <ChatbotAssistant />}
    </QueryClientProvider>
  )
}

export default App

