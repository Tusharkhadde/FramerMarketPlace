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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Profile Header with Cover Photo */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-xl border border-border/50 bg-card mb-12">
        {/* Cover Photo Background */}
        <div 
          className="h-48 md:h-64 w-full bg-cover bg-center relative" 
          style={{ backgroundImage: 'url("/images/profile-cover.png")' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <button className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold flex items-center transition-colors border border-white/20">
            <Camera className="w-4 h-4 mr-2" /> Update Cover
          </button>
        </div>

        {/* Profile Content Overlay (Below the image) */}
        <div className="px-6 md:px-10 pb-8 relative z-10 bg-card border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-4 md:mb-0">
            {/* Avatar over the line */}
            <div className="relative group shrink-0">
              <Avatar className="w-32 h-32 border-4 border-card ring-1 ring-border shadow-2xl bg-muted">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-gradient-to-br from-farmer-400 to-farmer-600 text-white text-4xl font-black">
                  {getInitials(user?.fullName || 'F')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-farmer-500 text-white rounded-full flex items-center justify-center hover:bg-farmer-600 transition-all shadow-xl hover:scale-110 border-2 border-background">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Info Text */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row items-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-black text-foreground tracking-tight">{user?.fullName}</h2>
                {user?.isVerified ? (
                  <Badge className="bg-green-500/10 text-green-600 border-none px-3 py-1 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5 mr-1.5" /> Verified Farmer
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-none px-3 py-1 font-bold text-xs">
                    Pending Verification
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5" /> {user?.email}</span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> 
                  {user?.village && `${user.village}, `}
                  {user?.taluka && `${user.taluka}, `}
                  {user?.district}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="shrink-0 mt-4 md:mt-0 pb-2">
              <Button
                variant={isEditing ? 'outline' : 'farmer'}
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-full shadow-lg px-6 font-semibold"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center md:justify-start mb-8">
            <TabsList className="bg-muted/50 p-1.5 rounded-full border border-border/50 inline-flex shadow-sm">
              <TabsTrigger value="personal" className="rounded-full px-6 py-2.5 data-[state=active]:bg-farmer-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium">
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="farm" className="rounded-full px-6 py-2.5 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium">
                <Home className="w-4 h-4 mr-2" />
                Farm Details
              </TabsTrigger>
              <TabsTrigger value="bank" className="rounded-full px-6 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium">
                <CreditCard className="w-4 h-4 mr-2" />
                Bank Details
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Personal Info */}
          <TabsContent value="personal" className="focus-visible:ring-0 focus-visible:outline-none">
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-farmer-400 to-farmer-600" />
              <CardHeader className="border-b border-border/30 bg-muted/10 p-6 md:p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6 text-farmer-500" /> Personal Information
                </CardTitle>
                <CardDescription className="text-base">Your basic contact details and identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      {...register('fullName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-background' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (cannot change)</Label>
                    <Input
                      {...register('email')}
                      disabled
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      {...register('phone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-background' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farm Details */}
          <TabsContent value="farm" className="focus-visible:ring-0 focus-visible:outline-none">
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-green-400 to-green-600" />
              <CardHeader className="border-b border-border/30 bg-muted/10 p-6 md:p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Home className="w-6 h-6 text-green-500" /> Farm Details
                </CardTitle>
                <CardDescription className="text-base">Your farm location, size, and specifics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Select
                      value={watch('district')}
                      onValueChange={v => setValue('district', v)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-background' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Taluka</Label>
                    <Input {...register('taluka')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Village</Label>
                    <Input {...register('village')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Farm Size (Acres)</Label>
                    <Input type="number" step="0.1" {...register('farmSize')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Farm Address</Label>
                  <Textarea {...register('farmAddress')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Details */}
          <TabsContent value="bank" className="focus-visible:ring-0 focus-visible:outline-none">
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
              <CardHeader className="border-b border-border/30 bg-muted/10 p-6 md:p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-500" /> Bank Details
                </CardTitle>
                <CardDescription className="text-base">Private routing information for your payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input {...register('accountHolderName')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input {...register('accountNumber')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input {...register('ifscCode')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input {...register('bankName')} disabled={!isEditing} className={!isEditing ? 'bg-background' : ''} />
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