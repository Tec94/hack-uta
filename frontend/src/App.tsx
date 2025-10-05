import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { HomePage } from './pages/HomePage'
import { OnboardingChoice } from './pages/OnboardingChoice'
import { LinkBankPage } from './pages/LinkBankPage'
import { ManualSetupPage } from './pages/BudgetSetup'
import { ChooseYourCardPage } from './pages/ChooseYourCard'
import { CreditCardManagementPage } from './pages/CreditCardManagement'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { Loading } from './components/common/Loading'
import { Toaster } from './components/ui/toaster'
import { ChatbotAssistant } from './components/chatbot/ChatbotAssistant'
import { ToastNotification } from './components/notifications/ToastNotification'
import { useSmartNotifications } from './hooks/useSmartNotifications'
import { mockCreditCards } from './data/mock-cards'
import type { SmartNotification } from './types'
import { NotificationProvider } from './contexts/NotificationContext'

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

function SmartNotificationProvider() {
  const navigate = useNavigate()
  
  // Smart notifications hook
  const { currentNotification } = useSmartNotifications({
    cards: mockCreditCards,
    enabled: true,
  })

  const [notificationToShow, setNotificationToShow] = useState<SmartNotification | null>(null)

  // Update notification state when new notification arrives from location monitoring
  useEffect(() => {
    if (currentNotification && currentNotification !== notificationToShow) {
      setNotificationToShow(currentNotification)
    }
  }, [currentNotification, notificationToShow])

  // Listen for test notifications from Dashboard
  useEffect(() => {
    const handleTestNotification = (event: CustomEvent<SmartNotification>) => {
      setNotificationToShow(event.detail)
    }

    window.addEventListener('smart-notification', handleTestNotification as EventListener)
    return () => {
      window.removeEventListener('smart-notification', handleTestNotification as EventListener)
    }
  }, [])

  const handleDismissNotification = () => {
    setNotificationToShow(null)
  }

  const handleNotificationTap = () => {
    if (notificationToShow) {
      // Navigate to dashboard and show the merchant/card
      navigate('/dashboard')
      setNotificationToShow(null)
    }
  }

  return (
    <ToastNotification
      notification={notificationToShow}
      onDismiss={handleDismissNotification}
      onTap={handleNotificationTap}
      autoHideDuration={8000}
    />
  )
}

function App() {
  const { isAuthenticated } = useAuth0()

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
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
            path="/onboarding/choose-card"
            element={
              <ProtectedRoute>
                <ChooseYourCardPage />
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
            path="/cards"
            element={
              <ProtectedRoute>
                <CreditCardManagementPage />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
        {isAuthenticated && (
          <>
            <ChatbotAssistant />
            <SmartNotificationProvider />
          </>
        )}
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App

