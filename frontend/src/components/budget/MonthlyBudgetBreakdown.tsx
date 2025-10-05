import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserBudget } from '@/types'
import { formatCurrency } from '@/lib/utils'

const categoryInfo: Record<string, { label: string; icon: string; group: string }> = {
  groceries: { label: 'Groceries', icon: '🛒', group: 'Essential' },
  gas: { label: 'Gas & Transportation', icon: '⛽', group: 'Essential' },
  dining: { label: 'Dining & Restaurants', icon: '🍽️', group: 'Lifestyle' },
  shopping: { label: 'Shopping & Retail', icon: '🛍️', group: 'Lifestyle' },
  entertainment: { label: 'Entertainment', icon: '🎬', group: 'Lifestyle' },
  travel: { label: 'Travel & Hotels', icon: '✈️', group: 'Lifestyle' },
}

interface MonthlyBudgetBreakdownProps {
  budget: UserBudget
  title?: string
  description?: string
  showTotal?: boolean
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
  title = 'Spending Breakdown',
  description = 'Monthly budget allocation',
  showTotal = true,
  actionButton,
  animationDelay = 0,
  compact = false
}: MonthlyBudgetBreakdownProps) {
  const totalBudget = Object.values(budget).reduce((sum, val) => sum + val, 0)

  const essentialCategories = Object.entries(budget)
    .filter(([cat]) => categoryInfo[cat]?.group === 'Essential')
    .sort((a, b) => b[1] - a[1])

  const lifestyleCategories = Object.entries(budget)
    .filter(([cat]) => categoryInfo[cat]?.group === 'Lifestyle')
    .sort((a, b) => b[1] - a[1])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {actionButton && (
              <Button onClick={actionButton.onClick} variant="outline" size="sm">
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
              <h3 className="text-sm font-semibold mb-3">Essential Expenses</h3>
              <div className={compact ? 'space-y-2' : 'space-y-3'}>
                {essentialCategories.map(([category, amount], index) => {
                  const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0
                  const info = categoryInfo[category]
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: animationDelay + index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{info.icon}</span>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                          <span className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lifestyle & Discretionary */}
          {lifestyleCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Lifestyle & Discretionary</h3>
              <div className={compact ? 'space-y-2' : 'space-y-3'}>
                {lifestyleCategories.map(([category, amount], index) => {
                  const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0
                  const info = categoryInfo[category]
                  const essentialCount = essentialCategories.length
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: animationDelay + (essentialCount + index) * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{info.icon}</span>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                          <span className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Total Budget */}
          {showTotal && (
            <div className={`${compact ? 'mt-4 pt-4' : 'mt-6 pt-6'} border-t`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Monthly Budget</span>
                <span className={`font-bold ${compact ? 'text-xl' : 'text-2xl'}`}>
                  {formatCurrency(totalBudget)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
