import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Tractor,
  MapPin,
  Home,
  Ruler,
  Check,
  AlertCircle,
  Leaf,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ChronicleButton } from '@/components/chronicle-button'

// Districts
const districts = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
]

// Validation
const step1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit phone number'),
})

const step2Schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const step3Schema = z.object({
  district: z.string().min(1, 'Please select a district'),
  taluka: z.string().optional(),
  village: z.string().optional(),
  farmSize: z.string().optional(),
  mainCrops: z.array(z.string()).optional(),
})

const FarmerSignupForm = () => {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [formData, setFormData] = useState({})
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 3

  const currentSchema =
    step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      district: '',
      taluka: '',
      village: '',
      farmSize: '',
    },
  })

  const password = watch('password')
  const district = watch('district')

  const passwordChecks = [
    { text: '6+ characters', valid: password?.length >= 6 },
    { text: 'A number', valid: /\d/.test(password || '') },
    { text: 'A letter', valid: /[a-zA-Z]/.test(password || '') },
  ]

  const handleNext = async () => {
    let fieldsToValidate = []
    if (step === 1) fieldsToValidate = ['fullName', 'email', 'phone']
    if (step === 2) fieldsToValidate = ['password', 'confirmPassword']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      // Save current step data
      const currentData = {}
      fieldsToValidate.forEach((field) => {
        currentData[field] = watch(field)
      })
      setFormData((prev) => ({ ...prev, ...currentData }))
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const onSubmit = async (data) => {
    if (!agreeTerms) {
      toast.error('Please accept terms and conditions')
      return
    }

    setIsLoading(true)
    try {
      const userData = {
        ...formData,
        ...data,
        userType: 'farmer',
        farmSize: data.farmSize ? parseFloat(data.farmSize) : undefined,
      }
      delete userData.confirmPassword

      const result = await signUp(userData)

      if (result.success) {
        toast.success('Farmer account created! 🎉', {
          description: 'Welcome to FarmMarket',
        })
        navigate('/farmer/dashboard', { replace: true })
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
          <div className="w-10 h-10 bg-farmer-100 rounded-xl flex items-center justify-center">
            <Tractor className="w-5 h-5 text-farmer-600" />
          </div>
          <Badge variant="outline" className="text-farmer-600 border-farmer-200">
            Farmer Account
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Create Farmer Account</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {step === 1 && 'Enter your personal details'}
          {step === 2 && 'Create a secure password'}
          {step === 3 && 'Tell us about your farm'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                idx + 1 < step
                  ? 'bg-farmer-500 text-white'
                  : idx + 1 === step
                  ? 'bg-farmer-500 text-white ring-4 ring-farmer-100'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {idx + 1 < step ? <Check className="w-4 h-4" /> : idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full',
                  idx + 1 < step ? 'bg-farmer-500' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
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
                  <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r border-gray-300 pr-2">
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

              <ChronicleButton type="button" onClick={handleNext} customBackground="var(--farmer-600)" customForeground="#fff" width="100%">
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </ChronicleButton>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
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
                {password && (
                  <div className="flex gap-3 mt-2">
                    {passwordChecks.map((check, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center gap-1 text-xs',
                              check.valid ? 'text-green-600' : 'text-muted-foreground'
                        )}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-farmer-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="button" variant="farmer" className="flex-1 h-12" onClick={handleNext}>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Farm Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* District */}
              <div className="space-y-1.5">
                <Label className="text-gray-200">District *</Label>
                <Select
                  onValueChange={(value) => setValue('district', value)}
                  value={district}
                >
                  <SelectTrigger className={cn('h-11 bg-card', errors.district && 'border-red-500')}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Select your district" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Taluka & Village */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="taluka" className="text-gray-200">Taluka</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-farmer-500" />
                    <Input id="taluka" placeholder="Your taluka" className="pl-10 h-11" {...register('taluka')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="village" className="text-gray-200">Village</Label>
                  <div className="relative group">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-farmer-500" />
                    <Input id="village" placeholder="Your village" className="pl-10 h-11" {...register('village')} />
                  </div>
                </div>
              </div>

              {/* Farm Size */}
              <div className="space-y-1.5">
                <Label htmlFor="farmSize" className="text-gray-200">Farm Size (Acres)</Label>
                <div className="relative group">
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-farmer-500" />
                  <Input id="farmSize" type="number" step="0.1" min="0" placeholder="e.g., 5" className="pl-10 h-11" {...register('farmSize')} />
                </div>
              </div>

              {/* Quick Crop Selection */}
              <div className="space-y-2">
                <Label className="text-gray-200">Main Crops (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {['Tomato', 'Onion', 'Potato', 'Grapes', 'Sugarcane', 'Wheat', 'Rice', 'Cotton', 'Soybean', 'Mango', 'Orange', 'Pomegranate'].map(
                    (crop) => (
                      <button
                        key={crop}
                        type="button"
                        className="px-3 py-1.5 text-xs border rounded-full hover:bg-farmer-50 hover:border-farmer-500 hover:text-farmer-700 transition-colors"
                      >
                        {crop}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-farmer-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Farmer Verification</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After signup, your account will be reviewed. You can start
                      listing products immediately, but verification helps build
                      buyer trust.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeTermsFarmer"
                  checked={agreeTerms}
                  onCheckedChange={setAgreeTerms}
                  className="mt-0.5"
                />
                <Label htmlFor="agreeTermsFarmer" className="text-sm text-muted-foreground cursor-pointer leading-tight">
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

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <ChronicleButton type="submit" customBackground="var(--farmer-600)" customForeground="#fff" width="100%" disabled={isLoading || !agreeTerms}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <Check className="w-5 h-5" />
                    </span>
                  )}
                </ChronicleButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default FarmerSignupForm