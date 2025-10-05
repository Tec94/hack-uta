import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loading } from '@/components/common/Loading'
import { ApiCreditCard } from '@/types'
import { useUserStore } from '@/store/userStore'
import { CheckCircle, ChevronRight, CreditCard as CreditCardIcon, Loader2 } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'
import { addMultipleUserCards, getUserCards, UserCard } from '@/lib/user-cards'

interface CardSelection {
  [cardId: string]: boolean
}

export function ChooseYourCardPage() {
  const navigate = useNavigate()
  const { setCurrentCards } = useUserStore()
  const [cards, setCards] = useState<ApiCreditCard[]>([])
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<CardSelection>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCards()
    if (user?.sub) {
      fetchUserCards()
    }
  }, [user])

  const fetchCards = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cards')
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }
      const data = await response.json()
      setCards(data.data || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
      setError('Failed to load credit cards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCards = async () => {
    if (!user?.sub) return
    
    try {
      const userCardsData = await getUserCards(user.sub)
      setUserCards(userCardsData)
      
      // Pre-select cards that user already has
      const existingCardIds = userCardsData.map(card => card.card_cat_id)
      const preSelected: CardSelection = {}
      existingCardIds.forEach(cardId => {
        preSelected[cardId] = true
      })
      setSelectedCards(preSelected)
    } catch (err) {
      console.error('Error fetching user cards:', err)
      // Don't show error for this, just continue without pre-selection
    }
  }

  const handleCardToggle = (cardId: string, checked: boolean) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: checked
    }))
  }

  const handleSubmit = async () => {
    if (!user?.sub) {
      alert('Please log in to save your card selection.')
      return
    }

    const selectedCardIds = Object.keys(selectedCards).filter(id => selectedCards[id])
    const selectedCardCatIds = selectedCardIds.map(id => parseInt(id))

    setIsSubmitting(true)

    try {
      // Get currently existing user cards
      const existingCardCatIds = userCards.map(card => parseInt(card.card_cat_id))
      
      // Find cards to add (newly selected cards that user doesn't have)
      const cardsToAdd = selectedCardCatIds.filter(cardCatId => 
        !existingCardCatIds.includes(cardCatId)
      )
      
      // Add new cards to user's collection
      if (cardsToAdd.length > 0) {
        await addMultipleUserCards(user.sub, cardsToAdd)
        console.log(`Added ${cardsToAdd.length} new cards to user collection`)
      }

      // Store selected card IDs in user store for immediate use
      setCurrentCards(selectedCardIds)

      // Navigate to budget setup
      navigate('/onboarding/budget-setup')
    } catch (error) {
      console.error('Error saving selection:', error)
      showNotification('Failed to save your selection. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryColor = (_category: string) => {
    // Unified styling - all categories use the same neutral badge
    return 'bg-secondary text-secondary-foreground'
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

  const selectedCount = Object.values(selectedCards).filter(Boolean).length

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full mb-4">
            <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Credit Cards</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Select the credit cards you currently own or skip to continue.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
          </div>
        </motion.div>

        {/* Progress indicator */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <Badge variant="outline" className="text-sm px-4 py-1">
              {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          </motion.div>
        )}

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {cards.map((card, index) => {
            const userHasCard = userCards.some(userCard => userCard.card_cat_id === card.id)
            const isSelected = selectedCards[card.id] || false
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative group ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => handleCardToggle(card.id, !isSelected)}
              >
                <Card className={`h-full transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  userHasCard ? 'bg-green-50 border-green-200' : ''
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {card.card_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{card.bank_name}</p>
                        {userHasCard && (
                          <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                            Already in your collection
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) => handleCardToggle(card.id, checked)}
                          className="w-5 h-5"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getCategoryColor(card.category)}>
                        {card.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {card.network}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 items-center"
        >
          {/* Warning when no cards selected */}
          {selectedCount === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-muted border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <CreditCardIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">No cards selected</p>
                  <p className="text-xs text-muted-foreground">
                    Selecting your current cards helps us provide personalized recommendations and better reward analysis. 
                    Without this information, our AI insights will be limited.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/choice')}
              className="flex-1"
              disabled={isSubmitting}
            >
              Back
            </Button>

            {selectedCount > 0 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 text-base sm:text-lg"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 text-muted-foreground text-sm"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Skip for now
                  </>
                )}
              </Button>
            )}
          </div>

          {selectedCount === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground text-center"
            >
              You can add cards later from your profile
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
