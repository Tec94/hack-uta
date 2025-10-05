import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Edit3, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export function OnboardingChoice() {
  const { user } = useAuth0()
  const navigate = useNavigate()

  const linkBankBenefits = [
    'Automatic transaction categorization',
    'Real spending pattern analysis',
    'More accurate card recommendations',
    'No manual data entry required',
  ]

  const manualInputBenefits = [
    'Full privacy control',
    'Set your own budget categories',
    'Faster setup process',
    'Focus on goals, not history',
  ]

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            How would you like to set up your profile?
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-8 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Link Bank Account Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Link Bank Account</CardTitle>
                <CardDescription className="text-base">
                  Connect your bank for personalized insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {linkBankBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/onboarding/link-bank')}
                  className="w-full"
                  size="lg"
                >
                  Link Bank Account
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  🔒 Secured with bank-level encryption
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manual Input Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-4">
                  <Edit3 className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Manual Setup</CardTitle>
                <CardDescription className="text-base">
                  Enter your spending preferences manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {manualInputBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/onboarding/choose-card')}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Manual Setup
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ⚡ Takes less than 3 minutes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            You can always change this later in your profile settings
          </p>
          <button
            onClick={() => navigate('/home')}
            className="text-sm text-muted-foreground hover:text-foreground underline mt-4 transition-colors"
          >
            Skip for now (not recommended for accurate results)
          </button>
        </motion.div>
      </div>
    </div>
  )
}

