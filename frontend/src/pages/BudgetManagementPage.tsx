import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
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
import { useToast } from '@/hooks/use-toast'
import { getBudget, updateBudget } from '@/lib/budget'
import { getTransactions, calculateSpendingFromTransactions } from '@/lib/plaid'
import {
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
  rent: { label: 'Rent/Mortgage', icon: '🏠', group: 'Essential', color: 'from-blue-500 to-indigo-600' },
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
  spendingPatterns?: string[]
  savingsOpportunity: number
  healthScore: number
  priorityActions?: string[]
  longTermAdvice?: string
  aiPowered?: boolean
  usedActualSpending?: boolean
}

export function BudgetManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuth0()
  const { toast } = useToast()
  const { budget, setBudget, monthlyIncome: storedIncome, setMonthlyIncome: saveMonthlyIncome } = useUserStore()
  
  const [editMode, setEditMode] = useState(false)
  const [tempBudget, setTempBudget] = useState<UserBudget>(budget || {
    rent: 0,
    groceries: 0,
    gas: 0,
    dining: 0,
    shopping: 0,
    entertainment: 0,
    travel: 0,
  })
  const [monthlyIncome, setMonthlyIncome] = useState<number>(storedIncome || 0)
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  
  // Actual spending data
  const [actualSpending, setActualSpending] = useState<UserBudget | null>(null)
  const [loadingSpending, setLoadingSpending] = useState(false)

  // Load budget from API on mount
  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.sub) {
        setInitialLoading(false)
        return
      }

      try {
        const budgetData = await getBudget(user.sub)
        if (budgetData) {
          setMonthlyIncome(budgetData.income)
          saveMonthlyIncome(budgetData.income)
          
          // Map API budget to UserBudget format
          const userBudget: UserBudget = {
            rent: budgetData.budget.rent || 0,
            groceries: budgetData.budget.groceries || 0,
            gas: budgetData.budget.gas || 0,
            dining: budgetData.budget.dining || 0,
            shopping: budgetData.budget.shopping || 0,
            entertainment: budgetData.budget.entertainment || 0,
            travel: budgetData.budget.travel || 0,
          }
          setBudget(userBudget)
          setTempBudget(userBudget)
        }
      } catch (error) {
        console.error('Error loading budget:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadBudget()
  }, [user?.sub, setBudget, saveMonthlyIncome])

  useEffect(() => {
    if (budget) {
      setTempBudget(budget)
      fetchActualSpending()
    }
  }, [budget])

  // Fetch AI insights when budget, income, or actual spending changes
  useEffect(() => {
    if (budget) {
      fetchAIInsights()
    }
  }, [budget, monthlyIncome, actualSpending])

  const fetchActualSpending = async () => {
    if (!user?.sub) return

    setLoadingSpending(true)
    try {
      // Get transactions for the current month
      const endDate = new Date()

      // Test: set start date to 2020-01-01
      const startDate = new Date(2020, 0, 1)
      // const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      
      const transactionData = await getTransactions(
        undefined, // accessToken - will use userId instead
        user.sub,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      if (transactionData.transactions) {
        const spending = calculateSpendingFromTransactions(transactionData.transactions)
        
        // Map to UserBudget format
        const userSpending: UserBudget = {
          rent: spending.rent || 0,
          groceries: spending.groceries || 0,
          gas: spending.gas || 0,
          dining: spending.dining || 0,
          shopping: spending.shopping || 0,
          entertainment: spending.entertainment || 0,
          travel: spending.travel || 0,
        }
        
        setActualSpending(userSpending)
      }
    } catch (error) {
      console.error('Error fetching actual spending:', error)
      // Don't show error toast for spending data - it's optional
    } finally {
      setLoadingSpending(false)
    }
  }

  const fetchAIInsights = async () => {
    if (!budget) return

    setLoadingInsights(true)
    try {
      // Prepare request body with budget, income, and actual spending
      const requestBody: any = {
        budget: budget,
        monthlyIncome: monthlyIncome > 0 ? monthlyIncome : null,
      }

      // Include actual spending if available (from bank transactions)
      if (actualSpending && Object.values(actualSpending).some(val => val > 0)) {
        requestBody.actualSpending = actualSpending
        console.log('AI Budget Insights: Using actual spending data from transactions')
      } else {
        console.log('AI Budget Insights: Using planned budget only')
      }

      const response = await fetch('http://localhost:3000/api/insights/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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

  const handleSave = async () => {
    if (!user?.sub) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save budget',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // Convert UserBudget to API format (with all categories)
      const budgetForApi = {
        rent: tempBudget.rent || 0,
        groceries: tempBudget.groceries || 0,
        gas: tempBudget.gas || 0,
        dining: tempBudget.dining || 0,
        shopping: tempBudget.shopping || 0,
        entertainment: tempBudget.entertainment || 0,
        travel: tempBudget.travel || 0,
      }

      await updateBudget(user.sub, monthlyIncome, budgetForApi)
      
      setBudget(tempBudget)
      saveMonthlyIncome(monthlyIncome)
      setEditMode(false)
      
      toast({
        title: 'Budget Saved',
        description: 'Your budget has been updated successfully',
      })
      
      // Refresh AI insights
      setTimeout(() => fetchAIInsights(), 500)
    } catch (error: any) {
      console.error('Error saving budget:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save budget',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempBudget(budget || tempBudget)
    setMonthlyIncome(storedIncome || 0)
    setEditMode(false)
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center">
            <PiggyBank className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Budget Set</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
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
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <img 
                src="/credify-logo.png" 
                alt="Credily" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Budget Manager</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Track and optimize your spending</p>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <Card className="shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground mb-2">Monthly Income</p>
                    <Input
                      type="number"
                      value={monthlyIncome || ''}
                      onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                      onBlur={() => saveMonthlyIncome(monthlyIncome)}
                      placeholder="Enter income"
                      className="text-lg sm:text-xl font-bold h-10 sm:h-12"
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{formatCurrency(totalMonthlySpending)}</p>
                  </CardContent>
                </Card>

                <Card className={`shadow-sm ${monthlyIncome > 0 ? (remainingAmount >= 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50') : ''}`}>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${monthlyIncome > 0 ? (remainingAmount >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl">AI Budget Insights</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">Personalized recommendations</p>
                    </div>
                  </div>
                  {loadingInsights && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Health Score */}
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-semibold">Budget Health Score</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold">{aiInsights.healthScore}/100</span>
                  </div>
                  <Progress value={aiInsights.healthScore} className="h-2 sm:h-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{aiInsights.summary}</p>
                </div>

                {/* Savings Opportunity */}
                {aiInsights.savingsOpportunity > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/20">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
                      <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold">Potential Monthly Savings</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          +{formatCurrency(aiInsights.savingsOpportunity)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Based on optimization opportunities in your current budget
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Strengths */}
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <h3 className="text-sm sm:text-base font-semibold">What's Working</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.strengths.map((strength, idx) => (
                        <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      <h3 className="text-sm sm:text-base font-semibold">Opportunities</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category Insights */}
                {Object.keys(aiInsights.categoryInsights).length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-semibold mb-3">Category Analysis</h3>
                    <div className="space-y-3">
                      {Object.entries(aiInsights.categoryInsights).map(([category, insight]) => (
                        <div key={category} className="flex items-start gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl flex-shrink-0">{categoryInfo[category]?.icon}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm">{categoryInfo[category]?.label}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{insight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spending Patterns */}
                {aiInsights.spendingPatterns && aiInsights.spendingPatterns.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h3 className="text-sm sm:text-base font-semibold">Spending Patterns</h3>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.spendingPatterns.map((pattern, idx) => (
                        <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Priority Actions */}
                {aiInsights.priorityActions && aiInsights.priorityActions.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h3 className="text-sm sm:text-base font-semibold text-primary">Priority Actions This Month</h3>
                    </div>
                    <ol className="space-y-2">
                      {aiInsights.priorityActions.map((action, idx) => (
                        <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                          <span className="font-bold text-primary flex-shrink-0">{idx + 1}.</span>
                          <span className="font-medium">{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Long-Term Advice */}
                {aiInsights.longTermAdvice && (
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border-l-4 border-primary">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-1">Long-Term Strategy</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{aiInsights.longTermAdvice}</p>
                      </div>
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
            actualSpending={actualSpending}
            title="Monthly Budget Breakdown"
            description="View and track your spending categories"
            showTotal={true}
            loadingSpending={loadingSpending}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">Edit Monthly Budget</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 sm:flex-initial" disabled={saving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-initial" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              {/* Essential Expenses */}
              <div className="mb-6">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  Essential Expenses
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {essentialCategories.map(([category, info]) => {
                    const amount = tempBudget[category as keyof UserBudget] || 0
                    
                    return (
                      <div key={category}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{info.icon}</span>
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={category} className="text-xs sm:text-sm font-medium">{info.label}</Label>
                            </div>
                          </div>
                          <Input
                            id={category}
                            type="number"
                            value={amount || ''}
                            onChange={(e) => handleCategoryChange(category as keyof UserBudget, e.target.value)}
                            className="w-full sm:w-28 md:w-32 text-right"
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
                <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  Lifestyle & Discretionary
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {lifestyleCategories.map(([category, info]) => {
                    const amount = tempBudget[category as keyof UserBudget] || 0
                    
                    return (
                      <div key={category}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{info.icon}</span>
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={category} className="text-xs sm:text-sm font-medium">{info.label}</Label>
                            </div>
                          </div>
                          <Input
                            id={category}
                            type="number"
                            value={amount || ''}
                            onChange={(e) => handleCategoryChange(category as keyof UserBudget, e.target.value)}
                            className="w-full sm:w-28 md:w-32 text-right"
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
