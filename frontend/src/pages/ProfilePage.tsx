import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useUserStore } from '@/store/userStore'
import { Mail, CreditCard, LogOut, Settings, Shield, Bell, HelpCircle, Sparkles, RefreshCw, BellOff, Timer, Radius } from 'lucide-react'
import { motion } from 'framer-motion'

export function ProfilePage() {
  const { user, logout } = useAuth0()
  const navigate = useNavigate()
  const { 
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

  const handleNotificationToggle = (checked: boolean) => {
    setNotificationsEnabled(checked)
  }

  const handleDwellTimeChange = (value: number[]) => {
    setDwellTimeSeconds(value[0])
  }

  const handleRadiusChange = (value: number[]) => {
    setDwellRadiusMeters(value[0])
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <Separator />
              
              {/* Smart Notifications Toggle */}
              <div className="p-3 sm:p-4 bg-muted rounded-xl border">
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground'} rounded-lg flex items-center justify-center transition-colors flex-shrink-0`}>
                      {notificationsEnabled ? (
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                      ) : (
                        <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold mb-1 text-sm sm:text-base">Smart Notifications</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Get card recommendations when you dwell at a location
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                    className="mt-1 flex-shrink-0"
                  />
                </div>

                {/* Detection Settings */}
                {notificationsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t"
                  >
                    {/* Dwell Time Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-primary flex-shrink-0" />
                          <label className="text-xs sm:text-sm font-medium">
                            Dwell Time
                          </label>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-primary">
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
                      <p className="text-xs text-muted-foreground">
                        How long to stay at a location before notification
                      </p>
                    </div>

                    {/* Dwell Radius Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Radius className="w-4 h-4 text-primary flex-shrink-0" />
                          <label className="text-xs sm:text-sm font-medium">
                            Detection Radius
                          </label>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-primary">
                          {dwellRadiusMeters}m
                        </span>
                      </div>
                      <Slider
                        value={[dwellRadiusMeters]}
                        onValueChange={handleRadiusChange}
                        min={10}
                        max={300}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum movement radius while dwelling
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
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

