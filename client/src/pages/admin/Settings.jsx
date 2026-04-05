import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Save } from 'lucide-react'

const AdminSettings = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>

    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Basic platform configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Platform Name</Label>
          <Input defaultValue="FarmMarket" />
        </div>
        <div className="space-y-2">
          <Label>Support Email</Label>
          <Input defaultValue="support@farmmarket.in" />
        </div>
        <div className="space-y-2">
          <Label>Support Phone</Label>
          <Input defaultValue="+91 98765 43210" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>Enable or disable features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: 'Require product approval', desc: 'Admin must approve products before listing', default: false },
          { label: 'Enable AI predictions', desc: 'Show AI price predictions to farmers', default: true },
          { label: 'Enable COD payments', desc: 'Allow cash on delivery orders', default: true },
          { label: 'Maintenance mode', desc: 'Show maintenance page to all users', default: false },
        ].map((setting, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{setting.label}</p>
              <p className="text-sm text-muted-foreground">{setting.desc}</p>
            </div>
            <Switch defaultChecked={setting.default} />
          </div>
        ))}
      </CardContent>
    </Card>

    <div className="flex justify-end">
      <Button variant="farmer"><Save className="w-4 h-4 mr-2" />Save Settings</Button>
    </div>
  </div>
)

export default AdminSettings