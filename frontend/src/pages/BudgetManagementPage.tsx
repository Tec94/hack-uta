import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { MonthlyBudgetBreakdown } from '@/components/budget/MonthlyBudgetBreakdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserStore } from '@/store/userStore'
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Edit, 
  Check, 
  X, 
  Loader2,
  PiggyBank,
  Target,
  ThumbsUp,
  Lightbulb,
  Activity
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import { UserBudget } from '@/types'

const categoryInfo: Record<string, { label: string; icon: string; group: string; color: string }> = {
  groceries: { label: 'Groceries', icon: '🛒', group: 'Essential', color: 'from-green-500 to-emerald-600' },
  gas: { label: 'Gas & Transportation', icon: '⛽', group: 'Essential', color: 'from-amber-500 to-orange-600' },
  dining: { label: 'Dining & Restaurants', icon: '🍽️', group: 'Lifestyle', color: 'from-emerald-500 to-teal-600' },
  shopping: { label: 'Shopping & Retail', icon: '🛍️', group: 'Lifestyle', color: 'from-teal-500 to-cyan-600' },
  entertainment: { label: 'Entertainment', icon: '🎬', group: 'Lifestyle', color: 'from-lime-500 to-green-600' },
  travel: { label: 'Travel & Hotels', icon: '✈️', group: 'Lifestyle', color: 'from-green-600 to-emerald-700' },
}

interface AIInsights {
  summary: string
  strengths: string[]
  improvements: string[]
  categoryInsights: Record<string, string>
  savingsOpportunity: number
  healthScore: number
  aiPowered?: boolean
}

export function BudgetManagementPage() {
  const navigate = useNavigate()
  const { budget, setBudget } = useUserStore()
  
  const [editMode, setEditMode] = useState(false)
  const [tempBudget, setTempBudget] = useState<UserBudget>(budget || {
    dining: 0,
    gas: 0,
    groceries: 0,
    travel: 0,
    shopping: 0,
    entertainment: 0,
  })
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    if (budget) {
      setTempBudget(budget)
      fetchAIInsights()
    }
  }, [budget])

  const fetchAIInsights = async () => {
    if (!budget) return

    setLoadingInsights(true)
    try {
      const response = await fetch('http://localhost:3000/api/insights/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: budget,
          monthlyIncome: null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        setAiInsights(data.data)
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err)
    } finally {
      setLoadingInsights(false)
    }
  }

  const totalMonthlySpending = tempBudget
    ? Object.values(tempBudget).reduce((sum, val) => sum + val, 0)
    : 0

  const remainingAmount = monthlyIncome - totalMonthlySpending

  const handleCategoryChange = (category: keyof UserBudget, value: string) => {
    const numValue = parseInt(value) || 0
    setTempBudget(prev => ({
      ...prev,
      [category]: Math.max(0, numValue)
    }))
  }

  const handleSave = () => {
    setBudget(tempBudget)
    setEditMode(false)
    // Refresh AI insights
    setTimeout(() => fetchAIInsights(), 500)
  }

  const handleCancel = () => {
    setTempBudget(budget || tempBudget)
    setEditMode(false)
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <Card className="max-w-md mx-4 shadow-sm">
          <CardContent className="p-8 text-center">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Budget Set</h2>
            <p className="text-muted-foreground mb-6">
              Set up your monthly budget to get started with personalized recommendations.
            </p>
            <Button onClick={() => navigate('/onboarding/choice')} size="lg" className="w-full">
              Set Up Budget
            </Button>
          </CardContent>
        </Card>
        <BottomNav />
      </div>
    )
  }

  const essentialCategories = Object.entries(categoryInfo).filter(([_, info]) => info.group === 'Essential')
  const lifestyleCategories = Object.entries(categoryInfo).filter(([_, info]) => info.group === 'Lifestyle')

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Budget Manager</h1>
                  <p className="text-sm text-muted-foreground">Track and optimize your spending</p>
                </div>
              </div>
              {!editMode && (
                <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {/* Budget Summary */}
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Monthly Income</p>
                    <Input
                      type="number"
                      value={monthlyIncome || ''}
                      onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                      placeholder="Enter income"
                      className="text-xl font-bold h-12"
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalMonthlySpending)}</p>
                  </CardContent>
                </Card>

                <Card className={`shadow-sm ${monthlyIncome > 0 ? (remainingAmount >= 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50') : ''}`}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${monthlyIncome > 0 ? (remainingAmount >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                      {monthlyIncome > 0 ? formatCurrency(Math.abs(remainingAmount)) : '—'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* AI Insights Section */}
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI Budget Insights</CardTitle>
                      <p className="text-sm text-muted-foreground">Personalized recommendations</p>
                    </div>
                  </div>
                  {loadingInsights && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Health Score */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      <span className="font-semibold">Budget Health Score</span>
                    </div>
                    <span className="text-2xl font-bold">{aiInsights.healthScore}/100</span>
                  </div>
                  <Progress value={aiInsights.healthScore} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{aiInsights.summary}</p>
                </div>

                {/* Savings Opportunity */}
                {aiInsights.savingsOpportunity > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <PiggyBank className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">Potential Monthly Savings</p>
                        <p className="text-2xl font-bold text-primary">
                          +{formatCurrency(aiInsights.savingsOpportunity)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on optimization opportunities in your current budget
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">What's Working</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      <h3 className="font-semibold">Opportunities</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category Insights */}
                {Object.keys(aiInsights.categoryInsights).length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Category Analysis</h3>
                    <div className="space-y-3">
                      {Object.entries(aiInsights.categoryInsights).map(([category, insight]) => (
                        <div key={category} className="flex items-start gap-3">
                          <span className="text-2xl">{categoryInfo[category]?.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{categoryInfo[category]?.label}</p>
                            <p className="text-sm text-muted-foreground">{insight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiInsights.aiPowered && (
                  <Badge variant="secondary" className="w-fit">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Powered by Gemini AI
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Budget Categories */}
        {!editMode ? (
          <MonthlyBudgetBreakdown
            budget={tempBudget}
            title="Monthly Budget Breakdown"
            description="View and track your spending categories"
            showTotal={true}
            actionButton={{
              label: 'Edit',
              icon: <Edit className="w-4 h-4 mr-2" />,
              onClick: () => setEditMode(true)
            }}
            animationDelay={0.2}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Monthly Budget</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} size="sm">
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              {/* Essential Expenses */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Essential Expenses
                </h3>
                <div className="space-y-4">
                  {essentialCategories.map(([category, info]) => {
                    const amount = tempBudget[category as keyof UserBudget] || 0
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">{info.icon}</span>
                            <div className="flex-1">
                              <Label htmlFor={category} className="text-sm font-medium">{info.label}</Label>
                            </div>
                          </div>
                          <Input
                            id={category}
                            type="number"
                            value={amount || ''}
                            onChange={(e) => handleCategoryChange(category as keyof UserBudget, e.target.value)}
                            className="w-32 text-right"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Lifestyle & Discretionary */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Lifestyle & Discretionary
                </h3>
                <div className="space-y-4">
                  {lifestyleCategories.map(([category, info]) => {
                    const amount = tempBudget[category as keyof UserBudget] || 0
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">{info.icon}</span>
                            <div className="flex-1">
                              <Label htmlFor={category} className="text-sm font-medium">{info.label}</Label>
                            </div>
                          </div>
                          <Input
                            id={category}
                            type="number"
                            value={amount || ''}
                            onChange={(e) => handleCategoryChange(category as keyof UserBudget, e.target.value)}
                            className="w-32 text-right"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )
                  })}
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
