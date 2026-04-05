import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ChronicleButton } from '@/components/chronicle-button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const buyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z.string().email('Please enter a valid email'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password is too long'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const BuyerSignupForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const password = watch('password')
  const agreeTerms = watch('agreeTerms')

  const passwordChecks = [
    { text: 'At least 6 characters', valid: password?.length >= 6 },
    { text: 'Contains a number', valid: /\d/.test(password || '') },
    { text: 'Contains a letter', valid: /[a-zA-Z]/.test(password || '') },
  ]

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userType: 'buyer',
      }

      const result = await signUp(userData)

      if (result.success) {
        toast.success('Account created successfully! 🎉', {
          description: 'Welcome to FarmMarket',
        })
        navigate('/products', { replace: true })
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Buyer Account
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Create Buyer Account</h2>
        <p className="text-muted-foreground text-sm mt-1">Start shopping fresh produce from local farmers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-gray-200">Full Name *</Label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-farmer-500 transition-colors" />
            <Input
              id="fullName"
              placeholder="Your full name"
              className={cn('pl-11 h-11', errors.fullName && 'border-red-500')}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-200">Email Address *</Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-farmer-500 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn('pl-11 h-11', errors.email && 'border-red-500')}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-gray-200">Phone Number *</Label>
          <div className="relative group">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-farmer-500 transition-colors" />
            <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r border-border pr-2">
              +91
            </div>
            <Input
              id="phone"
              placeholder="9876543210"
              maxLength={10}
              className={cn('pl-[4.5rem] h-11', errors.phone && 'border-red-500')}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-200">Password *</Label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-farmer-500 transition-colors" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={cn('pl-11 pr-11 h-11', errors.password && 'border-red-500')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-farmer-600"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {/* Password Strength */}
          {password && (
            <div className="flex gap-2 mt-2">
              {passwordChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={cn('flex items-center gap-1 text-xs', check.valid ? 'text-green-600' : 'text-muted-foreground')}
                >
                  <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center', check.valid ? 'bg-green-500' : 'bg-muted')}>
                    {check.valid && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {check.text}
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password *</Label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-farmer-500 transition-colors" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className={cn('pl-11 pr-11 h-11', errors.confirmPassword && 'border-red-500')}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="agreeTerms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setValue('agreeTerms', checked)}
            className="mt-0.5"
          />
          <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
            I agree to the{' '}
            <Link to="/terms" className="text-farmer-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-farmer-600 hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.agreeTerms.message}
          </p>
        )}

        {/* Submit */}
        <ChronicleButton type="submit" customBackground="var(--farmer-600)" customForeground="#fff" hoverColor="#7c4df0" width="100%" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Buyer Account
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </ChronicleButton>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-farmer-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default BuyerSignupForm