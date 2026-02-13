import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  Tractor,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SparklesCore } from '@/components/aceternity/sparkles'
import { cn } from '@/lib/utils'
import FarmerSignupForm from '@/components/auth/FarmerSignupForm'
import BuyerSignupForm from '@/components/auth/BuyerSignupForm'

const Register = () => {
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || ''
  const [selectedRole, setSelectedRole] = useState(initialType)
  const navigate = useNavigate()

  const roles = [
    {
      id: 'buyer',
      title: "I'm a Buyer",
      subtitle: 'Buy fresh produce directly from farmers',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      features: [
        'Browse 2000+ products',
        'Direct farm-to-table delivery',
        'AI-powered recommendations',
        'Secure online payments',
      ],
      emoji: '🛒',
    },
    {
      id: 'farmer',
      title: "I'm a Farmer",
      subtitle: 'Sell your produce directly to buyers',
      icon: Tractor,
      color: 'from-farmer-500 to-farmer-600',
      bgColor: 'bg-farmer-50',
      borderColor: 'border-farmer-500',
      features: [
        'List unlimited products',
        'AI price predictions',
        'Access to APMC data',
        'Direct buyer connections',
      ],
      emoji: '🧑‍🌾',
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-12 h-12 bg-gradient-to-br from-farmer-500 to-farmer-700 rounded-xl flex items-center justify-center shadow-lg shadow-farmer-500/30"
            >
              <Leaf className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-farmer-600 to-farmer-800 bg-clip-text text-transparent">
                FarmMarket
              </span>
              <p className="text-xs text-gray-500 -mt-1">Maharashtra</p>
            </div>
          </Link>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {!selectedRole && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Join FarmMarket 🌾
                  </h1>
                  <p className="text-gray-500 text-lg">
                    How would you like to use the platform?
                  </p>
                </div>

                <div className="space-y-4">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          'w-full group p-6 border-2 rounded-2xl hover:shadow-lg transition-all duration-300 text-left',
                          'hover:border-farmer-500 hover:bg-gradient-to-r hover:from-farmer-50 hover:to-white'
                        )}
                      >
                        <div className="flex items-start gap-5">
                          {/* Icon */}
                          <div
                            className={cn(
                              'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110',
                              role.bgColor
                            )}
                          >
                            {role.emoji}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {role.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-3">
                              {role.subtitle}
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-2">
                              {role.features.map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 text-xs text-gray-600"
                                >
                                  <div className="w-1.5 h-1.5 bg-farmer-500 rounded-full" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-farmer-600 group-hover:translate-x-1 transition-all mt-2" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600 mt-8">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-farmer-600 font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Registration Forms */}
            {selectedRole === 'buyer' && (
              <motion.div
                key="buyer-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => setSelectedRole('')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change role
                </button>
                <BuyerSignupForm />
              </motion.div>
            )}

            {selectedRole === 'farmer' && (
              <motion.div
                key="farmer-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => setSelectedRole('')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change role
                </button>
                <FarmerSignupForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-farmer-600 via-farmer-700 to-farmer-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <SparklesCore
            id="register-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={30}
            particleColor="#ffffff"
            className="w-full h-full"
          />
        </div>

        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-lg text-center"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-8xl mb-8"
            >
              {selectedRole === 'farmer'
                ? '🧑‍🌾'
                : selectedRole === 'buyer'
                ? '🛒'
                : '🌾'}
            </motion.div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              {selectedRole === 'farmer'
                ? 'Start selling your produce today'
                : selectedRole === 'buyer'
                ? 'Get fresh produce at your doorstep'
                : 'Join our growing community'}
            </h2>

            <p className="text-lg text-farmer-100 mb-10 leading-relaxed">
              {selectedRole === 'farmer'
                ? 'Connect with thousands of buyers across Maharashtra. Set your own prices and grow your business.'
                : selectedRole === 'buyer'
                ? 'Browse fresh products from verified farmers. Pay securely and get quality produce.'
                : 'Over 500 farmers and 10,000 buyers trust FarmMarket for fresh agricultural produce.'}
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '500+', label: 'Farmers' },
                { value: '10K+', label: 'Happy Buyers' },
                { value: '36', label: 'Districts' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.15 }}
                  className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-farmer-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register