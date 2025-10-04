import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { CardDetailModal } from '@/components/cards/CardDetailModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard } from '@/types'
import { mockCreditCards } from '@/data/mock-cards'
import { useUserStore } from '@/store/userStore'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function RecommendationsPage() {
  const { user } = useAuth0()
  const { budget } = useUserStore()
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleCardClick = (card: CreditCard) => {
    setSelectedCard(card)
    setModalOpen(true)
  }

  // Simple recommendation logic based on spending
  const getTopRecommendations = (): CreditCard[] => {
    if (!budget) return mockCreditCards.slice(0, 3)

    const topCategory = Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0]
    
    // Filter cards based on spending patterns
    const sorted = [...mockCreditCards].sort((a, b) => {
      const aScore = scoreCard(a, topCategory)
      const bScore = scoreCard(b, topCategory)
      return bScore - aScore
    })

    return sorted.slice(0, 3)
  }

  const scoreCard = (card: CreditCard, topCategory: string): number => {
    const benefits = card.primaryBenefit.toLowerCase() + ' ' + 
                     card.secondaryBenefits.join(' ').toLowerCase()
    
    if (benefits.includes(topCategory)) return 10
    if (benefits.includes('dining') && topCategory === 'dining') return 10
    if (benefits.includes('travel') && topCategory === 'travel') return 10
    if (benefits.includes('gas') && topCategory === 'gas') return 10
    if (benefits.includes('grocer') && topCategory === 'groceries') return 10
    if (card.annualFee === 0) return 5
    return 3
  }

  const recommendations = getTopRecommendations()
  const otherCards = mockCreditCards.filter(c => !recommendations.find(r => r.id === c.id))

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Personalized For You</h1>
          </div>
          <p className="text-purple-100">AI-powered recommendations based on your spending</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Top Picks for You
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCardClick(card)}>
                  <CardHeader>
                    <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-5xl">💳</span>
                    </div>
                    <CardTitle className="text-xl">{card.name}</CardTitle>
                    <CardDescription>{card.issuer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Primary Benefit</p>
                        <p className="font-semibold text-primary">{card.primaryBenefit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Annual Fee</p>
                        <p className="font-bold">
                          {card.annualFee === 0 ? (
                            <span className="text-green-600">No Fee ✨</span>
                          ) : (
                            formatCurrency(card.annualFee)
                          )}
                        </p>
                      </div>
                      {card.signupBonus && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-800 font-medium">Sign-up Bonus</p>
                          <p className="text-sm text-green-900">{card.signupBonus}</p>
                        </div>
                      )}
                      <Button className="w-full mt-2" onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(card)
                      }}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCardClick(card)}>
                  <CardHeader>
                    <div className="w-full h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-5xl">💳</span>
                    </div>
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <CardDescription className="text-sm">{card.primaryBenefit}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(card)
                    }}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Based on your spending pattern, focusing on cards with strong {' '}
                  <span className="font-bold text-primary">
                    {Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0]}
                  </span>
                  {' '} rewards could maximize your earnings. Consider cards that offer 3-5% back in your top categories.
                </p>
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

