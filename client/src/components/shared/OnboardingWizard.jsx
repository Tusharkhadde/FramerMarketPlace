import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, X, Phone, MapPin, Home, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import api from '@/config/api'

const OnboardingWizard = () => {
  const { user, checkAuth } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    userType: user?.userType || 'buyer',
    phone: user?.phone || '',
    district: user?.district || '',
    taluka: user?.taluka || '',
    village: user?.village || '',
    addressLine1: '',
    city: '',
    pincode: ''
  })

  useEffect(() => {
    // Only show if user is logged in and missing phone number
    if (user && !user.phone) {
      // Only show for NEW users (created within the last 24 hours)
      const userCreatedTime = new Date(user.createdAt || Date.now()).getTime()
      const isNewUser = Date.now() - userCreatedTime < 24 * 60 * 60 * 1000
      
      const hasSeen = localStorage.getItem(`hasSeenOnboarding_${user._id}`)
      if (isNewUser && !hasSeen) {
        setIsOpen(true)
      }
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleDismiss = () => {
    localStorage.setItem(`hasSeenOnboarding_${user._id}`, 'true')
    setIsOpen(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // 1. Update Profile (Phone, UserType, Location)
      await api.put('/users/profile', {
        phone: formData.phone,
        userType: formData.userType,
        district: formData.district,
        taluka: formData.taluka,
        village: formData.village,
      })

      // 2. Add Address if buyer provided one
      if (formData.userType === 'buyer' && formData.addressLine1 && formData.city) {
        await api.post('/users/addresses', {
          label: 'Home',
          fullName: user.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          city: formData.city,
          district: formData.district,
          pincode: formData.pincode,
          isDefault: true
        })
      }

      await checkAuth() // Refresh user context
      toast.success('Profile updated successfully! 🎉')
      handleDismiss()
      
      // If they changed to farmer, redirect to farmer dashboard
      if (formData.userType === 'farmer' && user.userType !== 'farmer') {
        window.location.href = '/farmer/dashboard'
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-500" />
              Welcome to FarmMarket!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Let's complete your profile</p>
          </div>
          <button onClick={handleDismiss} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">1. Confirm Your Role</h3>
                <p className="text-sm text-muted-foreground mb-4">Google Sign-in sets you as a Buyer by default. What would you like to do on FarmMarket?</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, userType: 'buyer' })}
                    className={`p-4 rounded-xl border-2 transition-all ${formData.userType === 'buyer' ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-white/20'}`}
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="font-semibold">I want to Buy</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, userType: 'farmer' })}
                    className={`p-4 rounded-xl border-2 transition-all ${formData.userType === 'farmer' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:border-white/20'}`}
                  >
                    <div className="text-2xl mb-2">🧑‍🌾</div>
                    <div className="font-semibold">I want to Sell</div>
                  </button>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">2. Contact Information</h3>
                <p className="text-sm text-muted-foreground mb-4">We need your phone number to coordinate orders and deliveries.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="10-digit mobile number" 
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={nextStep} disabled={formData.phone.length < 10} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && formData.userType === 'farmer' && (
              <motion.div
                key="step3-farmer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">3. Farm Location</h3>
                <p className="text-sm text-muted-foreground mb-4">Buyers love to know where their food comes from.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">District *</label>
                    <Input 
                      placeholder="e.g. Pune" 
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taluka</label>
                    <Input 
                      placeholder="e.g. Haveli" 
                      value={formData.taluka}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Village</label>
                  <Input 
                    placeholder="Your village name" 
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={handleSave} disabled={loading || !formData.district} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {loading ? 'Saving...' : 'Complete Profile'} <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && formData.userType === 'buyer' && (
              <motion.div
                key="step3-buyer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">3. Default Delivery Address</h3>
                <p className="text-sm text-muted-foreground mb-4">Where should we deliver your fresh produce? (Optional)</p>
                
                <div className="space-y-4">
                  <Input 
                    placeholder="Address Line 1 (House No, Street)" 
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="City" 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <Input 
                      placeholder="District" 
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                  <Input 
                    placeholder="Pincode" 
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {loading ? 'Saving...' : 'Complete Profile'} <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Progress indicator */}
        <div className="bg-muted/50 p-4 border-t flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-emerald-500' : step > i ? 'w-4 bg-emerald-500/50' : 'w-4 bg-border'}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default OnboardingWizard
