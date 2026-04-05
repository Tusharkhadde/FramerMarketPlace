import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Bell, Lock, Palette, ShieldAlert,
  Save, Loader2, Eye, EyeOff, ArrowRight,
  Mail, Phone, MapPin, Globe, CheckCircle2, Moon, Sun, Monitor,
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

// Nav tabs for the settings sidebar
const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'security',      label: 'Security',        icon: Lock },
  { id: 'appearance',    label: 'Appearance',      icon: Palette },
  { id: 'danger',        label: 'Danger Zone',     icon: ShieldAlert, danger: true },
]

// ─── Reusable section card ────────────────────────────────────────────────────
const SectionCard = ({ title, description, icon: Icon, danger, children }) => (
  <Card className={cn('border', danger && 'border-red-200 bg-red-50/20')}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className={cn('p-2 rounded-lg', danger ? 'bg-red-100' : 'bg-farmer-50')}>
          <Icon className={cn('w-4 h-4', danger ? 'text-red-600' : 'text-farmer-600')} />
        </div>
        <div>
          <CardTitle className={cn('text-base', danger && 'text-red-700')}>{title}</CardTitle>
          {description && <CardDescription className="text-sm mt-0.5">{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

// ─── Toggle row ───────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
const Settings = () => {
  const { user, updateProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    village: user?.village || '',
    taluka: user?.taluka || '',
    district: user?.district || '',
    farmSize: user?.farmSize || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwSaving, setPwSaving] = useState(false)

  // Notifications
  const [notif, setNotif] = useState({
    emailOrders: true,
    emailMarketPrices: true,
    emailPromotions: false,
    smsAlerts: false,
    pushOrders: true,
  })

  // Appearance
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('INR')

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deactivating, setDeactivating] = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
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
      toast.error('Email does not match. Please type your email to confirm.')
      return
    }
    setDeactivating(true)
    try {
      await api.delete('/users/account')
      toast.success('Account deactivated')
      await signOut()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate account')
    } finally {
      setDeactivating(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {

      // ── Profile ───────────────────────────────────────────────────────────
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Account Badge */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-farmer-50 border border-farmer-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-farmer-400 to-farmer-600 flex items-center justify-center text-white font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-farmer-900">{user?.fullName}</p>
                  <p className="text-sm text-farmer-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize text-farmer-700 border-farmer-200 bg-card">
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

            <SectionCard title="Personal Information" description="Update your public profile details" icon={User}>
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

                {user?.userType === 'farmer' && (
                  <>
                    <Separator />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Farm Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Village / Locality</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Village"
                            value={profileForm.village}
                            onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Taluka</Label>
                        <Input
                          placeholder="Taluka"
                          value={profileForm.taluka}
                          onChange={(e) => setProfileForm({ ...profileForm, taluka: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>District</Label>
                        <Input
                          placeholder="District"
                          value={profileForm.district}
                          onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <Label>Farm Size (acres)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5.5"
                        value={profileForm.farmSize}
                        onChange={(e) => setProfileForm({ ...profileForm, farmSize: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="farmer" disabled={profileSaving} className="min-w-[140px]">
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

      // ── Notifications ─────────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-6">
            <SectionCard title="Email Notifications" description="Control what we send to your inbox" icon={Mail}>
              <ToggleRow
                label="Order Updates"
                description="Get notified when your order status changes"
                checked={notif.emailOrders}
                onCheckedChange={(v) => setNotif({ ...notif, emailOrders: v })}
              />
              <ToggleRow
                label="Market Price Alerts"
                description="Daily updates on APMC prices for your crops"
                checked={notif.emailMarketPrices}
                onCheckedChange={(v) => setNotif({ ...notif, emailMarketPrices: v })}
              />
              <ToggleRow
                label="Promotions & Tips"
                description="Seasonal farming tips and platform offers"
                checked={notif.emailPromotions}
                onCheckedChange={(v) => setNotif({ ...notif, emailPromotions: v })}
              />
            </SectionCard>

            <SectionCard title="SMS & Push" description="Real-time alerts on your device" icon={Phone}>
              <ToggleRow
                label="SMS Alerts"
                description="Instant texts for new buyer messages and orders"
                checked={notif.smsAlerts}
                onCheckedChange={(v) => setNotif({ ...notif, smsAlerts: v })}
                badge="Pro"
                disabled
              />
              <ToggleRow
                label="Push Notifications"
                description="In-browser alerts for order activity"
                checked={notif.pushOrders}
                onCheckedChange={(v) => setNotif({ ...notif, pushOrders: v })}
              />
            </SectionCard>

            <Button
              variant="farmer"
              onClick={() => toast.success('Notification preferences saved')}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </Button>
          </div>
        )

      // ── Security ──────────────────────────────────────────────────────────
      case 'security':
        return (
          <div className="space-y-6">
            {user?.authProvider === 'google' ? (
              <SectionCard title="Google Account" description="Your account is linked via Google OAuth" icon={Lock}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Signed in with Google</p>
                    <p className="text-xs text-blue-600">Password management is handled by your Google account settings.</p>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <SectionCard title="Change Password" description="Ensure your account uses a strong password" icon={Lock}>
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
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPw({ ...showPw, [showKey]: !showPw[showKey] })}
                        >
                          {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button type="submit" variant="farmer" disabled={pwSaving} className="min-w-[160px]">
                    {pwSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Update Password</>
                    )}
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
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => { signOut(); toast.info('Signed out of all sessions') }}
              >
                Sign Out All Sessions
              </Button>
            </SectionCard>
          </div>
        )

      // ── Appearance ────────────────────────────────────────────────────────
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
                        ? 'border-farmer-500 bg-farmer-50 text-farmer-700'
                        : 'border-border bg-card hover:border-farmer-200 hover:bg-farmer-50/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Language & Region" description="Localise your experience" icon={Globe}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="mr">🇮🇳 Marathi (मराठी)</SelectItem>
                      <SelectItem value="hi">🇮🇳 Hindi (हिन्दी)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                      <SelectItem value="USD">$ US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="farmer"
                className="mt-4 flex items-center gap-2"
                onClick={() => toast.success('Preferences saved')}
              >
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </SectionCard>
          </div>
        )

      // ── Danger Zone ───────────────────────────────────────────────────────
      case 'danger':
        return (
          <div className="space-y-6">
            <SectionCard title="Deactivate Account" description="Temporarily disable your account" icon={ShieldAlert} danger>
              <p className="text-sm text-muted-foreground mb-4">
                Deactivating your account will hide your profile and listings. You can reactivate by signing in again.
              </p>
              <div className="space-y-3">
                <Label className="text-sm">
                  Type your email <span className="font-bold text-foreground">{user?.email}</span> to confirm
                </Label>
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
                  {deactivating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deactivating…</>
                  ) : (
                    <><ShieldAlert className="w-4 h-4" /> Deactivate Account</>
                  )}
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
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, preferences, and security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon, danger }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left',
                  activeTab === id
                    ? danger
                      ? 'bg-red-50 text-red-700'
                      : 'bg-farmer-50 text-farmer-700'
                    : danger
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-muted-foreground hover:bg-muted/60'
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

export default Settings
