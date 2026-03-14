import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Home, Ruler,
  Camera, Save, Loader2, Shield, Edit2,
  CreditCard, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'

const districts = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
]

const FarmerProfile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      district: user?.district || '',
      taluka: user?.taluka || '',
      village: user?.village || '',
      farmSize: user?.farmSize || '',
      farmAddress: user?.farmAddress || '',
      accountHolderName: user?.bankDetails?.accountHolderName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      ifscCode: user?.bankDetails?.ifscCode || '',
      bankName: user?.bankDetails?.bankName || '',
    },
  })

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const result = await updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        district: data.district,
        taluka: data.taluka,
        village: data.village,
        farmSize: parseFloat(data.farmSize) || undefined,
        farmAddress: data.farmAddress,
        bankDetails: {
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName,
        },
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-farmer-100 text-farmer-700 text-3xl">
                  {getInitials(user?.fullName || 'F')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-farmer-500 text-white rounded-full flex items-center justify-center hover:bg-farmer-600 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                {user?.isVerified ? (
                  <Badge className="bg-green-100 text-green-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    Pending Verification
                  </Badge>
                )}
              </div>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                {user?.village && `${user.village}, `}
                {user?.taluka && `${user.taluka}, `}
                {user?.district}, Maharashtra
              </p>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'farmer'}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="farm">
              <Home className="w-4 h-4 mr-2" />
              Farm Details
            </TabsTrigger>
            <TabsTrigger value="bank">
              <CreditCard className="w-4 h-4 mr-2" />
              Bank Details
            </TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      {...register('fullName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (cannot change)</Label>
                    <Input
                      {...register('email')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      {...register('phone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farm Details */}
          <TabsContent value="farm">
            <Card>
              <CardHeader>
                <CardTitle>Farm Details</CardTitle>
                <CardDescription>Your farm location and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Select
                      value={watch('district')}
                      onValueChange={v => setValue('district', v)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Taluka</Label>
                    <Input {...register('taluka')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Village</Label>
                    <Input {...register('village')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Farm Size (Acres)</Label>
                    <Input type="number" step="0.1" {...register('farmSize')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Farm Address</Label>
                  <Textarea {...register('farmAddress')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Details */}
          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>For receiving payments (kept secure & private)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input {...register('accountHolderName')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input {...register('accountNumber')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input {...register('ifscCode')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input {...register('bankName')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="farmer" disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

export default FarmerProfile