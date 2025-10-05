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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { useSmartNotifications } from './hooks/useSmartNotifications'
import type { SmartNotification, CreditCard } from './types'
import { NotificationProvider } from './contexts/NotificationContext'
import { Sparkles, TrendingUp } from 'lucide-react'

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
  const { user } = useAuth0()
  const [userCards, setUserCards] = useState<CreditCard[]>([])
  
  // Fetch user cards
  useEffect(() => {
    const fetchUserCards = async () => {
      if (!user?.sub) return
      
      try {
        const response = await fetch(`http://localhost:3000/api/user-cards/${user.sub}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            // Convert API cards to CreditCard format
            const cards: CreditCard[] = data.data.map((card: any) => ({
              id: card.card_cat_id.toString(),
              name: card.card_name,
              issuer: card.bank_name,
              network: card.network,
              rewardRates: card.reward_summary || {},
              annualFee: 0,
              signupBonus: '',
              features: []
            }))
            setUserCards(cards)
          }
        }
      } catch (err) {
        console.error('Error fetching user cards:', err)
      }
    }
    fetchUserCards()
  }, [user?.sub])
  
  // Smart notifications hook
  const { currentNotification } = useSmartNotifications({
    cards: userCards,
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

  const formatRewardRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
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
      
      {/* Card Detail Modal - Same style as Card Management Page */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-foreground">{selectedCard.name}</DialogTitle>
                <p className="text-sm text-foreground">{selectedCard.issuer}</p>
              </DialogHeader>

              {/* Card Visual */}
              <div className="w-full h-48 bg-primary rounded-xl p-6 text-primary-foreground mb-6 relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    {selectedCard.network && <Badge variant="secondary">{selectedCard.network}</Badge>}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedCard.name}</h3>
                    <p className="text-sm opacity-90">{selectedCard.issuer}</p>
                  </div>
                </div>
              </div>

              {/* Reward Categories */}
              {selectedCard.rewardRates && Object.keys(selectedCard.rewardRates).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-foreground" />
                    Rewards Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedCard.rewardRates)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, rate]) => (
                        <div key={category} className="bg-muted rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-foreground capitalize mb-1">{category.replace(/_/g, ' ')}</p>
                              <p className="text-2xl font-bold text-foreground">{formatRewardRate(rate)}</p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-primary mt-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Card Info */}
              <div className="space-y-4">
                {selectedCard.network && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Card Network</h4>
                    <p className="text-sm text-foreground">{selectedCard.network}</p>
                  </div>
                )}
                {notificationToShow && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Why this card?</h4>
                    <p className="text-sm text-foreground">{notificationToShow.reason}</p>
                    <p className="text-sm text-primary font-semibold mt-2">
                      Estimated earnings: {notificationToShow.estimatedEarnings}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
