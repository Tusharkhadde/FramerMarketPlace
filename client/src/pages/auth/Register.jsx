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
    <div className="min-h-screen bg-black text-white grid-bg flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Step 1: Role Selection */}
        {!selectedRole && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Which best describes you?
              </h1>
              <p className="text-gray-400 text-lg">
                Select your role to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => setSelectedRole(role.id)}
                    className="w-full group relative aspect-[4/3] md:aspect-square overflow-hidden rounded-[2rem] bg-[#0d0d0d] border border-white/5 hover:border-emerald-500/50 transition-all duration-300"
                  >
                    {/* Illustration Container */}
                    <div className="absolute inset-0 flex items-center justify-center p-12 pb-24">
                      <img 
                        src={`/images/auth/${role.id}.png`} 
                        alt={role.title}
                        className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {role.id === 'buyer' ? "I'm a Buyer" : "I'm a Farmer"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {role.id === 'buyer' ? "Shop fresh from the farm" : "Trade your produce directly"}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Login Link */}
            <div className="text-center mt-12 text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}

        {/* Step 2: Registration Forms */}
        {selectedRole && (
          <motion.div
            key="form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-[#0d0d0d] p-8 rounded-3xl border border-white/5"
          >
            <button
              onClick={() => setSelectedRole('')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {selectedRole === 'buyer' ? <BuyerSignupForm /> : <FarmerSignupForm />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register