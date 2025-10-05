import { useState, useEffect, useCallback } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2
} from 'lucide-react'

interface RecommendedCardsProps {
  cards: ApiCreditCard[]
  currentCards: string[]
  budget?: UserBudget
  onAddCard?: (cardId: string) => void
  showAddButton?: boolean
  onCardClick?: (card: ApiCreditCard) => void
  cardOrigins?: Record<string, 'manual' | 'bank'>
}

export function RecommendedCards({
  cards,
  currentCards,
  budget,
  onAddCard,
  showAddButton = false,
  onCardClick,
  cardOrigins = {}
}: RecommendedCardsProps) {
  // Carousel for recommendations
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  })

  // AI recommendations state
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [useAI, setUseAI] = useState(false)

  useEffect(() => {
    // Fetch AI recommendations when budget and cards are available
    if (budget && cards.length > 0) {
      fetchAIRecommendations()
    }
  }, [budget, cards.length])

  const fetchAIRecommendations = async () => {
    if (!budget || cards.length === 0) return

    setLoadingAI(true)
    try {
      const response = await fetch('http://localhost:3000/api/insights/recommend-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: budget,
          availableCards: cards,
          userCards: currentCards,
          limit: 5,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.data.recommendedCardIds) {
        setAiRecommendedIds(data.data.recommendedCardIds)
        setUseAI(data.data.aiPowered !== false)
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err)
      // Fall back to algorithm-based recommendations
      setUseAI(false)
    } finally {
      setLoadingAI(false)
    }
  }

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
      return cards // Show all cards if no budget
    }

    // Use AI recommendations if available
    if (useAI && aiRecommendedIds.length > 0) {
      // Order cards by AI recommendation
      const orderedCards: ApiCreditCard[] = []
      aiRecommendedIds.forEach(id => {
        const card = cards.find(c => c.id === id)
        if (card) {
          orderedCards.push(card)
        }
      })
      
      // Add remaining cards that weren't in AI recommendations
      const usedIds = new Set(orderedCards.map(c => c.id))
      const remaining = cards.filter(c => !usedIds.has(c.id))
      orderedCards.push(...remaining)
      
      return orderedCards
    }

    // Fallback: Get top spending categories
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

    // Sort by score and return all cards
    return scoredCards
      .sort((a, b) => b.score - a.score)
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
      <Card className="shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Recommended for You
                </CardTitle>
                {loadingAI ? (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                    <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 animate-spin" />
                    Analyzing...
                  </Badge>
                ) : useAI ? (
                  <Badge variant="default" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    AI Powered
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    Smart Match
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {loadingAI 
                  ? 'AI is analyzing the best cards for you...'
                  : budget 
                    ? useAI 
                      ? 'Personalized AI recommendations based on your spending' 
                      : 'Matched to your spending habits'
                    : 'Top rated cards to maximize rewards'
                }
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 sm:pb-6">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4">
                {recommendedCards.map((card, index) => {
                  const isOwned = currentCards.includes(card.id)
                  const cardOrigin = cardOrigins[card.id]
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
                      <Card className={`h-full border-2 transition-all hover:shadow-lg bg-white ${
                        !isOwned 
                          ? 'border-primary' 
                          : 'border-muted-foreground/20'
                      } ${onCardClick ? 'cursor-pointer' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              #{index + 1} Match
                            </Badge>
                            {isOwned && (
                              <Badge variant="secondary">
                                <CheckCircle className="w-3 h-3 mr-1 text-foreground" />
                                Owned
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-1 text-foreground">{card.card_name}</CardTitle>
                          <p className="text-sm text-foreground">{card.bank_name}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={getCategoryColor(card.category)} variant="outline">
                              {card.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{card.network}</Badge>
                            {isOwned && cardOrigin && (
                              <Badge 
                                variant={cardOrigin === 'bank' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {cardOrigin === 'bank' ? '🏦 From Bank' : '✋ Manual'}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-foreground" />
                                <p className="text-xs font-semibold text-foreground">Top Reward</p>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm capitalize text-foreground">
                                  {topReward[0].replace(/_/g, ' ')}
                                </span>
                                <span className="text-lg font-bold text-foreground">
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
                                    <CheckCircle className="w-4 h-4 mr-2 text-foreground" />
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
