import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { UserBudget } from '@/types'
import { DollarSign } from 'lucide-react'

const categories = [
  { key: 'dining', label: 'Dining & Restaurants', icon: '🍽️' },
  { key: 'gas', label: 'Gas & Fuel', icon: '⛽' },
  { key: 'groceries', label: 'Groceries', icon: '🛒' },
  { key: 'travel', label: 'Travel & Hotels', icon: '✈️' },
  { key: 'shopping', label: 'Shopping & Retail', icon: '🛍️' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
]

export function ManualSetupPage() {
  const navigate = useNavigate()
  const { setBudget, setLinkedBank, setOnboardingCompleted } = useUserStore()
  const [budgets, setBudgets] = useState<UserBudget>({
    dining: 300,
    gas: 150,
    groceries: 400,
    travel: 200,
    shopping: 250,
    entertainment: 100,
  })

  const handleSliderChange = (key: string, value: number[]) => {
    setBudgets((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0
    // Clamp value between 0 and 2000
    const clampedValue = Math.max(0, Math.min(2000, numValue))
    setBudgets((prev) => ({ ...prev, [key]: clampedValue }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save to store
    setBudget(budgets)
    setLinkedBank(false)
    setOnboardingCompleted(true)
    
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Set Your Monthly Budget</h1>
          <p className="text-gray-600">Adjust the sliders to match your typical monthly spending</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-8 h-2 rounded-full bg-primary"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Monthly Budget Categories</span>
                <span className="text-2xl text-primary">{formatCurrency(totalBudget)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={budgets[category.key as keyof UserBudget]}
                          onChange={(e) => handleInputChange(category.key, e.target.value)}
                          min={0}
                          max={2000}
                          aria-label={`${category.label} budget amount`}
                          className="w-24 px-3 py-1.5 text-right font-bold text-primary border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <Slider
                      value={[budgets[category.key as keyof UserBudget]]}
                      onValueChange={(value) => handleSliderChange(category.key, value)}
                      min={0}
                      max={1000}
                      step={25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0</span>
                      <span>$1,000+</span>
                    </div>
                  </motion.div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    Be honest about your spending! More accurate budgets lead to better card recommendations.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/onboarding/choice')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 text-lg" size="lg">
                    Complete Setup
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

