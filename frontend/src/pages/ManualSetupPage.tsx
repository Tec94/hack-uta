import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { UserBudget } from '@/types'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const categoryGroups = [
  {
    title: 'Essential Expenses',
    categories: [
      { key: 'rent', label: 'Rent/Mortgage', icon: '🏠', max: 5000 },
      { key: 'utilities', label: 'Utilities & Bills', icon: '💡', max: 500 },
      { key: 'groceries', label: 'Groceries', icon: '🛒', max: 1000 },
      { key: 'gas', label: 'Gas & Transportation', icon: '⛽', max: 500 },
    ]
  },
  {
    title: 'Financial Goals',
    categories: [
      { key: 'savings', label: 'Savings', icon: '💰', max: 3000 },
      { key: 'investing', label: 'Investing', icon: '📈', max: 3000 },
      { key: 'debt', label: 'Debt Payments', icon: '💳', max: 2000 },
    ]
  },
  {
    title: 'Lifestyle & Discretionary',
    categories: [
      { key: 'dining', label: 'Dining & Restaurants', icon: '🍽️', max: 1000 },
      { key: 'shopping', label: 'Shopping & Retail', icon: '🛍️', max: 1000 },
      { key: 'entertainment', label: 'Entertainment', icon: '🎬', max: 500 },
      { key: 'travel', label: 'Travel & Hotels', icon: '✈️', max: 2000 },
    ]
  }
]

export function ManualSetupPage() {
  const navigate = useNavigate()
  const { setBudget, setLinkedBank, setOnboardingCompleted } = useUserStore()
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [budgets, setBudgets] = useState<Record<string, number>>({
    rent: 0,
    utilities: 0,
    groceries: 0,
    gas: 0,
    savings: 0,
    investing: 0,
    debt: 0,
    dining: 0,
    shopping: 0,
    entertainment: 0,
    travel: 0,
  })

  const handleSliderChange = (key: string, value: number[]) => {
    setBudgets((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0
    // Find the max for this category
    let maxValue = 5000 // default max
    for (const group of categoryGroups) {
      const category = group.categories.find(cat => cat.key === key)
      if (category) {
        maxValue = category.max
        break
      }
    }
    const clampedValue = Math.max(0, Math.min(maxValue, numValue))
    setBudgets((prev) => ({ ...prev, [key]: clampedValue }))
  }

  const handleResetBudget = () => {
    const resetBudgets: Record<string, number> = {}
    categoryGroups.forEach(group => {
      group.categories.forEach(cat => {
        resetBudgets[cat.key] = 0
      })
    })
    setBudgets(resetBudgets)
  }

  const handleSetDefaultBudget = () => {
    // 50/30/20 rule based on income: 50% needs, 30% wants, 20% savings
    const needs = Math.round(monthlyIncome * 0.5)
    const wants = Math.round(monthlyIncome * 0.3)
    const savings = Math.round(monthlyIncome * 0.2)
    
    setBudgets({
      rent: Math.round(needs * 0.5),
      utilities: Math.round(needs * 0.1),
      groceries: Math.round(needs * 0.25),
      gas: Math.round(needs * 0.15),
      savings: Math.round(savings * 0.6),
      investing: Math.round(savings * 0.3),
      debt: Math.round(savings * 0.1),
      dining: Math.round(wants * 0.35),
      shopping: Math.round(wants * 0.3),
      entertainment: Math.round(wants * 0.2),
      travel: Math.round(wants * 0.15),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Map to UserBudget format for existing system
    const userBudget: UserBudget = {
      dining: budgets.dining || 0,
      gas: budgets.gas || 0,
      groceries: budgets.groceries || 0,
      travel: budgets.travel || 0,
      shopping: budgets.shopping || 0,
      entertainment: budgets.entertainment || 0,
    }
    
    // Save to store
    setBudget(userBudget)
    setLinkedBank(false)
    setOnboardingCompleted(true)
    
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0)
  const remaining = monthlyIncome - totalBudget
  const percentageUsed = monthlyIncome > 0 ? Math.round((totalBudget / monthlyIncome) * 100) : 0

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

        {/* Monthly Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="income" className="text-base">What is your monthly income?</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <Input
                    id="income"
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 5000"
                    min={0}
                    className="text-2xl font-bold h-14"
                  />
                </div>
                <p className="text-sm text-gray-600">Enter your total monthly take-home income (after taxes)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`mb-6 ${remaining < 0 ? 'border-2 border-red-300 bg-red-50' : 'border-2 border-green-300 bg-green-50'}`}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Income</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Allocated</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(totalBudget)}</p>
                  <p className="text-xs text-gray-500">{percentageUsed}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              {remaining < 0 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Your budget exceeds your income by <strong>{formatCurrency(Math.abs(remaining))}</strong>. 
                    Please adjust your allocations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Categories Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center flex-wrap gap-4">
                <span>Budget Allocation</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetBudget}
                    className="text-xs"
                  >
                    Reset All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSetDefaultBudget}
                    className="text-xs"
                    disabled={monthlyIncome === 0}
                  >
                    Use 50/30/20 Rule
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {categoryGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    {groupIndex > 0 && <Separator className="my-6" />}
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h3>
                    <div className="space-y-6">
                      {group.categories.map((category, index) => (
                        <motion.div
                          key={category.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + groupIndex * 0.2 + index * 0.05 }}
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
                                value={budgets[category.key] || ''}
                                onChange={(e) => handleInputChange(category.key, e.target.value)}
                                min={0}
                                max={category.max}
                                aria-label={`${category.label} budget amount`}
                                className="w-28 px-3 py-1.5 text-right font-bold text-primary border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                          </div>
                          <Slider
                            value={[budgets[category.key] || 0]}
                            onValueChange={(value) => handleSliderChange(category.key, value)}
                            min={0}
                            max={category.max}
                            step={category.max > 1000 ? 100 : 50}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>$0</span>
                            <span>{formatCurrency(category.max)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Budgeting Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>50/30/20 Rule:</strong> 50% needs, 30% wants, 20% savings/debt</li>
                    <li>• Be realistic about your spending to get better card recommendations</li>
                    <li>• Don't forget to include all recurring expenses</li>
                  </ul>
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
                  <Button 
                    type="submit" 
                    className="flex-1 text-lg" 
                    size="lg"
                    disabled={monthlyIncome === 0 || totalBudget === 0}
                  >
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

