import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, MapPin, Sparkles, Shield, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function HomePage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, isLoading, navigate])

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Optimize Every Purchase with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}SwipeRight
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Never leave rewards on the table. Get instant, intelligent credit card recommendations 
            based on your location and spending habits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => loginWithRedirect()}
              size="lg" 
              className="text-lg px-8 py-6 w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Set up in 2 minutes
          </p>
        </motion.div>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Map & Card Recommendations</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why SwipeRight?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Make every swipe count with intelligent, personalized recommendations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Maximize Your Rewards?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of smart spenders already optimizing their credit card rewards
          </p>
          <Button 
            onClick={() => loginWithRedirect()}
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
          >
            Start Optimizing Now
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 SwipeRight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

