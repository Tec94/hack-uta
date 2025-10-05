import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DollarSign, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserBudget } from '@/types'
import { formatCurrency } from '@/lib/utils'

const categoryInfo: Record<string, { label: string; icon: string; group: string }> = {
  rent: { label: 'Rent/Mortgage', icon: '🏠', group: 'Essential' },
  groceries: { label: 'Groceries', icon: '🛒', group: 'Essential' },
  gas: { label: 'Gas & Transportation', icon: '⛽', group: 'Essential' },
  dining: { label: 'Dining & Restaurants', icon: '🍽️', group: 'Lifestyle' },
  shopping: { label: 'Shopping & Retail', icon: '🛍️', group: 'Lifestyle' },
  entertainment: { label: 'Entertainment', icon: '🎬', group: 'Lifestyle' },
  travel: { label: 'Travel & Hotels', icon: '✈️', group: 'Lifestyle' },
}

interface MonthlyBudgetBreakdownProps {
  budget: UserBudget
  actualSpending?: UserBudget | null // Actual spending from transactions
  spending?: UserBudget | null // Legacy prop for backward compatibility
  title?: string
  description?: string
  showTotal?: boolean
  loadingSpending?: boolean
  actionButton?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
  animationDelay?: number
  compact?: boolean
}

export function MonthlyBudgetBreakdown({
  budget,
  actualSpending = null,
  spending = null, // Legacy prop
  title = 'Spending Breakdown',
  description = 'Monthly budget allocation',
  showTotal = true,
  loadingSpending = false,
  actionButton,
  animationDelay = 0,
  compact = false
}: MonthlyBudgetBreakdownProps) {
  const totalBudget = Object.values(budget).reduce((sum, val) => sum + val, 0)
  // Use actualSpending if available, fallback to spending for backward compatibility
  const currentSpending = actualSpending || spending
  const totalSpending = currentSpending ? Object.values(currentSpending).reduce((sum, val) => sum + val, 0) : 0
  const hasSpendingData = currentSpending !== null

  // Custom order for Essential: rent, groceries, gas
  const essentialOrder = ['rent', 'groceries', 'gas']
  const essentialCategories = Object.entries(budget)
    .filter(([cat]) => categoryInfo[cat]?.group === 'Essential')
    .sort((a, b) => {
      const indexA = essentialOrder.indexOf(a[0])
      const indexB = essentialOrder.indexOf(b[0])
      return indexA - indexB
    })

  // Custom order for Lifestyle: travel, dining, shopping, entertainment
  const lifestyleOrder = ['travel', 'dining', 'shopping', 'entertainment']
  const lifestyleCategories = Object.entries(budget)
    .filter(([cat]) => categoryInfo[cat]?.group === 'Lifestyle')
    .sort((a, b) => {
      const indexA = lifestyleOrder.indexOf(a[0])
      const indexB = lifestyleOrder.indexOf(b[0])
      return indexA - indexB
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-xl truncate">{title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
              </div>
            </div>
            {actionButton && (
              <Button onClick={actionButton.onClick} variant="outline" size="sm" className="w-full sm:w-auto flex-shrink-0">
                {actionButton.icon}
                {actionButton.label}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Essential Expenses */}
          {essentialCategories.length > 0 && (
            <div className={compact ? 'mb-4' : 'mb-6'}>
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground">Essential Expenses</h3>
              <div className={compact ? 'space-y-3' : 'space-y-4'}>
                {essentialCategories.map(([category, budgetAmount], index) => {
                  const spendingAmount = hasSpendingData ? (currentSpending[category as keyof UserBudget] || 0) : 0
                  // Only calculate percentage based on actual spending vs budget
                  const percentage = hasSpendingData && budgetAmount > 0 
                    ? (spendingAmount / budgetAmount) * 100 
                    : 0
                  const info = categoryInfo[category]
                  
                  // Color coding: green < 80%, yellow 80-100%, red > 100%
                  const progressColor = hasSpendingData
                    ? percentage > 100 ? 'bg-destructive' : percentage > 80 ? 'bg-yellow-500' : 'bg-primary'
                    : 'bg-muted'
                    
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: animationDelay + index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-start sm:items-center justify-between mb-1.5 sm:mb-2 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <span className="text-base sm:text-lg flex-shrink-0">{info.icon}</span>
                          <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors truncate">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{percentage.toFixed(0)}%</span>
                          {hasSpendingData ? (
                            <span className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                              {formatCurrency(spendingAmount)} / {formatCurrency(budgetAmount)}
                            </span>
                          ) : (
                            <span className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                              {formatCurrency(budgetAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-1.5 sm:h-2"
                        indicatorClassName={progressColor}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lifestyle & Discretionary */}
          {lifestyleCategories.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground">Lifestyle & Discretionary</h3>
              <div className={compact ? 'space-y-3' : 'space-y-4'}>
                {lifestyleCategories.map(([category, budgetAmount], index) => {
                  const spendingAmount = hasSpendingData ? (currentSpending[category as keyof UserBudget] || 0) : 0
                  // Only calculate percentage based on actual spending vs budget
                  const percentage = hasSpendingData && budgetAmount > 0 
                    ? (spendingAmount / budgetAmount) * 100 
                    : 0
                  const info = categoryInfo[category]
                  const essentialCount = essentialCategories.length
                  
                  // Color coding: green < 80%, yellow 80-100%, red > 100%
                  const progressColor = hasSpendingData
                    ? percentage > 100 ? 'bg-destructive' : percentage > 80 ? 'bg-yellow-500' : 'bg-primary'
                    : 'bg-muted'
                    
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: animationDelay + (essentialCount + index) * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-start sm:items-center justify-between mb-1.5 sm:mb-2 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <span className="text-base sm:text-lg flex-shrink-0">{info.icon}</span>
                          <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors truncate">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{percentage.toFixed(0)}%</span>
                          {hasSpendingData ? (
                            <span className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                              {formatCurrency(spendingAmount)} / {formatCurrency(budgetAmount)}
                            </span>
                          ) : (
                            <span className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                              {formatCurrency(budgetAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-1.5 sm:h-2"
                        indicatorClassName={progressColor}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Total Budget */}
          {showTotal && (
            <div className={`${compact ? 'mt-4 pt-4' : 'mt-5 sm:mt-6 pt-4 sm:pt-6'} border-t`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {loadingSpending ? 'Loading spending data...' : 
                   hasSpendingData ? 'Total Spending vs Budget' : 'Total Monthly Budget'}
                </span>
                {loadingSpending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : hasSpendingData ? (
                  <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                    {formatCurrency(totalSpending)} / {formatCurrency(totalBudget)}
                  </span>
                ) : (
                  <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                    {formatCurrency(totalBudget)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
