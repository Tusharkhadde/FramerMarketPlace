import { useState } from 'react'
import { Database, Upload, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const AdminAPMC = () => {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      toast.success(`Uploaded ${file.name} successfully!`)
      setUploading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">APMC Data Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-2xl font-bold">63,000+</p>
            <p className="text-sm text-muted-foreground">Price Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold">10</p>
            <p className="text-sm text-muted-foreground">Commodities Tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">Districts Covered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload APMC Data</CardTitle>
          <CardDescription>Upload CSV file with APMC price data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <span className="text-farmer-600 font-medium hover:underline">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
              <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
            </Label>
            <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download Template</Button>
            <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Refresh Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminAPMC