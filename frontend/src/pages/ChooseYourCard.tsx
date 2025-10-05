import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

interface CardSelection {
  [cardId: string]: boolean
}

export function ChooseYourCardPage() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { setCurrentCards } = useUserStore()
  const [cards, setCards] = useState<ApiCreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<CardSelection>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setCards(data.data || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
      setError('Failed to load credit cards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardToggle = (cardId: string, checked: boolean) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: checked
    }))
  }

  const handleSubmit = async () => {
    const selectedCardIds = Object.keys(selectedCards).filter(id => selectedCards[id])

    setIsSubmitting(true)

    try {
      // Store selected card IDs in user store (can be empty)
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
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative group ${selectedCards[card.id] ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onClick={() => handleCardToggle(card.id, !selectedCards[card.id])}
            >
              <Card className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold mb-1 truncate">
                        {card.card_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{card.bank_name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedCards[card.id] && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                      <Checkbox
                        checked={selectedCards[card.id] || false}
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
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 items-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/choice')}
              className="w-full sm:w-auto min-w-[140px]"
              disabled={isSubmitting}
            >
              Back
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[140px]"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {selectedCount > 0 ? 'Continue' : 'Skip'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {selectedCount === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center"
            >
              You can add cards later from your profile
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
