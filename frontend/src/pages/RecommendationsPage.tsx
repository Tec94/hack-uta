import { useState } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { CardDetailModal } from '@/components/cards/CardDetailModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from '@/types'
import { mockCreditCards } from '@/data/mock-cards'
import { useUserStore } from '@/store/userStore'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Award, Zap, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function RecommendationsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white px-4 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 -translate-x-48"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-32 translate-x-32"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Recommendations</h1>
                <p className="text-purple-100 text-sm">Personalized for your spending habits</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Top Rated
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Award className="w-3 h-3 mr-1" />
                Best Match
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1" />
                Updated Daily
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Top Picks for You</h2>
                <p className="text-sm text-muted-foreground">Best matches based on AI analysis</p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Recommended
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      #{index + 1} Pick
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="w-full h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                      <div className="absolute inset-0 bg-grid-white/10"></div>
                      <span className="text-6xl relative z-10">💳</span>
                    </div>
                    <CardTitle className="text-xl">{card.name}</CardTitle>
                    <CardDescription className="text-base">{card.issuer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Primary Benefit</p>
                        <p className="font-semibold text-purple-900">{card.primaryBenefit}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Annual Fee</p>
                          <p className="font-bold text-lg">
                            {card.annualFee === 0 ? (
                              <span className="text-green-600">$0 ✨</span>
                            ) : (
                              <span className="text-gray-900">{formatCurrency(card.annualFee)}</span>
                            )}
                          </p>
                        </div>
                        {card.signupBonus && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <Zap className="w-3 h-3 mr-1" />
                            Bonus
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(card)
                      }}>
                        <Award className="w-4 h-4 mr-2" />
                        View Full Details
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Options to Consider</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-0 bg-white/60 backdrop-blur-sm" onClick={() => handleCardClick(card)}>
                  <CardHeader className="pb-3">
                    <div className="w-full h-28 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-4xl">💳</span>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{card.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{card.primaryBenefit}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(card)
                    }}>
                      Details
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
            <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AI-Powered Insights</CardTitle>
                    <p className="text-sm text-gray-600">Personalized recommendations just for you</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-gray-800 text-lg leading-relaxed">
                    Based on your spending pattern, focusing on cards with strong {' '}
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      {Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0]}
                    </span>
                    {' '} rewards could maximize your earnings. Our AI recommends cards that offer{' '}
                    <span className="font-bold text-green-700">3-5% back</span> in your top categories.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Potential Earnings</p>
                      <p className="text-2xl font-bold text-blue-900">+$847/yr</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <Award className="w-8 h-8 text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Match Score</p>
                      <p className="text-2xl font-bold text-purple-900">94%</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                      <Star className="w-8 h-8 text-pink-600 mb-2 fill-current" />
                      <p className="text-sm text-gray-600 mb-1">Cards Analyzed</p>
                      <p className="text-2xl font-bold text-pink-900">{mockCreditCards.length}</p>
                    </div>
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

