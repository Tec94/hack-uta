import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loading } from '@/components/common/Loading'
import { ApiCreditCard } from '@/types'
import { useUserStore } from '@/store/userStore'
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  Trash2, 
  Search, 
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Wallet,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function CreditCardManagementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentCards, setCurrentCards } = useUserStore()
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-8 px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                My Credit Cards
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your credit card portfolio and discover new rewards
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Cards in Wallet</p>
                <p className="text-3xl font-bold text-primary">{myCards.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

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

        {/* Quick Stats */}
        {myCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Portfolio Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{myCards.length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Card Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(myCards.map(c => c.category)).size}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Card Networks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(myCards.map(c => c.network)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
