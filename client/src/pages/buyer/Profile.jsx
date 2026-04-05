import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, 
  Plus, Trash2, Map,
  Loader2, Edit2, Save,
  X, Check, Building2,
  Home, Briefcase, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'
import userService from '@/services/user.service'

const BuyerProfile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isDeletingAddress, setIsDeletingAddress] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  // Address form
  const { 
    register: registerAddress, 
    handleSubmit: handleSubmitAddress,
    reset: resetAddress,
    formState: { errors: addressErrors } 
  } = useForm()

  const onProfileSubmit = async (data) => {
    setIsSaving(true)
    try {
      const result = await updateProfile({
        fullName: data.fullName,
        phone: data.phone,
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const onAddAddress = async (data) => {
    setIsSaving(true)
    try {
      const response = await userService.addAddress(data)
      if (response.data.success) {
        setAddresses(response.data.data.addresses)
        toast.success('Address added successfully!')
        setIsAddingAddress(false)
        resetAddress()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address')
    } finally {
      setIsSaving(false)
    }
  }

  const onDeleteAddress = async (addressId) => {
    setIsDeletingAddress(addressId)
    try {
      const response = await userService.deleteAddress(addressId)
      if (response.data.success) {
        setAddresses(response.data.data.addresses)
        toast.success('Address deleted successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address')
    } finally {
      setIsDeletingAddress(null)
    }
  }

  const onSetDefaultAddress = async (addressId) => {
    try {
      const response = await userService.setDefaultAddress(addressId)
      if (response.data.success) {
        setAddresses(response.data.data.addresses)
        toast.success('Default address updated')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update default address')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-emerald-600 text-white text-4xl font-bold">
                  {getInitials(user?.fullName || 'B')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-card text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-lg border border-emerald-100">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                  {user?.fullName}
                </h2>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 text-xs font-semibold self-center sm:self-auto">
                  Buyer Account
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="hidden sm:block text-gray-300">|</div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">{user?.phone || 'No phone added'}</span>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              className={cn(
                "w-full sm:w-auto transition-all duration-200",
                !isEditing && "bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg"
              )}
              onClick={() => {
                if (isEditing) reset()
                setIsEditing(!isEditing)
              }}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8 bg-muted/10 p-1 rounded-xl">
          <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all py-2.5">
            <User className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all py-2.5">
            <MapPin className="w-4 h-4 mr-2" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Personal Info */}
          <TabsContent value="personal">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                  <CardDescription>Update your basic contact details and account information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                        <Input
                          id="fullName"
                          {...register('fullName', { required: 'Name is required' })}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 transition-all duration-200",
                            !isEditing && "bg-background text-muted-foreground border-transparent cursor-not-allowed"
                          )}
                          placeholder="Your full name"
                        />
                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address (Read-only)</Label>
                        <Input
                          id="email"
                          {...register('email')}
                          disabled
                          className="h-11 bg-background text-muted-foreground border-transparent cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                        <Input
                          id="phone"
                          {...register('phone', {
                            required: 'Phone number is required',
                            pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian phone number' }
                          })}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 transition-all duration-200",
                            !isEditing && "bg-background text-muted-foreground border-transparent cursor-not-allowed"
                          )}
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-5 h-auto text-base font-semibold transition-all shadow-md hover:shadow-lg"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Address Management */}
          <TabsContent value="addresses">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Delivery Addresses</h3>
                  <p className="text-sm text-muted-foreground">Manage where you want your products delivered.</p>
                </div>
                {!isAddingAddress && (
                  <Button
                    onClick={() => setIsAddingAddress(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg h-auto py-2.5 px-4 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Address
                  </Button>
                )}
              </div>

              {isAddingAddress && (
                <Card className="border-2 border-emerald-100 bg-emerald-50/30 overflow-hidden shadow-md">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="text-lg">Add New Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmitAddress(onAddAddress)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Label</Label>
                          <select
                            {...registerAddress('label', { required: true })}
                            className="w-full h-11 px-3 rounded-md border border-border bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipient Name</Label>
                          <Input {...registerAddress('fullName', { required: true })} placeholder="Full name" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                          <Input {...registerAddress('phone', { required: true })} placeholder="10-digit number" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
                          <Input {...registerAddress('city', { required: true })} placeholder="City name" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</Label>
                          <Input {...registerAddress('pincode', { required: true })} placeholder="6-digit pincode" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">District</Label>
                          <Input {...registerAddress('district', { required: true })} placeholder="District" className="h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 1</Label>
                        <Input {...registerAddress('addressLine1', { required: true })} placeholder="Flat, House no., Building, Company, Apartment" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 2 (Optional)</Label>
                        <Input {...registerAddress('addressLine2')} placeholder="Area, Colony, Street, Sector, Village" className="h-11" />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAddingAddress(false)} className="h-11 px-6">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-8 shadow-md">
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <Card
                      key={address._id}
                      className={cn(
                        "relative group transition-all duration-300 border-2 overflow-hidden",
                        address.isDefault
                          ? "border-emerald-500 bg-emerald-50/20 shadow-md"
                          : "border-gray-100 hover:border-emerald-200 hover:shadow-lg"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2.5 rounded-xl",
                              address.isDefault ? "bg-emerald-500 text-white shadow-lg" : "bg-muted/10 text-muted-foreground"
                            )}>
                              {address.label === 'home' && <Home className="w-5 h-5" />}
                              {address.label === 'work' && <Briefcase className="w-5 h-5" />}
                              {address.label === 'other' && <Globe className="w-5 h-5" />}
                            </div>
                            <h4 className="font-bold text-foreground capitalize tracking-tight">{address.label}</h4>
                          </div>
                          {address.isDefault && (
                            <Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              Default
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-base font-bold text-foreground mb-1">{address.fullName}</p>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.district}, {address.state} - {address.pincode}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              {address.phone}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            {!address.isDefault ? (
                              <button
                                onClick={() => onSetDefaultAddress(address._id)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span className="text-xs font-extrabold uppercase tracking-widest">Primary Address</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isDeletingAddress === address._id}
                                onClick={() => onDeleteAddress(address._id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                {isDeletingAddress === address._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-background rounded-3xl border-2 border-dashed border-border">
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                      <MapPin className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No addresses found</h3>
                    <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Please add a delivery address to ensure faster checkout and accurate deliveries.</p>
                    <Button
                      onClick={() => setIsAddingAddress(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Address
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

export default BuyerProfile
