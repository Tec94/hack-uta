import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useUserStore } from '@/store/userStore'
import { Mail, CreditCard, DollarSign, LogOut, Settings, Shield, Bell, HelpCircle, Sparkles, RefreshCw, BellOff, Timer, Radius } from 'lucide-react'
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
  const { 
    budget, 
    linkedBank, 
    onboardingCompleted, 
    notificationsEnabled, 
    setNotificationsEnabled,
    dwellTimeSeconds,
    setDwellTimeSeconds,
    dwellRadiusMeters,
    setDwellRadiusMeters,
    reset 
  } = useUserStore()

  const totalMonthlySpending = budget
    ? Object.values(budget).reduce((sum, val) => sum + val, 0)
    : 0

  const handleNotificationToggle = (checked: boolean) => {
    setNotificationsEnabled(checked)
    if (checked) {
      console.log('✅ Notifications enabled')
    } else {
      console.log('🔕 Notifications disabled')
    }
  }

  const handleDwellTimeChange = (value: number[]) => {
    setDwellTimeSeconds(value[0])
    console.log(`⏱️ Dwell time set to ${value[0]} seconds (${Math.floor(value[0] / 60)} min ${value[0] % 60} sec)`)
  }

  const handleRadiusChange = (value: number[]) => {
    setDwellRadiusMeters(value[0])
    console.log(`📏 Dwell radius set to ${value[0]} meters`)
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl mb-4">
              <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-blue-100 flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Testing Member
            </Badge>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-6">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">
                      {onboardingCompleted ? 'Active & Verified' : 'Setup Incomplete'}
                    </p>
                  </div>
                </div>
                <Badge className={onboardingCompleted ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'}>
                  {onboardingCompleted ? '✓ Active' : '⚠ Incomplete'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Source</p>
                    <p className="text-sm text-gray-600">
                      {linkedBank ? 'Bank account linked' : 'Manual entry mode'}
                    </p>
                  </div>
                </div>
                <Badge className={linkedBank ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300'}>
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
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Monthly Budget</CardTitle>
                      <p className="text-sm text-muted-foreground">Spending allocation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{formatCurrency(totalMonthlySpending)}</p>
                    <p className="text-xs text-muted-foreground">Total budget</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Essential Expenses */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Essential Expenses</h3>
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Lifestyle & Discretionary</h3>
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
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors" 
                size="lg"
                onClick={() => navigate('/cards')}
              >
                <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                <span>Manage Cards</span>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 transition-colors" size="lg">
                <Settings className="w-5 h-5 mr-3 text-purple-600" />
                <span>Preferences</span>
              </Button>
              
              <Separator />
              
              {/* Smart Notifications Toggle */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-400'} rounded-lg flex items-center justify-center transition-colors`}>
                      {notificationsEnabled ? (
                        <Bell className="w-5 h-5 text-white" />
                      ) : (
                        <BellOff className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Smart Notifications</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Get card recommendations when you dwell at a location
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                    className="mt-1"
                  />
                </div>

                {/* Detection Settings */}
                {notificationsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-green-200"
                  >
                    {/* Dwell Time Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-green-700" />
                          <label className="text-sm font-medium text-gray-900">
                            Dwell Time
                          </label>
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {formatTime(dwellTimeSeconds)}
                        </span>
                      </div>
                      <Slider
                        value={[dwellTimeSeconds]}
                        onValueChange={handleDwellTimeChange}
                        min={10}
                        max={600}
                        step={10}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600">
                        How long to stay at a location before notification
                      </p>
                    </div>

                    {/* Dwell Radius Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radius className="w-4 h-4 text-green-700" />
                          <label className="text-sm font-medium text-gray-900">
                            Detection Radius
                          </label>
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {dwellRadiusMeters}m
                        </span>
                      </div>
                      <Slider
                        value={[dwellRadiusMeters]}
                        onValueChange={handleRadiusChange}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600">
                        Maximum movement radius while dwelling
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDwellTimeSeconds(10)
                          setDwellRadiusMeters(10)
                        }}
                        className="flex-1 text-xs"
                      >
                        🚀 Quick Test
                        <span className="block text-[10px] text-muted-foreground">10s / 10m</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDwellTimeSeconds(300)
                          setDwellRadiusMeters(30)
                        }}
                        className="flex-1 text-xs"
                      >
                        🎯 Default
                        <span className="block text-[10px] text-muted-foreground">5m / 30m</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDwellTimeSeconds(600)
                          setDwellRadiusMeters(50)
                        }}
                        className="flex-1 text-xs"
                      >
                        🏠 Relaxed
                        <span className="block text-[10px] text-muted-foreground">10m / 50m</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Support & Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors" size="lg">
                <HelpCircle className="w-5 h-5 mr-3 text-blue-600" />
                <span>Help Center</span>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-indigo-50 hover:border-indigo-300 transition-colors" size="lg">
                <Shield className="w-5 h-5 mr-3 text-indigo-600" />
                <span>Security</span>
              </Button>
              
              <Separator className="my-2" />
              
              {/* Testing button to reset onboarding */}
              <Button
                variant="outline"
                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
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
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
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

