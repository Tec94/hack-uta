import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { UserBudget } from '@/types'
import { DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { saveBudget, getBudget } from '@/lib/budget'
import { useToast } from '@/hooks/use-toast'

const categoryGroups = [
  {
    title: 'Essential Expenses',
    categories: [
      { key: 'rent', label: 'Rent/Mortgage', icon: '🏠', suggestedRatio: 0.3 },
      { key: 'utilities', label: 'Utilities & Bills', icon: '💡', suggestedRatio: 0.08 },
      { key: 'groceries', label: 'Groceries', icon: '🛒', suggestedRatio: 0.12 },
      { key: 'gas', label: 'Gas & Transportation', icon: '⛽', suggestedRatio: 0.1 },
    ]
  },
  {
    title: 'Lifestyle & Discretionary',
    categories: [
      { key: 'dining', label: 'Dining & Restaurants', icon: '🍽️', suggestedRatio: 0.08 },
      { key: 'shopping', label: 'Shopping & Retail', icon: '🛍️', suggestedRatio: 0.08 },
      { key: 'entertainment', label: 'Entertainment', icon: '🎬', suggestedRatio: 0.06 },
      { key: 'travel', label: 'Travel & Hotels', icon: '✈️', suggestedRatio: 0.06 },
    ]
  }
]

export function ManualSetupPage() {
  const navigate = useNavigate()
<<<<<<< Updated upstream
  const { user } = useAuth0()
  const { toast } = useToast()
  const { setBudget, setLinkedBank, setOnboardingCompleted } = useUserStore()
=======
  const { setBudget, setLinkedBank, setOnboardingCompleted, setMonthlyIncome: saveMonthlyIncome } = useUserStore()
>>>>>>> Stashed changes
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [budgets, setBudgets] = useState<Record<string, number>>({
    rent: 0,
    utilities: 0,
    groceries: 0,
    gas: 0,
    dining: 0,
    shopping: 0,
    entertainment: 0,
    travel: 0,
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load existing budget on mount
  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.sub) {
        setInitialLoading(false)
        return
      }

      try {
        const existingBudget = await getBudget(user.sub)
        if (existingBudget) {
          setMonthlyIncome(existingBudget.income)
          setBudgets(existingBudget.budget)
        }
      } catch (error) {
        console.error('Error loading budget:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadBudget()
  }, [user?.sub])

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0
    // Only ensure non-negative values
    const clampedValue = Math.max(0, numValue)
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
<<<<<<< Updated upstream
    if (!user?.sub) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save budget',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Save budget to API
      await saveBudget({
        user_id: user.sub,
        income: monthlyIncome,
        budget: budgets,
      })

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

      toast({
        title: 'Budget Saved',
        description: 'Your budget has been saved successfully',
      })
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error saving budget:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save budget',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
=======
    // Map to UserBudget format for existing system
    const userBudget: UserBudget = {
      rent: budgets.rent || 0,
      groceries: budgets.groceries || 0,
      gas: budgets.gas || 0,
      dining: budgets.dining || 0,
      shopping: budgets.shopping || 0,
      entertainment: budgets.entertainment || 0,
      travel: budgets.travel || 0,
    }
    
    // Save to store
    setBudget(userBudget)
    saveMonthlyIncome(monthlyIncome)
    setLinkedBank(false)
    setOnboardingCompleted(true)
    
    // Navigate to dashboard
    navigate('/dashboard')
>>>>>>> Stashed changes
  }

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0)
  const remaining = monthlyIncome - totalBudget
  const percentageUsed = monthlyIncome > 0 ? Math.round((totalBudget / monthlyIncome) * 100) : 0

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Set Your Monthly Budget</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Adjust the sliders to match your typical monthly spending</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-8 h-2 rounded-full bg-primary"></div>
          </div>
        </motion.div>

        {/* Monthly Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="income" className="text-sm sm:text-base">What is your monthly income?</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="income"
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 5000"
                    min={0}
                    className="text-xl sm:text-2xl font-bold h-12 sm:h-14"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Enter your total monthly take-home income (after taxes)</p>
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
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Income</p>
                  <p className="text-base sm:text-xl font-bold">{formatCurrency(monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Allocated</p>
                  <p className="text-base sm:text-xl font-bold">{formatCurrency(totalBudget)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{percentageUsed}%</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-base sm:text-xl font-bold">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              {remaining < 0 && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetBudget}
                  className="text-xs"
                >
                  Reset All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {categoryGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    {groupIndex > 0 && <Separator className="my-6" />}
                    <h3 className="text-lg font-semibold mb-4">{group.title}</h3>
                    <div className="space-y-6">
                      {group.categories.map((category, index) => (
                        <motion.div
                          key={category.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + groupIndex * 0.2 + index * 0.05 }}
                          className="space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <span className="text-xl sm:text-2xl">{category.icon}</span>
                              <span className="text-xs sm:text-sm">{category.label}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <input
                                type="number"
                                value={budgets[category.key] || ''}
                                onChange={(e) => handleInputChange(category.key, e.target.value)}
                                min={0}
                                aria-label={`${category.label} budget amount`}
                                className="w-24 sm:w-28 px-2 sm:px-3 py-1.5 text-right font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Suggested allocation: {Math.round((category.suggestedRatio || 0) * 100)}% of income
                            {monthlyIncome > 0 && (
                              <span className="ml-1">
                                (~{formatCurrency(Math.round(monthlyIncome * (category.suggestedRatio || 0)))} )
                              </span>
                            )}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-muted border rounded-lg p-4 mt-6">
                  <h4 className="font-semibold mb-2">💡 Budgeting Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be realistic about your spending to get better card recommendations</li>
                    <li>• Don't forget to include all recurring expenses</li>
                    <li>• Your budget should not exceed your income</li>
                  </ul>
                </div>

                {/* Warning when no budget entered */}
                {monthlyIncome === 0 && totalBudget === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted border rounded-lg p-4 mt-6"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-1">Budget information not provided</p>
                        <p className="text-xs text-muted-foreground">
                          Without your income and spending data, we cannot provide personalized card recommendations 
                          or analyze which cards will maximize your rewards. Your dashboard insights will be significantly limited.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/onboarding/choice')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  
                  {monthlyIncome > 0 || totalBudget > 0 ? (
                    <Button 
                      type="submit" 
                      className="flex-1 text-base sm:text-lg" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      variant="ghost"
                      className="flex-1 text-muted-foreground text-sm"
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Skip for now'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

