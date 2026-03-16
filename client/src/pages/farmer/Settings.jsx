import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Bell, Smartphone, Shield, User } from 'lucide-react'

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    village: user?.village || '',
  })
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(form)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-farmer-600" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Village / Locality</Label>
              <Input
                placeholder="Village / Locality"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-farmer-600" />
            <CardTitle>Communication Preferences</CardTitle>
          </div>
          <CardDescription>How you'd like to stay informed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label className="text-base">Email Notifications</Label>
              <span className="text-sm text-gray-500 font-normal">
                Receive updates about orders and market trends via email.
              </span>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between space-x-2 border-t pt-6">
            <div className="flex flex-col space-y-1">
              <Label className="text-base flex items-center gap-2">
                SMS Alerts
                <Badge variant="outline" className="text-[10px] py-0">Pro</Badge>
              </Label>
              <span className="text-sm text-gray-500 font-normal">
                Get instant text alerts for price predictions and buyers.
              </span>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100 bg-red-50/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings
