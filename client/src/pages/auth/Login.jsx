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
  email: z.string().min(1, 'Please enter a valid email or username'),
  password: z.string().min(1, 'Please enter your password'),
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
    { email: 'admin', password: 'admin', type: 'admin', icon: ShieldCheck },
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
    <div className="min-h-screen flex bg-black overflow-hidden grid-bg">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/5"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <Leaf className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                FarmMarket
              </span>
              <p className="text-xs text-muted-foreground -mt-1">Maharashtra</p>
            </div>
          </Link>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
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
                className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">{loginError}</p>
                  <p className="text-xs text-red-500/60 mt-1">
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email or Username
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com or admin"
                  className={cn(
                    'pl-11 h-12 bg-card/5 border-white/10 focus:bg-card/10 focus:border-emerald-500/50 text-white transition-all',
                    errors.email && 'border-red-500/50 focus:ring-red-500/50'
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
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn(
                    'pl-11 pr-11 h-12 bg-card/5 border-white/10 focus:bg-card/10 focus:border-emerald-500/50 text-white transition-all',
                    errors.password && 'border-red-500/50 focus:ring-red-500/50'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
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
              variant="default"
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-foreground font-bold shadow-lg shadow-emerald-500/20 transition-all"
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

          {/* Google Sign-In */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-muted-foreground">or</span>
            </div>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-card/5 border border-white/10 hover:bg-card/10 hover:border-white/20 transition-all text-white font-medium text-sm"
          >
            {/* Google G logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          {/* Divider for Demo Accounts */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-muted-foreground">Demo Accounts</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.type}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="group p-3 border border-border rounded-xl hover:border-farmer-300 hover:bg-farmer-50 transition-all text-center"
              >
                <account.icon className="w-5 h-5 text-muted-foreground group-hover:text-farmer-600 mx-auto mb-1.5 transition-colors" />
                <span className="text-xs font-medium text-muted-foreground capitalize group-hover:text-farmer-700">
                  {account.type}
                </span>
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-emerald-500 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-900 via-[#050505] to-black relative overflow-hidden">
        {/* Sparkle Effect */}
        <div className="absolute inset-0">
          <SparklesCore
            id="login-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={40}
            particleColor="#10b981"
            className="w-full h-full"
          />
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

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
              <span className="text-emerald-400">Maharashtra's</span>
              <br />
              finest farmers
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
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
                  className="flex items-center gap-4 bg-card/5 backdrop-blur-sm rounded-2xl p-4 text-left border border-white/5"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
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