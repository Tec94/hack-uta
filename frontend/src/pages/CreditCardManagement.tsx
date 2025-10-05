import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Loading } from '@/components/common/Loading'
import { BottomNav } from '@/components/navigation/BottomNav'
import { RecommendedCards } from '@/components/cards/RecommendedCards'
import { ApiCreditCard } from '@/types'
import { useUserStore } from '@/store/userStore'
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  Trash2, 
  Search, 
  TrendingUp,
  CheckCircle,
  Wallet,
  Filter,
  Sparkles,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function CreditCardManagementPage() {
  const { user } = useAuth0()
  const { toast } = useToast()
  const { currentCards, setCurrentCards, budget } = useUserStore()
  const [allCards, setAllCards] = useState<ApiCreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [addingCard, setAddingCard] = useState<string | null>(null)
  const [removingCard, setRemovingCard] = useState<string | null>(null)
  // Map catalog IDs to database user_card IDs
  const [userCardIdMap, setUserCardIdMap] = useState<Record<string, number>>({})
  // Map catalog IDs to card origins
  const [cardOriginMap, setCardOriginMap] = useState<Record<string, 'manual' | 'bank'>>({})
  // AI Insights
  const [aiInsights, setAiInsights] = useState<{
    insight: string
    potentialEarnings: number
    matchScore: number
    topRecommendation: string
  } | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  // Modal state
  const [selectedCard, setSelectedCard] = useState<ApiCreditCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Card stack state
  const [currentStackIndex, setCurrentStackIndex] = useState(0)

  useEffect(() => {
    fetchCards()
    if (user?.sub) {
      fetchUserCards()
    }
  }, [user?.sub])

  useEffect(() => {
    // Fetch AI insights when budget is available
    if (budget && allCards.length > 0) {
      fetchAIInsights()
    }
  }, [budget, allCards.length, currentCards.length])

  const fetchCards = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cards')
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }
      const data = await response.json()
      setAllCards(data.data || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
      setError('Failed to load credit cards. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load credit cards',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCards = async () => {
    if (!user?.sub) return

    try {
      const response = await fetch(`http://localhost:3000/api/user-cards/${user.sub}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user cards')
      }
      const data = await response.json()
      
      // Build a map of card_cat_id to user_card id and origin
      const idMap: Record<string, number> = {}
      const originMap: Record<string, 'manual' | 'bank'> = {}
      const catalogIds: string[] = []
      
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((userCard: any) => {
          // Map catalog ID (card_cat_id) to database ID (id)
          idMap[String(userCard.card_cat_id)] = userCard.id
          // Map catalog ID to origin
          originMap[String(userCard.card_cat_id)] = userCard.origin || 'manual'
          catalogIds.push(String(userCard.card_cat_id))
        })
      }
      
      setUserCardIdMap(idMap)
      setCardOriginMap(originMap)
      setCurrentCards(catalogIds)
    } catch (err) {
      console.error('Error fetching user cards:', err)
      // Don't show error toast for this, just log it
    }
  }

  const fetchAIInsights = async () => {
    if (!budget) return

    setLoadingInsights(true)
    try {
      const response = await fetch('http://localhost:3000/api/insights/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: budget,
          userCards: currentCards.length,
          totalCards: allCards.length,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights')
      }

      if (data.success && data.data) {
        setAiInsights(data.data)
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err)
      // Don't show error, just use fallback data
    } finally {
      setLoadingInsights(false)
    }
  }

  const myCards = allCards.filter(card => currentCards.includes(card.id))
  const availableCards = allCards.filter(card => !currentCards.includes(card.id))

  // Reset stack index when cards change
  useEffect(() => {
    setCurrentStackIndex(0)
  }, [myCards.length])

  const handleAddCard = async (cardId: string) => {
    if (!user?.sub) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add cards',
        variant: 'destructive',
      })
      return
    }

    setAddingCard(cardId)
    try {
      const response = await fetch('http://localhost:3000/api/user-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.sub,
          card_cat_id: parseInt(cardId),
          is_active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add card')
      }

      // Update local state with catalog ID
      setCurrentCards([...currentCards, cardId])
      
      // Store the mapping of catalog ID to database user_card ID
      if (data.data && data.data.id) {
        setUserCardIdMap({
          ...userCardIdMap,
          [cardId]: data.data.id
        })
      }
      
      toast({
        title: 'Card Added',
        description: 'Successfully added card to your wallet',
      })
    } catch (err: any) {
      console.error('Error adding card:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to add card to your wallet',
        variant: 'destructive',
      })
    } finally {
      setAddingCard(null)
    }
  }

  const handleRemoveCard = async (cardId: string) => {
    if (!user?.sub) {
      toast({
        title: 'Error',
        description: 'You must be logged in to remove cards',
        variant: 'destructive',
      })
      return
    }

    // Get the database user_card ID from our mapping
    const userCardId = userCardIdMap[cardId]
    if (!userCardId) {
      toast({
        title: 'Error',
        description: 'Card record not found. Please refresh the page.',
        variant: 'destructive',
      })
      return
    }

    setRemovingCard(cardId)
    try {
      const response = await fetch(`http://localhost:3000/api/user-cards/${user.sub}/card/${userCardId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove card')
      }

      // Update local state
      setCurrentCards(currentCards.filter(id => id !== cardId))
      
      // Remove from mapping
      const newMap = { ...userCardIdMap }
      delete newMap[cardId]
      setUserCardIdMap(newMap)
      
      toast({
        title: 'Card Removed',
        description: 'Successfully removed card from your wallet',
      })
    } catch (err: any) {
      console.error('Error removing card:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove card from your wallet',
        variant: 'destructive',
      })
    } finally {
      setRemovingCard(null)
    }
  }

  const getCategoryColor = (_category: string) => {
    // Unified styling - all categories use the same neutral badge
    return 'bg-secondary text-secondary-foreground'
  }

  const formatRewardRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  const categories = ['all', ...new Set(allCards.map(card => card.category))]

  const filterCards = (cards: ApiCreditCard[]) => {
    return cards.filter(card => {
      const matchesSearch = card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <div className="text-destructive mb-4">
              <CreditCardIcon className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Cards</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchCards} variant="outline">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const handleCardClick = (card: ApiCreditCard) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const CardItem = ({ card, isOwned, origin }: { card: ApiCreditCard, isOwned: boolean, origin?: 'manual' | 'bank' }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group h-full"
    >
      <Card 
        className="h-full transition-all duration-200 hover:shadow-lg flex flex-col cursor-pointer bg-white" 
        onClick={() => handleCardClick(card)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className={`w-5 h-5 ${isOwned ? 'text-primary' : 'text-foreground'}`} />
                {isOwned && <CheckCircle className="w-4 h-4 text-foreground" />}
              </div>
              <CardTitle className="text-lg font-semibold mb-1 text-foreground">
                {card.card_name}
              </CardTitle>
              <CardDescription className="text-sm text-foreground">{card.bank_name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={getCategoryColor(card.category)}>
              {card.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {card.network}
            </Badge>
            {isOwned && origin && (
              <Badge 
                variant={origin === 'bank' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {origin === 'bank' ? '🏦 From Plaid' : '✋ Manual'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1 text-foreground">
              <TrendingUp className="w-4 h-4 text-foreground" />
              Reward Rates
            </h4>
            <div className="space-y-1.5">
              {Object.entries(card.reward_summary).slice(0, 3).map(([category, rate]) => (
                <div key={category} className="flex justify-between items-center text-sm bg-muted rounded px-2 py-1">
                  <span className="text-foreground capitalize text-xs">
                    {category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatRewardRate(rate)}
                  </span>
                </div>
              ))}
              {Object.entries(card.reward_summary).length > 3 && (
                <p className="text-xs text-foreground text-center pt-1">
                  +{Object.entries(card.reward_summary).length - 3} more categories
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            {isOwned ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveCard(card.id)
                }}
                disabled={removingCard === card.id}
              >
                {removingCard === card.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Card
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddCard(card.id)
                }}
                disabled={addingCard === card.id}
              >
                {addingCard === card.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Card Stack Component
  const CardStack = ({ cards, origins }: { cards: ApiCreditCard[], origins: Record<string, 'manual' | 'bank'> }) => {
    const [dragStart, setDragStart] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDraggingStack, setIsDraggingStack] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    
    const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault()
      setIsDraggingStack(true)
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      setDragStart(clientX)
    }

    const handleDragMove = (event: React.MouseEvent | React.TouchEvent) => {
      if (!isDraggingStack) return
      event.preventDefault()
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const delta = clientX - dragStart
      setDragOffset(delta)
    }

    const handleDragEnd = () => {
      if (!isDraggingStack) return
      setIsDraggingStack(false)
      
      // Much more sensitive threshold - only 50px needed
      const threshold = 50
      if (Math.abs(dragOffset) > threshold) {
        if (dragOffset > 0 && currentStackIndex > 0) {
          setCurrentStackIndex(currentStackIndex - 1)
        } else if (dragOffset < 0 && currentStackIndex < cards.length - 1) {
          setCurrentStackIndex(currentStackIndex + 1)
        }
      }
      setDragOffset(0)
    }

    const nextCard = () => {
      if (currentStackIndex < cards.length - 1) {
        setCurrentStackIndex(currentStackIndex + 1)
      }
    }

    const prevCard = () => {
      if (currentStackIndex > 0) {
        setCurrentStackIndex(currentStackIndex - 1)
      }
    }

    if (cards.length === 0) return null

    return (
      <div className="relative w-full max-w-sm mx-auto">
        {/* Card Stack Container */}
        <div 
          ref={containerRef}
          className={`relative h-64 w-full cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
            isDraggingStack ? 'scale-105' : 'scale-100'
          }`}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {cards.map((card, index) => {
            const isActive = index === currentStackIndex
            const isNext = index === currentStackIndex + 1
            const isPrev = index === currentStackIndex - 1
            const isVisible = isActive || isNext || isPrev || Math.abs(index - currentStackIndex) <= 2

            if (!isVisible) return null

            const offset = index - currentStackIndex
            const scale = isActive ? 1 : 0.95 - Math.abs(offset) * 0.05
            const y = isActive ? 0 : Math.abs(offset) * 8
            const zIndex = cards.length - Math.abs(offset)
            const opacity = isActive ? 1 : 0.8 - Math.abs(offset) * 0.2
            // More responsive rotation and movement
            const rotate = isActive ? dragOffset * 0.15 : offset * 2
            const x = isActive ? dragOffset * 0.5 : 0

            return (
              <motion.div
                key={card.id}
                className="absolute inset-0"
                style={{ zIndex }}
                animate={{
                  scale,
                  y,
                  rotate,
                  opacity,
                  x,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                }}
                onClick={() => !isDraggingStack && handleCardClick(card)}
              >
                <Card className="h-full w-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl border-0 overflow-hidden">
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                  </div>
                  
                  <CardContent className="relative z-10 h-full flex flex-col justify-between p-6">
                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6" />
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {card.network}
                        </Badge>
                        {origins[card.id] && (
                          <Badge 
                            variant="secondary" 
                            className="bg-white/20 text-white border-white/30 text-xs"
                          >
                            {origins[card.id] === 'bank' ? '🏦' : '✋'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-2">{card.card_name}</h3>
                      <p className="text-sm opacity-90 mb-4">{card.bank_name}</p>
                      
                      {/* Top Reward Rate */}
                      {Object.keys(card.reward_summary).length > 0 && (
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-xs opacity-80 mb-1">Top Reward</p>
                          <p className="text-2xl font-bold">
                            {formatRewardRate(Math.max(...Object.values(card.reward_summary)))}
                          </p>
                          <p className="text-xs opacity-80">
                            {Object.entries(card.reward_summary)
                              .sort((a, b) => b[1] - a[1])[0][0]
                              .replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs opacity-80">
                        {index + 1} of {cards.length}
                      </div>
                      <div className="flex gap-1">
                        {cards.map((_, dotIndex) => (
                          <div
                            key={dotIndex}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              dotIndex === currentStackIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Navigation Controls */}
        {cards.length > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevCard}
              disabled={currentStackIndex === 0}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {currentStackIndex + 1} of {cards.length}
              </span>
              <span className="text-xs text-muted-foreground/70">
                Swipe to navigate
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextCard}
              disabled={currentStackIndex === cards.length - 1}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Card Actions */}
        {cards[currentStackIndex] && (
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveCard(cards[currentStackIndex].id)
              }}
              disabled={removingCard === cards[currentStackIndex].id}
            >
              {removingCard === cards[currentStackIndex].id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleCardClick(cards[currentStackIndex])}
            >
              View Details
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/credify-logo.png" 
                alt="Credily" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">My Credit Cards</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Manage your portfolio and discover new rewards</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1 flex-shrink-0 text-xs">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">{myCards.length} {myCards.length === 1 ? 'Card' : 'Cards'}</span>
              <span className="sm:hidden">{myCards.length}</span>
            </Badge>
          </div>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl p-2 sm:p-4 border bg-card"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Cards</p>
              <p className="text-lg sm:text-2xl font-bold">{myCards.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-2 sm:p-4 border bg-card"
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Categories</p>
              <p className="text-lg sm:text-2xl font-bold">{new Set(myCards.map(c => c.category)).size}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-2 sm:p-4 border bg-card"
            >
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-80" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Networks</p>
              <p className="text-lg sm:text-2xl font-bold">{new Set(myCards.map(c => c.network)).size}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search cards by name or bank..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-11"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations Slider */}
        <div className="mb-8">
          <RecommendedCards
            cards={allCards}
            currentCards={currentCards}
            budget={budget ?? undefined}
            onAddCard={handleAddCard}
            showAddButton={true}
            onCardClick={handleCardClick}
            cardOrigins={cardOriginMap}
          />
        </div>

        {/* Tabs for My Cards and Browse Cards */}
        <Tabs defaultValue="my-cards" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="my-cards" className="text-base">
              <Wallet className="w-4 h-4 mr-2" />
              My Cards ({myCards.length})
            </TabsTrigger>
            <TabsTrigger value="browse" className="text-base">
              <Search className="w-4 h-4 mr-2" />
              Browse ({availableCards.length})
            </TabsTrigger>
          </TabsList>

          {/* My Cards Tab */}
          <TabsContent value="my-cards">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {myCards.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Cards in Your Wallet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start building your credit card portfolio by adding cards from the Browse tab
                    </p>
                    <Button onClick={() => document.querySelector('[value="browse"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Cards
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Active Cards</h2>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {myCards.length} {myCards.length === 1 ? 'card' : 'cards'}
                    </Badge>
                  </div>
                  
                  {/* Card Stack Display */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                  >
                    <CardStack 
                      cards={filterCards(myCards)} 
                      origins={cardOriginMap}
                    />
                  </motion.div>

                  {/* Fallback for filtered results */}
                  {filterCards(myCards).length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <p className="text-muted-foreground">No cards match your search criteria</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* Browse Cards Tab */}
          <TabsContent value="browse">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Available Cards</h2>
                <Badge variant="outline" className="text-base px-4 py-1">
                  {availableCards.length} {availableCards.length === 1 ? 'card' : 'cards'}
                </Badge>
              </div>
              {availableCards.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">All Cards Added!</h3>
                    <p className="text-foreground">
                      You've added all available cards to your wallet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    <motion.div 
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filterCards(availableCards).map((card) => (
                        <CardItem key={card.id} card={card} isOwned={false} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  {filterCards(availableCards).length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <p className="text-muted-foreground">No cards match your search criteria</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* AI-Powered Insights */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">AI-Powered Insights</CardTitle>
                      <p className="text-sm text-muted-foreground">Personalized recommendations based on your spending</p>
                    </div>
                  </div>
                  {loadingInsights && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6">
                  {aiInsights ? (
                    <>
                      <p className="text-lg leading-relaxed mb-6">
                        {aiInsights.insight}
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-card border p-4 rounded-lg">
                          <TrendingUp className="w-8 h-8 mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Potential Earnings</p>
                          <p className="text-2xl font-bold">
                            +${aiInsights.potentialEarnings}/yr
                          </p>
                        </div>
                        <div className="bg-card border p-4 rounded-lg">
                          <Star className="w-8 h-8 mb-2 fill-current" />
                          <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                          <p className="text-2xl font-bold">
                            {aiInsights.matchScore}%
                          </p>
                        </div>
                        <div className="bg-card border p-4 rounded-lg">
                          <Wallet className="w-8 h-8 mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Cards Analyzed</p>
                          <p className="text-2xl font-bold">{allCards.length}</p>
                        </div>
                      </div>

                      {aiInsights.topRecommendation && (
                        <div className="mt-4 p-3 bg-card border rounded-lg">
                          <p className="text-sm font-medium">
                            💡 Top Recommendation: {aiInsights.topRecommendation}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg leading-relaxed mb-6">
                        Based on your spending pattern, focusing on cards with strong{' '}
                        <span className="font-bold bg-secondary px-2 py-1 rounded">
                          {Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0]}
                        </span>
                        {' '}rewards could maximize your earnings. Our AI recommends cards that offer{' '}
                        <span className="font-bold">3-5% back</span> in your top categories.
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-card border p-4 rounded-lg">
                          <TrendingUp className="w-8 h-8 mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Potential Earnings</p>
                          <p className="text-2xl font-bold">
                            +${Math.round(Object.values(budget).reduce((a, b) => a + b, 0) * 0.03 * 12)}/yr
                          </p>
                        </div>
                        <div className="bg-card border p-4 rounded-lg">
                          <Star className="w-8 h-8 mb-2 fill-current" />
                          <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                          <p className="text-2xl font-bold">
                            85%
                          </p>
                        </div>
                        <div className="bg-card border p-4 rounded-lg">
                          <Wallet className="w-8 h-8 mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Cards Analyzed</p>
                          <p className="text-2xl font-bold">{allCards.length}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

 
      </div>

      {/* Card Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-foreground">{selectedCard.card_name}</DialogTitle>
                <p className="text-sm text-foreground">{selectedCard.bank_name}</p>
              </DialogHeader>

              {/* Card Visual */}
              <div className="w-full h-48 bg-primary rounded-xl p-6 text-primary-foreground mb-6 relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedCard.network}</Badge>
                    <Badge variant="secondary">{selectedCard.category}</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedCard.card_name}</h3>
                    <p className="text-sm opacity-90">{selectedCard.bank_name}</p>
                  </div>
                </div>
              </div>

              {/* Reward Categories */}
              {Object.keys(selectedCard.reward_summary).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-foreground" />
                    Rewards Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedCard.reward_summary)
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
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Card Network</h4>
                  <p className="text-sm text-foreground">{selectedCard.network}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Primary Category</h4>
                  <Badge className="bg-secondary text-secondary-foreground">
                    {selectedCard.category}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {currentCards.includes(selectedCard.id) ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveCard(selectedCard.id)
                      setIsModalOpen(false)
                    }}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    size="lg"
                    disabled={removingCard === selectedCard.id}
                  >
                    {removingCard === selectedCard.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Card
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddCard(selectedCard.id)
                      setIsModalOpen(false)
                    }}
                    className="flex-1"
                    size="lg"
                    disabled={addingCard === selectedCard.id}
                  >
                    {addingCard === selectedCard.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to My Cards
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  variant="outline" 
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
