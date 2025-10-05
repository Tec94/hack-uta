import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useUserStore } from '@/store/userStore'
import { Mail, CreditCard, DollarSign, LogOut, Settings, Shield, Bell, HelpCircle, Sparkles, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

const categoryInfo: Record<string, { label: string; icon: string; group: string }> = {
  groceries: { label: 'Groceries', icon: '🛒', group: 'Essential' },
  gas: { label: 'Gas & Transportation', icon: '⛽', group: 'Essential' },
  dining: { label: 'Dining & Restaurants', icon: '🍽️', group: 'Lifestyle' },
  shopping: { label: 'Shopping & Retail', icon: '🛍️', group: 'Lifestyle' },
  entertainment: { label: 'Entertainment', icon: '🎬', group: 'Lifestyle' },
  travel: { label: 'Travel & Hotels', icon: '✈️', group: 'Lifestyle' },
}

export function ProfilePage() {
  const { user, logout } = useAuth0()
  const navigate = useNavigate()
  const { budget, linkedBank, onboardingCompleted, reset } = useUserStore()

  const totalMonthlySpending = budget
    ? Object.values(budget).reduce((sum, val) => sum + val, 0)
    : 0

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 shadow-lg mb-4">
              <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
              <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-primary-foreground">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4" />
              <span className="break-all">{user?.email}</span>
            </p>
            <Badge variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Testing Member
            </Badge>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {onboardingCompleted ? 'Active & Verified' : 'Setup Incomplete'}
                    </p>
                  </div>
                </div>
                <Badge variant={onboardingCompleted ? 'default' : 'secondary'}>
                  {onboardingCompleted ? '✓ Active' : '⚠ Incomplete'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Data Source</p>
                    <p className="text-sm text-muted-foreground">
                      {linkedBank ? 'Bank account linked' : 'Manual entry mode'}
                    </p>
                  </div>
                </div>
                <Badge variant={linkedBank ? 'default' : 'secondary'}>
                  {linkedBank ? '🏦 Linked' : '✏️ Manual'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Overview */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Monthly Budget</CardTitle>
                      <p className="text-sm text-muted-foreground">Spending allocation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatCurrency(totalMonthlySpending)}</p>
                    <p className="text-xs text-muted-foreground">Total budget</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Essential Expenses */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Essential Expenses</h3>
                  <div className="space-y-3">
                    {Object.entries(budget)
                      .filter(([cat]) => categoryInfo[cat]?.group === 'Essential')
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount], index) => {
                        const percentage = (amount / totalMonthlySpending) * 100
                        const info = categoryInfo[category]
                        return (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{info.icon}</span>
                                <span className="text-sm font-medium">{info.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                                <span className="text-sm font-bold">{formatCurrency(amount)}</span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </motion.div>
                        )
                      })}
                  </div>
                </div>

                {/* Lifestyle & Discretionary */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Lifestyle & Discretionary</h3>
                  <div className="space-y-3">
                    {Object.entries(budget)
                      .filter(([cat]) => categoryInfo[cat]?.group === 'Lifestyle')
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount], index) => {
                        const percentage = (amount / totalMonthlySpending) * 100
                        const info = categoryInfo[category]
                        return (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{info.icon}</span>
                                <span className="text-sm font-medium">{info.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                                <span className="text-sm font-bold">{formatCurrency(amount)}</span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </motion.div>
                        )
                      })}
                  </div>
                </div>

                <Separator className="my-6" />
                
                <Button variant="outline" className="w-full" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Budget Categories
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => navigate('/cards')}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                <span>Manage Cards</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="w-5 h-5 mr-3" />
                <span>Preferences</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Support & Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <HelpCircle className="w-5 h-5 mr-3" />
                <span>Help Center</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Shield className="w-5 h-5 mr-3" />
                <span>Security</span>
              </Button>
              
              <Separator className="my-2" />
              
              {/* Testing button to reset onboarding */}
              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => {
                  if (confirm('Reset bank integration? This will clear your budget and bank connection data for testing purposes.')) {
                    reset()
                    navigate('/onboarding/choice')
                  }
                }}
              >
                <RefreshCw className="w-5 h-5 mr-3" />
                <span>Reset Bank Integration (Test)</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Log Out</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

