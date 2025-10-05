import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, MapPin, Sparkles, Shield, TrendingUp, Zap, Star, Award, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/userStore'

export function HomePage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const { onboardingCompleted } = useUserStore()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Route to onboarding if not completed, otherwise go to dashboard
      if (onboardingCompleted) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding/choice')
      }
    }
  }, [isAuthenticated, isLoading, onboardingCompleted, navigate])

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Recommendations',
      description: 'Get instant card recommendations based on where you shop',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Smart recommendations powered by advanced AI technology',
    },
    {
      icon: TrendingUp,
      title: 'Maximize Rewards',
      description: 'Never miss out on earning maximum points and cash back',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and never sold',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/credify-logo.png" 
            alt="Credily" 
            className="w-24 h-24 mx-auto mb-6 object-contain animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <img 
              src="/credify-logo.png" 
              alt="Credily Logo" 
              className="w-32 h-32 object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <Star className="w-3 h-3 mr-1 inline fill-current" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <Award className="w-3 h-3 mr-1 inline" />
              Smart Rewards
            </Badge>
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <Lock className="w-3 h-3 mr-1 inline" />
              100% Secure
            </Badge>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Smart Credit Card Rewards with
            <br />
            <span className="text-primary">
              Credily
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Stop leaving money on the table. Get instant, AI-powered credit card recommendations 
            based on your location and spending patterns.
            <br />
            <span className="font-semibold">Make every swipe count.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => loginWithRedirect()}
              size="lg" 
              className="text-lg px-10 py-7 w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Earning More
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-7 w-full sm:w-auto"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Free to use
            </span>
            <span>•</span>
            <span>No credit card required</span>
            <span>•</span>
            <span>2-minute setup</span>
          </div>
        </motion.div>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-3xl shadow-lg p-8 border">
            <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="flex justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-background rounded-2xl shadow-md flex items-center justify-center animate-bounce border">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className="w-16 h-16 bg-background rounded-2xl shadow-md flex items-center justify-center animate-bounce border" style={{ animationDelay: '0.2s' }}>
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div className="w-16 h-16 bg-background rounded-2xl shadow-md flex items-center justify-center animate-bounce border" style={{ animationDelay: '0.4s' }}>
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <p className="font-semibold text-lg">Interactive Map & Smart Recommendations</p>
                <p className="text-muted-foreground text-sm mt-2">Real-time insights for every location</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Credily?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Make every swipe count with intelligent, personalized recommendations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-card p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-primary rounded-3xl p-12 md:p-16 text-center text-primary-foreground overflow-hidden shadow-lg"
        >
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time: Get Premium Free for 3 Months</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Maximize Your Rewards?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of smart spenders already earning 3x more with optimized card usage
            </p>
            <Button 
              onClick={() => loginWithRedirect()}
              size="lg" 
              variant="secondary" 
              className="text-lg px-10 py-7"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Earning More Today
            </Button>
            
            <div className="flex flex-wrap justify-center items-center gap-8 mt-10 text-sm opacity-90">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bank-level security
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                4.9/5 rating
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Average 3x rewards boost
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/credify-logo.png" 
                alt="Credily" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold">
                Credily
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm mt-8">
            <p>&copy; 2024 Credily. All rights reserved. Made with ❤️ for smart spenders.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

