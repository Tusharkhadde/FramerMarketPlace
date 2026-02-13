import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Leaf,
  ArrowRight,
  Loader2,
  Tractor,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { SparklesCore } from '@/components/aceternity/sparkles'
import { cn } from '@/lib/utils'

// Validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setLoginError('')

    try {
      const result = await signIn(data.email, data.password)

      if (result.success) {
        toast.success(`Welcome back, ${result.user.fullName}!`, {
          description: `Logged in as ${result.user.userType}`,
        })

        // Role-based redirect
        const redirectMap = {
          farmer: '/farmer/dashboard',
          admin: '/admin/dashboard',
          buyer: from === '/' ? '/products' : from,
        }

        navigate(redirectMap[result.user.userType] || '/', { replace: true })
      } else {
        setLoginError(result.error || 'Invalid email or password')
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      setLoginError('Something went wrong. Please try again.')
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo accounts for testing
  const demoAccounts = [
    { email: 'farmer@demo.com', password: 'demo123', type: 'farmer', icon: Tractor },
    { email: 'buyer@demo.com', password: 'demo123', type: 'buyer', icon: ShoppingBag },
    { email: 'admin@demo.com', password: 'admin123', type: 'admin', icon: ShieldCheck },
  ]

  const fillDemoAccount = (account) => {
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    if (emailInput) emailInput.value = account.email
    if (passwordInput) passwordInput.value = account.password
    // Trigger form validation
    const event = new Event('input', { bubbles: true })
    emailInput?.dispatchEvent(event)
    passwordInput?.dispatchEvent(event)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
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

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Error */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{loginError}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Please check your credentials and try again
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-farmer-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn(
                    'pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all',
                    errors.email && 'border-red-500 focus:ring-red-500'
                  )}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-farmer-600 hover:text-farmer-700 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-farmer-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn(
                    'pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all',
                    errors.password && 'border-red-500 focus:ring-red-500'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="farmer"
              className="w-full h-12 text-base shadow-lg shadow-farmer-500/30 hover:shadow-farmer-500/40 transition-shadow"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Demo Accounts
              </span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.type}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="group p-3 border border-gray-200 rounded-xl hover:border-farmer-300 hover:bg-farmer-50 transition-all text-center"
              >
                <account.icon className="w-5 h-5 text-gray-400 group-hover:text-farmer-600 mx-auto mb-1.5 transition-colors" />
                <span className="text-xs font-medium text-gray-600 capitalize group-hover:text-farmer-700">
                  {account.type}
                </span>
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-farmer-600 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-farmer-600 via-farmer-700 to-farmer-900 relative overflow-hidden">
        {/* Sparkle Effect */}
        <div className="absolute inset-0">
          <SparklesCore
            id="login-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={30}
            particleColor="#ffffff"
            className="w-full h-full"
          />
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-lg text-center"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-8xl mb-8"
            >
              🌾
            </motion.div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Connect with{' '}
              <span className="text-farmer-200">Maharashtra's</span>
              <br />
              finest farmers
            </h2>

            <p className="text-lg text-farmer-100 mb-10 leading-relaxed">
              Join our growing community of 500+ farmers and 10,000+ buyers
              across 36 districts.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Tractor,
                  title: 'For Farmers',
                  desc: 'Sell directly to buyers, get fair prices',
                },
                {
                  icon: ShoppingBag,
                  title: 'For Buyers',
                  desc: 'Fresh produce delivered to your doorstep',
                },
                {
                  icon: Sparkles,
                  title: 'AI Powered',
                  desc: 'Smart price predictions & crop recommendations',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.15 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-farmer-200">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login