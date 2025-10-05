import { useCallback } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiCreditCard, UserBudget } from '@/types'
import { 
  Plus, 
  CheckCircle,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'

interface RecommendedCardsProps {
  cards: ApiCreditCard[]
  currentCards: string[]
  budget?: UserBudget
  onAddCard?: (cardId: string) => void
  showAddButton?: boolean
  onCardClick?: (card: ApiCreditCard) => void
}

export function RecommendedCards({
  cards,
  currentCards,
  budget,
  onAddCard,
  showAddButton = false,
  onCardClick
}: RecommendedCardsProps) {
  // Carousel for recommendations
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  })

  const getCategoryColor = (_category: string) => {
    // Unified styling - all categories use the same neutral badge
    return 'bg-secondary text-secondary-foreground'
  }

  const formatRewardRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  // Recommendation algorithm based on user spending
  const getRecommendedCards = (): ApiCreditCard[] => {
    if (!budget || cards.length === 0) {
      return cards.slice(0, 5)
    }

    // Get top spending categories
    const sortedBudget = Object.entries(budget).sort((a, b) => b[1] - a[1])
    const topCategory = sortedBudget[0]?.[0] || ''
    const secondCategory = sortedBudget[1]?.[0] || ''

    // Score each card based on rewards matching user's spending
    const scoredCards = cards.map(card => {
      let score = 0
      const rewards = card.reward_summary

      // Match rewards to spending categories
      Object.entries(rewards).forEach(([category, rate]) => {
        const normalizedCategory = category.toLowerCase()
        
        // High score for top spending category
        if (normalizedCategory.includes(topCategory) || topCategory.includes(normalizedCategory.split('_')[0])) {
          score += rate * 100 * 3
        }
        // Medium score for second category
        if (normalizedCategory.includes(secondCategory) || secondCategory.includes(normalizedCategory.split('_')[0])) {
          score += rate * 100 * 2
        }
        // Base score for high reward rates
        if (rate >= 0.03) {
          score += rate * 100
        }
      })

      // Bonus for cards not owned yet
      if (!currentCards.includes(card.id)) {
        score += 10
      }

      return { card, score }
    })

    // Sort by score and return top 5
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.card)
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const recommendedCards = getRecommendedCards()

  if (recommendedCards.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">
                    Recommended for You
                  </CardTitle>
                  <Badge variant="default" className="w-fit">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    AI Powered
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {budget ? 'Based on your spending habits' : 'Top rated cards to maximize rewards'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {recommendedCards.map((card, index) => {
                  const isOwned = currentCards.includes(card.id)
                  const topReward = Object.entries(card.reward_summary).sort((a, b) => b[1] - a[1])[0]
                  
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-[0_0_280px] sm:flex-[0_0_320px] min-w-0"
                      onClick={() => onCardClick?.(card)}
                    >
                      <Card className={`h-full border-2 transition-all hover:shadow-lg ${
                        isOwned 
                          ? 'border-primary bg-muted/30' 
                          : 'hover:border-primary/50'
                      } ${onCardClick ? 'cursor-pointer' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              #{index + 1} Match
                            </Badge>
                            {isOwned && (
                              <Badge variant="secondary">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Owned
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{card.card_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{card.bank_name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getCategoryColor(card.category)} variant="outline">
                              {card.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{card.network}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4" />
                                <p className="text-xs font-semibold">Top Reward</p>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm capitalize">
                                  {topReward[0].replace(/_/g, ' ')}
                                </span>
                                <span className="text-lg font-bold">
                                  {formatRewardRate(topReward[1])}
                                </span>
                              </div>
                            </div>
                            
                            {showAddButton && (
                              <>
                                {!isOwned ? (
                                  <Button
                                    variant="default"
                                    className="w-full"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onAddCard?.(card.id)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Wallet
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="w-full cursor-default"
                                    size="sm"
                                    disabled
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Already in Wallet
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            
            {/* Carousel Navigation */}
            {recommendedCards.length > 2 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-background rounded-full shadow-lg hover:bg-muted transition-colors border z-10"
                  aria-label="Previous cards"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-background rounded-full shadow-lg hover:bg-muted transition-colors border z-10"
                  aria-label="Next cards"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {budget && (
            <div className="mt-4 p-3 bg-muted rounded-lg border">
              <p className="text-sm">
                <Sparkles className="w-4 h-4 inline mr-1" />
                These cards are selected based on your <span className="font-semibold">
                  {Object.entries(budget).sort((a, b) => b[1] - a[1])[0]?.[0] || 'spending'}
                </span> patterns to maximize your rewards.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
