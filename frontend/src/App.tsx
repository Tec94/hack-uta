import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { AnimatePresence, motion } from 'framer-motion'
import { HomePage } from './pages/HomePage'
import { OnboardingChoice } from './pages/OnboardingChoice'
import { LinkBankPage } from './pages/LinkBankPage'
import { ManualSetupPage } from './pages/BudgetSetup'
import { ChooseYourCardPage } from './pages/ChooseYourCard'
import { CreditCardManagementPage } from './pages/CreditCardManagement'
import { TransferRatesPage } from './pages/TransferRatesPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { BudgetManagementPage } from './pages/BudgetManagementPage'
import { Loading } from './components/common/Loading'
import { Toaster } from './components/ui/toaster'
import { ChatbotAssistant } from './components/chatbot/ChatbotAssistant'
import { ToastNotification } from './components/notifications/ToastNotification'
import { CardDetailModal } from './components/cards/CardDetailModal'
import { useSmartNotifications } from './hooks/useSmartNotifications'
import { mockCreditCards } from './data/mock-cards'
import type { SmartNotification, CreditCard } from './types'
import { NotificationProvider } from './contexts/NotificationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

// Page transition wrapper component
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

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
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [cardModalOpen, setCardModalOpen] = useState(false)

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

  const handleCardClick = (card: CreditCard) => {
    setSelectedCard(card)
    setCardModalOpen(true)
  }

  return (
    <>
      <ToastNotification
        notification={notificationToShow}
        onDismiss={handleDismissNotification}
        onTap={handleNotificationTap}
        onCardClick={handleCardClick}
        autoHideDuration={8000}
      />
      <CardDetailModal
        card={selectedCard}
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
      />
    </>
  )
}

function App() {
  const { isAuthenticated } = useAuth0()
  const location = useLocation()

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route
            path="/onboarding/choice"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <OnboardingChoice />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/link-bank"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <LinkBankPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/choose-card"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ChooseYourCardPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/budget-setup"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ManualSetupPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <CreditCardManagementPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer-rates"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <TransferRatesPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <BudgetManagementPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          </Routes>
        </AnimatePresence>
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
