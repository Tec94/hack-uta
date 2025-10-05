import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Star
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

  const CardItem = ({ card, isOwned }: { card: ApiCreditCard, isOwned: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
        isOwned ? 'border-2 border-primary bg-muted/30' : 'hover:border-primary/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className={`w-5 h-5 ${isOwned ? 'text-primary' : 'text-muted-foreground'}`} />
                {isOwned && <CheckCircle className="w-4 h-4" />}
              </div>
              <CardTitle className="text-lg font-semibold mb-1">
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
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Reward Rates
              </h4>
              <div className="space-y-1.5">
                {Object.entries(card.reward_summary).slice(0, 3).map(([category, rate]) => (
                  <div key={category} className="flex justify-between items-center text-sm bg-muted rounded px-2 py-1">
                    <span className="text-muted-foreground capitalize text-xs">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold">
                      {formatRewardRate(rate)}
                    </span>
                  </div>
                ))}
                {Object.entries(card.reward_summary).length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
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
                  className="w-full"
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2 sm:gap-3">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                My Credit Cards
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage your portfolio and discover new rewards</p>
            </div>
            <Badge variant="outline" className="gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3" />
              {myCards.length} {myCards.length === 1 ? 'Card' : 'Cards'}
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
        {/* Recommendations Slider */}
        <div className="mb-8">
          <RecommendedCards
            cards={allCards}
            currentCards={currentCards}
            budget={budget ?? undefined}
            onAddCard={handleAddCard}
            showAddButton={true}
          />
        </div>

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
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">All Cards Added!</h3>
                    <p className="text-muted-foreground">
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AI-Powered Insights</CardTitle>
                    <p className="text-sm text-muted-foreground">Personalized recommendations based on your spending</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6">
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
                        94%
                      </p>
                    </div>
                    <div className="bg-card border p-4 rounded-lg">
                      <Wallet className="w-8 h-8 mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Cards Analyzed</p>
                      <p className="text-2xl font-bold">{allCards.length}</p>
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
