import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Bell, Lock, Palette, ShieldAlert, MapPin,
  Save, Loader2, Eye, EyeOff, Phone, Globe,
  CheckCircle2, Moon, Sun, Monitor, Package, CreditCard,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/config/api'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'profile',       label: 'Profile',         icon: User },
  { id: 'addresses',     label: 'Addresses',        icon: MapPin },
  { id: 'notifications', label: 'Notifications',    icon: Bell },
  { id: 'security',      label: 'Security',         icon: Lock },
  { id: 'appearance',    label: 'Appearance',       icon: Palette },
  { id: 'danger',        label: 'Danger Zone',      icon: ShieldAlert, danger: true },
]

const SectionCard = ({ title, description, icon: Icon, danger, children }) => (
  <Card className={cn('border', danger && 'border-red-200 bg-red-50/20')}>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', danger ? 'bg-red-100' : 'bg-blue-50')}>
          <Icon className={cn('w-4 h-4', danger ? 'text-red-600' : 'text-blue-600')} />
        </div>
        <div>
          <CardTitle className={cn('text-base', danger && 'text-red-700')}>{title}</CardTitle>
          {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const ToggleRow = ({ label, description, checked, onCheckedChange, badge, disabled }) => (
  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 border-b last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{label}</p>
        {badge && <Badge variant="outline" className="text-[10px] py-0">{badge}</Badge>}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
  </div>
)

const BuyerSettings = () => {
  const { user, updateProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: 'home', fullName: '', phone: '', addressLine1: '',
    addressLine2: '', city: '', district: '', pincode: '',
  })
  const [savingAddress, setSavingAddress] = useState(false)

  // Password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwSaving, setPwSaving] = useState(false)

  // Notifications
  const [notif, setNotif] = useState({
    emailOrders: true,
    emailDeals: true,
    emailNewProducts: false,
    pushOrders: true,
    smsDelivery: false,
  })

  // Appearance
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deactivating, setDeactivating] = useState(false)

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await updateProfile(profileForm)
      setProfileSaved(true)
      toast.success('Profile updated successfully')
      setTimeout(() => setProfileSaved(false), 2500)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setSavingAddress(true)
    try {
      await api.post('/users/address', newAddress)
      toast.success('Address saved!')
      setNewAddress({ label: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', pincode: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
    } finally {
      setSavingAddress(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setPwSaving(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Email does not match')
      return
    }
    setDeactivating(true)
    try {
      await api.delete('/users/account')
      toast.success('Account deactivated')
      await signOut()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate')
    } finally {
      setDeactivating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {

      case 'profile':
        return (
          <div className="space-y-6">
            {/* Account summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-blue-900">{user?.fullName}</p>
                  <p className="text-sm text-blue-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize text-blue-700 border-blue-200 bg-card">
                  {user?.userType}
                </Badge>
                {user?.isVerified && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <SectionCard title="Personal Information" description="Update your account details" icon={User}>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Your full name"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="10-digit mobile number"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={profileSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                    {profileSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                    ) : profileSaved ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                  {user?.authProvider === 'google' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" className="flex-shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Signed in with Google
                    </p>
                  )}
                </div>
              </form>
            </SectionCard>
          </div>
        )

      case 'addresses':
        return (
          <div className="space-y-6">
            {/* Existing addresses */}
            {user?.addresses?.length > 0 ? (
              <SectionCard title="Saved Addresses" description="Your delivery locations" icon={MapPin}>
                <div className="space-y-3">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{addr.label}</Badge>
                          {addr.isDefault && <Badge className="text-xs bg-blue-100 text-blue-700 border-none">Default</Badge>}
                        </div>
                        <p className="text-sm font-medium">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                        <p className="text-sm text-muted-foreground">{addr.city ? `${addr.city}, ` : ''}{addr.district}, {addr.state} – {addr.pincode}</p>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No saved addresses yet</p>
              </div>
            )}

            {/* Add new address */}
            <SectionCard title="Add New Address" description="Save a delivery address for faster checkout" icon={MapPin}>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Select value={newAddress.label} onValueChange={(v) => setNewAddress({ ...newAddress, label: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">🏠 Home</SelectItem>
                        <SelectItem value="work">💼 Work</SelectItem>
                        <SelectItem value="other">📍 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contact Name</Label>
                    <Input placeholder="Full name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="Contact number" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input placeholder="House No., Street, Area" value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="Landmark, nearby area" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>District</Label>
                    <Input placeholder="District" value={newAddress.district} onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input placeholder="6-digit PIN" maxLength={6} value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" disabled={savingAddress} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                  {savingAddress ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><MapPin className="w-4 h-4 mr-2" /> Save Address</>}
                </Button>
              </form>
            </SectionCard>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <SectionCard title="Email Notifications" description="Control what we send to your inbox" icon={Bell}>
              <ToggleRow label="Order Updates" description="Shipping, delivery, and return status" checked={notif.emailOrders} onCheckedChange={(v) => setNotif({ ...notif, emailOrders: v })} />
              <ToggleRow label="Deals & Offers" description="Exclusive discounts and seasonal sale alerts" checked={notif.emailDeals} onCheckedChange={(v) => setNotif({ ...notif, emailDeals: v })} />
              <ToggleRow label="New Products" description="Fresh produce alerts from your favourite farmers" checked={notif.emailNewProducts} onCheckedChange={(v) => setNotif({ ...notif, emailNewProducts: v })} />
            </SectionCard>
            <SectionCard title="Push & SMS" description="Real-time alerts on your device" icon={Phone}>
              <ToggleRow label="Push Notifications" description="In-browser alerts for your orders" checked={notif.pushOrders} onCheckedChange={(v) => setNotif({ ...notif, pushOrders: v })} />
              <ToggleRow label="SMS Delivery Updates" description="Text alerts for out-for-delivery status" checked={notif.smsDelivery} onCheckedChange={(v) => setNotif({ ...notif, smsDelivery: v })} badge="Pro" disabled />
            </SectionCard>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={() => toast.success('Preferences saved')}>
              <Save className="w-4 h-4" /> Save Preferences
            </Button>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            {user?.authProvider === 'google' ? (
              <SectionCard title="Google Account" description="Your account uses Google for authentication" icon={Lock}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Signed in with Google</p>
                    <p className="text-xs text-blue-600">Manage your password at myaccount.google.com</p>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <SectionCard title="Change Password" description="Use a strong, unique password" icon={Lock}>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Your current password', showKey: 'current' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters', showKey: 'new' },
                    { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password', showKey: 'confirm' },
                  ].map(({ key, label, placeholder, showKey }) => (
                    <div key={key} className="space-y-1.5">
                      <Label>{label}</Label>
                      <div className="relative">
                        <Input
                          type={showPw[showKey] ? 'text' : 'password'}
                          placeholder={placeholder}
                          className="pr-10"
                          value={pwForm[key]}
                          onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw({ ...showPw, [showKey]: !showPw[showKey] })}>
                          {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button type="submit" disabled={pwSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[160px]">
                    {pwSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</> : <><Lock className="w-4 h-4 mr-2" /> Update Password</>}
                  </Button>
                </form>
              </SectionCard>
            )}

            <SectionCard title="Active Sessions" description="Manage where you're logged in" icon={Globe}>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div>
                  <p className="text-sm font-medium">Current session</p>
                  <p className="text-xs text-muted-foreground">This browser · {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-4 text-red-600 border-red-200 hover:bg-red-50" onClick={() => { signOut(); toast.info('Signed out of all sessions') }}>
                Sign Out All Sessions
              </Button>
            </SectionCard>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <SectionCard title="Theme" description="Choose your preferred color mode" icon={Palette}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setTheme(id); toast.success(`Theme set to ${label}`) }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      theme === id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-border bg-card hover:border-blue-200'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Language" description="Choose your preferred language" icon={Globe}>
              <div className="max-w-xs">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="mr">🇮🇳 Marathi (मराठी)</SelectItem>
                    <SelectItem value="hi">🇮🇳 Hindi (हिन्दी)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={() => toast.success('Preferences saved')}>
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </SectionCard>
          </div>
        )

      case 'danger':
        return (
          <div className="space-y-6">
            <SectionCard title="Deactivate Account" description="Temporarily disable your buyer account" icon={ShieldAlert} danger>
              <p className="text-sm text-muted-foreground mb-4">
                Deactivating hides your account and cancels pending orders. You can reactivate by signing in again.
              </p>
              <div className="space-y-3">
                <Label>Type your email <span className="font-bold text-foreground">{user?.email}</span> to confirm</Label>
                <Input
                  placeholder={user?.email}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== user?.email || deactivating}
                  onClick={handleDeactivate}
                  className="flex items-center gap-2"
                >
                  {deactivating ? <><Loader2 className="w-4 h-4 animate-spin" /> Deactivating…</> : <><ShieldAlert className="w-4 h-4" /> Deactivate Account</>}
                </Button>
              </div>
            </SectionCard>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, addresses, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon, danger }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left',
                  activeTab === id
                    ? danger ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                    : danger ? 'text-red-500 hover:bg-red-50' : 'text-muted-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}

export default BuyerSettings
