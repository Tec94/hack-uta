import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, MapPin, Sparkles, Shield, TrendingUp, Zap, Star, Award, Lock } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
            </div>
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

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Maximize Every{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Purchase
            </span>
            <br />
            with SwipeRight
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Stop leaving money on the table. Get instant, AI-powered credit card recommendations 
            based on your location and spending patterns. <span className="font-semibold text-primary">Make every swipe count.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => loginWithRedirect()}
              size="lg" 
              className="text-lg px-10 py-7 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Earning More
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-7 w-full sm:w-auto border-2 hover:bg-gray-50"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
            <div className="aspect-video bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="text-center relative z-10">
                <div className="flex justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <CreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <Sparkles className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
                <p className="text-gray-700 font-semibold text-lg">Interactive Map & Smart Recommendations</p>
                <p className="text-gray-500 text-sm mt-2">Real-time insights for every location</p>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const gradients = [
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600', 
              'from-pink-500 to-pink-600',
              'from-indigo-500 to-indigo-600'
            ]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${gradients[index]} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time: Get Premium Free for 3 Months</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Maximize Your Rewards?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto">
              Join thousands of smart spenders already earning 3x more with optimized card usage
            </p>
            <Button 
              onClick={() => loginWithRedirect()}
              size="lg" 
              variant="secondary" 
              className="text-lg px-10 py-7 hover:scale-105 transition-transform shadow-xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Earning More Today
            </Button>
            
            <div className="flex flex-wrap justify-center items-center gap-8 mt-10 text-sm">
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
      <footer className="container mx-auto px-4 py-12 border-t border-gray-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SwipeRight
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>&copy; 2024 SwipeRight. All rights reserved. Made with ❤️ for smart spenders.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

