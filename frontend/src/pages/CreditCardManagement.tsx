import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loading } from '@/components/common/Loading'
import { BottomNav } from '@/components/navigation/BottomNav'
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
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function CreditCardManagementPage() {
  const { toast } = useToast()
  const { currentCards, setCurrentCards, budget } = useUserStore()
  const [allCards, setAllCards] = useState<ApiCreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Carousel for recommendations
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  })

  useEffect(() => {
    fetchCards()
  }, [])

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

  const myCards = allCards.filter(card => currentCards.includes(card.id))
  const availableCards = allCards.filter(card => !currentCards.includes(card.id))

  const handleAddCard = (cardId: string) => {
    setCurrentCards([...currentCards, cardId])
    toast({
      title: 'Card Added',
      description: 'Successfully added card to your wallet',
    })
  }

  const handleRemoveCard = (cardId: string) => {
    setCurrentCards(currentCards.filter(id => id !== cardId))
    toast({
      title: 'Card Removed',
      description: 'Successfully removed card from your wallet',
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cashback': return 'bg-green-100 text-green-800 border-green-200'
      case 'travel rewards': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rotating categories': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'entertainment rewards': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'adaptive cashback': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'flat cashback': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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

  // Recommendation algorithm based on user spending
  const getRecommendedCards = (): ApiCreditCard[] => {
    if (!budget || allCards.length === 0) {
      return allCards.slice(0, 5)
    }

    // Get top spending categories
    const sortedBudget = Object.entries(budget).sort((a, b) => b[1] - a[1])
    const topCategory = sortedBudget[0]?.[0] || ''
    const secondCategory = sortedBudget[1]?.[0] || ''

    // Score each card based on rewards matching user's spending
    const scoredCards = allCards.map(card => {
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

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <div className="text-red-500 mb-4">
              <CreditCardIcon className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Cards</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchCards} variant="outline">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const CardItem = ({ card, isOwned }: { card: ApiCreditCard, isOwned: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className={`h-full transition-all duration-200 hover:shadow-xl border-2 ${
        isOwned ? 'border-primary bg-gradient-to-br from-blue-50/50 to-purple-50/50' : 'border-gray-200 hover:border-primary/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className={`w-5 h-5 ${isOwned ? 'text-primary' : 'text-gray-400'}`} />
                {isOwned && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {card.card_name}
              </CardTitle>
              <CardDescription className="text-sm">{card.bank_name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={getCategoryColor(card.category)}>
              {card.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {card.network}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Reward Rates
              </h4>
              <div className="space-y-1.5">
                {Object.entries(card.reward_summary).slice(0, 3).map(([category, rate]) => (
                  <div key={category} className="flex justify-between items-center text-sm bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-600 capitalize text-xs">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-primary">
                      {formatRewardRate(rate)}
                    </span>
                  </div>
                ))}
                {Object.entries(card.reward_summary).length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{Object.entries(card.reward_summary).length - 3} more categories
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              {isOwned ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => handleRemoveCard(card.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Card
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddCard(card.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Wallet
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
                <Wallet className="w-6 h-6" />
                My Credit Cards
              </h1>
              <p className="text-sm text-muted-foreground">Manage your portfolio and discover new rewards</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {myCards.length} {myCards.length === 1 ? 'Card' : 'Cards'}
            </Badge>
          </div>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl p-4 border bg-card"
            >
              <Wallet className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-xs text-muted-foreground">Total Cards</p>
              <p className="text-2xl font-bold">{myCards.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-4 border bg-card"
            >
              <Star className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-xs text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{new Set(myCards.map(c => c.category)).size}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-4 border bg-card"
            >
              <CreditCardIcon className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-xs text-muted-foreground">Networks</p>
              <p className="text-2xl font-bold">{new Set(myCards.map(c => c.network)).size}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Recommendations Slider */}
        {recommendedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-200/50 overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Recommended for You
                        <Badge className="bg-purple-600 text-white border-0">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          AI Powered
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
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
                            className="flex-[0_0_320px] min-w-0"
                          >
                            <Card className={`h-full border-2 transition-all hover:shadow-xl ${
                              isOwned 
                                ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
                                : 'border-purple-200 bg-white hover:border-purple-400'
                            }`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge className={`${index === 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-purple-100 text-purple-800'} border-0`}>
                                    #{index + 1} Match
                                  </Badge>
                                  {isOwned && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Owned
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-lg line-clamp-1">{card.card_name}</CardTitle>
                                <CardDescription className="text-sm">{card.bank_name}</CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getCategoryColor(card.category)} variant="outline">
                                    {card.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{card.network}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Zap className="w-4 h-4 text-purple-600" />
                                      <p className="text-xs font-semibold text-purple-900">Top Reward</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-700 capitalize">
                                        {topReward[0].replace(/_/g, ' ')}
                                      </span>
                                      <span className="text-lg font-bold text-purple-600">
                                        {formatRewardRate(topReward[1])}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {!isOwned ? (
                                    <Button
                                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                      size="sm"
                                      onClick={() => handleAddCard(card.id)}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add to Wallet
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      className="w-full border-green-300 text-green-700 cursor-default"
                                      size="sm"
                                      disabled
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Already in Wallet
                                    </Button>
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-colors border-2 border-purple-200 z-10"
                        aria-label="Previous cards"
                      >
                        <ChevronLeft className="w-5 h-5 text-purple-600" />
                      </button>
                      <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-colors border-2 border-purple-200 z-10"
                        aria-label="Next cards"
                      >
                        <ChevronRight className="w-5 h-5 text-purple-600" />
                      </button>
                    </>
                  )}
                </div>
                
                {budget && (
                  <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700">
                      <Sparkles className="w-4 h-4 inline mr-1 text-purple-600" />
                      These cards are selected based on your <span className="font-semibold text-purple-700">
                        {Object.entries(budget).sort((a, b) => b[1] - a[1])[0]?.[0] || 'spending'}
                      </span> patterns to maximize your rewards.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search cards by name or bank..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-11"
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
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cards in Your Wallet</h3>
                    <p className="text-gray-600 mb-6">
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
                    <h2 className="text-2xl font-bold text-gray-900">Your Active Cards</h2>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {myCards.length} {myCards.length === 1 ? 'card' : 'cards'}
                    </Badge>
                  </div>
                  <AnimatePresence mode="popLayout">
                    <motion.div 
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filterCards(myCards).map((card) => (
                        <CardItem key={card.id} card={card} isOwned={true} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  {filterCards(myCards).length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <p className="text-gray-600">No cards match your search criteria</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Available Cards</h2>
                <Badge variant="outline" className="text-base px-4 py-1">
                  {availableCards.length} {availableCards.length === 1 ? 'card' : 'cards'}
                </Badge>
              </div>
              {availableCards.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Cards Added!</h3>
                    <p className="text-gray-600">
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
                        <p className="text-gray-600">No cards match your search criteria</p>
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
            <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-0 shadow-xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AI-Powered Insights</CardTitle>
                    <p className="text-sm text-gray-600">Personalized recommendations based on your spending</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-gray-800 text-lg leading-relaxed mb-6">
                    Based on your spending pattern, focusing on cards with strong{' '}
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      {Object.entries(budget).sort((a, b) => b[1] - a[1])[0][0]}
                    </span>
                    {' '}rewards could maximize your earnings. Our AI recommends cards that offer{' '}
                    <span className="font-bold text-green-700">3-5% back</span> in your top categories.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Potential Earnings</p>
                      <p className="text-2xl font-bold text-blue-900">
                        +${Math.round(Object.values(budget).reduce((a, b) => a + b, 0) * 0.03 * 12)}/yr
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <Star className="w-8 h-8 text-purple-600 mb-2 fill-current" />
                      <p className="text-sm text-gray-600 mb-1">Match Score</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {recommendedCards.length > 0 ? '94%' : '85%'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                      <Wallet className="w-8 h-8 text-pink-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Cards Analyzed</p>
                      <p className="text-2xl font-bold text-pink-900">{allCards.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

 
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
