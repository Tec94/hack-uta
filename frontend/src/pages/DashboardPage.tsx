import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import { CardsCarousel } from '@/components/cards/CardsCarousel'
import { CardDetailModal } from '@/components/cards/CardDetailModal'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useUserStore } from '@/store/userStore'
import { CreditCard, Merchant } from '@/types'
import { mockCreditCards } from '@/data/mock-cards'
import { generateNearbyMerchants } from '@/data/mock-merchants'
import { MapPin, AlertCircle, Loader2, TrendingUp, DollarSign, Award, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function DashboardPage() {
  const { user } = useAuth0()
  const navigate = useNavigate()
  const { location: storedLocation, budget, onboardingCompleted, setLocation } = useUserStore()
  const { location: geoLocation, error: geoError, loading: geoLoading, refetch } = useGeolocation()
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!onboardingCompleted) {
      navigate('/onboarding/choice')
    }
  }, [onboardingCompleted, navigate])

  // Update stored location when geolocation succeeds
  useEffect(() => {
    if (geoLocation) {
      setLocation(geoLocation)
      const nearby = generateNearbyMerchants(geoLocation.lat, geoLocation.lng)
      setMerchants(nearby)
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

  if (!onboardingCompleted) {
    return null // Will redirect
  }

  const totalBudget = budget ? Object.values(budget).reduce((sum, val) => sum + val, 0) : 0
  const topCategory = budget ? Object.entries(budget).sort((a, b) => b[1] - a[1])[0] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-blue-100 text-lg">Here are your personalized insights</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          
          {/* Quick Stats */}
          {totalBudget > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <DollarSign className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">${totalBudget}</p>
                <p className="text-xs opacity-80">Monthly Budget</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <Award className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{mockCreditCards.length}</p>
                <p className="text-xs opacity-80">Top Cards</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">3.2x</p>
                <p className="text-xs opacity-80">Avg. Rewards</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Location Status */}
        {geoLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-900">Getting your location...</span>
          </motion.div>
        )}

        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-orange-900 font-medium mb-1">Location Access Needed</p>
                <p className="text-sm text-orange-800 mb-3">{geoError.message}</p>
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
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Nearby Merchants</CardTitle>
                      <p className="text-sm text-muted-foreground">Discover best cards for each location</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {merchants.length} locations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-xl overflow-hidden border-2 border-gray-200">
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
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          {selectedMerchant.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedMerchant.category}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        ~${selectedMerchant.estimatedSpend}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommended Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Smart Recommendations</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optimized for your {topCategory ? topCategory[0] : 'spending'} habits
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Top Picks
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardsCarousel cards={mockCreditCards} onCardClick={handleCardClick} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Spending Breakdown</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly budget allocation</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(budget)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount], index) => {
                      const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0
                      const colors = [
                        'bg-blue-500',
                        'bg-purple-500',
                        'bg-pink-500',
                        'bg-indigo-500',
                        'bg-violet-500',
                        'bg-fuchsia-500'
                      ]
                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                              <span className="text-sm font-medium capitalize group-hover:text-primary transition-colors">
                                {category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                              <span className="text-lg font-bold text-gray-900">${amount}</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </motion.div>
                      )
                    })}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Monthly Budget</span>
                    <span className="text-2xl font-bold text-primary">${totalBudget}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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

