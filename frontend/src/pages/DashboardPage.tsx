import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import { RecommendedCards } from '@/components/cards/RecommendedCards'
import { CardDetailModal } from '@/components/cards/CardDetailModal'
import { MonthlyBudgetBreakdown } from '@/components/budget/MonthlyBudgetBreakdown'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useUserStore } from '@/store/userStore'
import { CreditCard, Merchant, ApiCreditCard } from '@/types'
import { fetchNearbyPlaces } from '@/lib/places'
import { recommendCardsForMerchant, calculatePotentialEarnings, getRecommendationReason } from '@/lib/recommendations'
import { MapPin, AlertCircle, Loader2, TrendingUp, DollarSign, Award, Sparkles, Star, TestTube, Edit, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNotification } from '@/contexts/NotificationContext'
import { getUserCards } from '@/lib/user-cards'
import { getTransactions, calculateSpendingFromTransactions } from '@/lib/plaid'

export function DashboardPage() {
  const { user } = useAuth0()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { location: storedLocation, budget, spending, onboardingCompleted, setLocation, currentCards, dwellRadiusMeters, linkedBank, setSpending } = useUserStore()
  const { location: geoLocation, error: geoError, loading: geoLoading, refetch } = useGeolocation()
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [apiCards, setApiCards] = useState<ApiCreditCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [userCards, setUserCards] = useState<CreditCard[]>([])
  const [cardOriginMap, setCardOriginMap] = useState<Record<string, 'manual' | 'bank'>>({})
  const [spendingLoading, setSpendingLoading] = useState(false)

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!onboardingCompleted) {
      navigate('/onboarding/choice')
    }
  }, [onboardingCompleted, navigate])

  // Fetch API cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cards')
        if (response.ok) {
          const data = await response.json()
          setApiCards(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching cards:', err)
      } finally {
        setCardsLoading(false)
      }
    }
    fetchCards()
  }, [])

  // Fetch user cards to get origins
  useEffect(() => {
    const fetchUserCardsOrigins = async () => {
      if (!user?.sub) return

      try {
        const userCardsData = await getUserCards(user.sub)

        // Convert API cards to CreditCard format for recommendations
        const cards: CreditCard[] = userCardsData.map((card: any) => ({
          id: card.card_cat_id.toString(),
          name: card.card_name,
          issuer: card.bank_name,
          network: card.network,
          logoUrl: '',
          imageUrl: '',
          primaryBenefit: '',
          secondaryBenefits: [],
          rewardsStructure: [],
          creditScoreRequired: '',
          fullDescription: '',
          applicationUrl: '',
          rewardRates: card.reward_summary || {},
          annualFee: 0, // Default value
          signupBonus: '', // Default value
          features: [] // Default value
        }))
        setUserCards(cards)

        const originMap: Record<string, 'manual' | 'bank'> = {}
        
        userCardsData.forEach(userCard => {
          originMap[userCard.card_cat_id] = userCard.origin || 'manual'
        })
        
        setCardOriginMap(originMap)
      } catch (err) {
        console.error('Error fetching user cards origins:', err)
      }
    }
    
    fetchUserCardsOrigins()
  }, [user?.sub])

  // Fetch current month spending if user has linked bank
  useEffect(() => {
    const fetchCurrentMonthSpending = async () => {
      if (!user?.sub || !linkedBank) return
      
      setSpendingLoading(true)
      try {
        // Get first day of current month
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const startDate = firstDay.toISOString().split('T')[0]
        const endDate = now.toISOString().split('T')[0]

        // Fetch transactions for current month
        const { transactions } = await getTransactions(undefined, user.sub, startDate, endDate)
        console.log(`Retrieved ${transactions.length} transactions for current month`)

        // Calculate spending by category
        const currentSpending = calculateSpendingFromTransactions(transactions)
        console.log('Current month spending:', currentSpending)

        // Update spending in store
        setSpending({
          dining: Math.round(currentSpending.dining),
          gas: Math.round(currentSpending.gas),
          groceries: Math.round(currentSpending.groceries),
          travel: Math.round(currentSpending.travel),
          shopping: Math.round(currentSpending.shopping),
          entertainment: Math.round(currentSpending.entertainment),
        })
      } catch (err) {
        console.error('Error fetching current month spending:', err)
      } finally {
        setSpendingLoading(false)
      }
    }

    fetchCurrentMonthSpending()
  }, [user?.sub, linkedBank, setSpending])

  // Manual refresh spending function
  const refreshSpending = async () => {
    if (!user?.sub || !linkedBank) return
    
    setSpendingLoading(true)
    try {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const startDate = firstDay.toISOString().split('T')[0]
      const endDate = now.toISOString().split('T')[0]

      const { transactions } = await getTransactions(undefined, user.sub, startDate, endDate)
      const currentSpending = calculateSpendingFromTransactions(transactions)

      setSpending({
        dining: Math.round(currentSpending.dining),
        gas: Math.round(currentSpending.gas),
        groceries: Math.round(currentSpending.groceries),
        travel: Math.round(currentSpending.travel),
        shopping: Math.round(currentSpending.shopping),
        entertainment: Math.round(currentSpending.entertainment),
      })

      showNotification('Spending data refreshed successfully!', 'success')
    } catch (err) {
      console.error('Error refreshing spending:', err)
      showNotification('Failed to refresh spending data', 'error')
    } finally {
      setSpendingLoading(false)
    }
  }

  // Update stored location when geolocation succeeds
  useEffect(() => {
    if (geoLocation) {
      setLocation(geoLocation)
      // Fetch real nearby places using Mapbox Places API
      fetchNearbyPlaces(geoLocation.lat, geoLocation.lng).then(nearby => {
        setMerchants(nearby)
      })
    }
  }, [geoLocation, setLocation])

  const currentLocation = geoLocation || storedLocation

  const handleCardClick = (card: CreditCard) => {
    setSelectedCard(card)
    setModalOpen(true)
  }

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
  }

  // Test notification functionality
  const handleTestNotification = async () => {
    if (!currentLocation) {
      showNotification('Location not available. Please enable location services.', 'error')
      return
    }
    
    try {
      // Fetch nearby places using custom radius from user settings
      const nearbyPlaces = await fetchNearbyPlaces(
        currentLocation.lat,
        currentLocation.lng,
        dwellRadiusMeters
      )

      if (nearbyPlaces.length === 0) {
        showNotification('No nearby places found. Try a different location or increase the search radius.', 'warning')
        return
      }

      // Get the closest merchant
      const testMerchant = nearbyPlaces[0]

      // Get recommended cards
      const recommendedCards = recommendCardsForMerchant(testMerchant, userCards)

      if (recommendedCards.length === 0) {
        showNotification('No card recommendations available for this merchant.', 'warning')
        return
      }

        const bestCard = recommendedCards[0]
        const earnings = calculatePotentialEarnings(testMerchant, bestCard)

        // Create test notification
        const testNotification = {
          merchant: testMerchant,
          recommendedCard: bestCard,
          reason: `Best rewards for ${testMerchant.category}`,
          estimatedEarnings: earnings,
          timestamp: Date.now(),
        }

        // Trigger a notification event that will be caught by the global notification system
        window.dispatchEvent(new CustomEvent('smart-notification', { 
          detail: testNotification 
        }))
    } catch (error) {
      console.error('Test notification failed:', error)
      showNotification('Failed to test notification. Check console for details.', 'error')
    }
  }

  if (!onboardingCompleted) {
    return null // Will redirect
  }

  const totalBudget = budget ? Object.values(budget).reduce((sum, val) => sum + val, 0) : 0

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Here are your personalized insights</p>
            </div>
            <Badge variant="outline" className="gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3" />
              Testing Member
            </Badge>
          </div>
          
          {/* Quick Stats */}
          {totalBudget > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 sm:p-4 border bg-card hover:shadow-md transition-shadow"
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
                <p className="text-lg sm:text-2xl font-bold">${totalBudget}</p>
                <p className="text-[10px] sm:text-xs opacity-80">Monthly Budget</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-3 sm:p-4 border bg-card hover:shadow-md transition-shadow"
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
                <p className="text-lg sm:text-2xl font-bold">{userCards.length}</p>
                <p className="text-[10px] sm:text-xs opacity-80">My Cards</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl p-3 sm:p-4 border bg-card hover:shadow-md transition-shadow"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
                <p className="text-lg sm:text-2xl font-bold">3.2x</p>
                <p className="text-[10px] sm:text-xs opacity-80">Avg. Rewards</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Location Status */}
        {/* Test Notification Button */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted border rounded-lg p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <TestTube className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1 text-sm sm:text-base">Test Smart Notifications</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Trigger a notification instantly using your current location
                  </p>
                </div>
              </div>
              <Button
                onClick={handleTestNotification}
                size="sm"
                className="w-full sm:w-auto flex-shrink-0"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Now
              </Button>
            </div>
          </motion.div>
        )}

        {geoLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted border rounded-lg p-4 flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Getting your location...</span>
          </motion.div>
        )}

        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Location Access Needed</p>
                <p className="text-sm text-muted-foreground mb-3">{geoError.message}</p>
                <Button onClick={refetch} size="sm" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map Section */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl">Nearby Merchants</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">Discover best cards for each location</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {merchants.length} locations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg overflow-hidden border">
                  <InteractiveMap
                    userLocation={currentLocation}
                    merchants={merchants}
                    onMerchantSelect={handleMerchantSelect}
                  />
                </div>
                {selectedMerchant && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-4"
                  >
                    {/* Merchant Info */}
                    <div className="p-4 bg-muted rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {selectedMerchant.name}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {selectedMerchant.category}
                          </p>
                          {selectedMerchant.address && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedMerchant.address}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          ~${selectedMerchant.estimatedSpend}
                        </Badge>
                      </div>
                    </div>

                    {/* Recommended Cards for this Location */}
                    <div className="bg-card rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 fill-current" />
                        <h4 className="font-semibold">Best Cards for This Location</h4>
                      </div>
                      <div className="space-y-2">
                        {recommendCardsForMerchant(selectedMerchant, userCards).map((card, index) => (
                          <motion.div
                            key={card.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCardClick(card)}
                            className="p-3 bg-muted rounded-lg border hover:border-primary cursor-pointer transition-all hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    #{index + 1}
                                  </Badge>
                                  <p className="font-semibold text-sm">{card.name}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {getRecommendationReason(selectedMerchant, card)}
                                </p>
                                <p className="text-xs font-medium">
                                  Earn: {calculatePotentialEarnings(selectedMerchant, card)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommended Cards */}
        {!cardsLoading && apiCards.length > 0 && (
          <RecommendedCards
            cards={apiCards}
            currentCards={currentCards}
            budget={budget ?? undefined}
            showAddButton={false}
            cardOrigins={cardOriginMap}
          />
        )}

        {/* Monthly Budget Breakdown */}
        {budget && (
          <div className="space-y-4">
            {linkedBank && (
              <div className="flex justify-end">
                <Button
                  onClick={refreshSpending}
                  disabled={spendingLoading}
                  variant="outline"
                  size="sm"
                >
                  {spendingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Spending
                    </>
                  )}
                </Button>
              </div>
            )}
            <MonthlyBudgetBreakdown
              budget={budget}
              spending={spending}
              title={linkedBank ? "Current Month Spending vs Budget" : "Budget Breakdown"}
              description={linkedBank ? "Track your progress this month" : "Monthly budget allocation"}
              showTotal={true}
              actionButton={{
                label: 'Manage',
                icon: <Edit className="w-4 h-4 mr-2" />,
                onClick: () => navigate('/budget')
              }}
              animationDelay={0.3}
            />
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

