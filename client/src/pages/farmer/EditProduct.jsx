import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  X,
  Plus,
  Calendar,
  Package,
  FileText,
  MapPin,
  Leaf,
  Award,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/config/api'
import { toast } from 'sonner'
import Loading from '@/components/shared/Loading'

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingImages, setExistingImages] = useState([]) // already on Cloudinary
  const [newImages, setNewImages] = useState([])           // new files selected
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [newTag, setNewTag] = useState('')
  const [newCertification, setNewCertification] = useState('')

  const [formData, setFormData] = useState({
    cropName: '',
    category: '',
    description: '',
    quantityAvailable: '',
    unit: 'kg',
    pricePerKg: '',
    qualityGrade: 'A',
    harvestDate: '',
    expiryDate: '',
    district: '',
    isOrganic: false,
    certifications: [],
    tags: [],
    minimumOrder: 1,
    deliveryOptions: {
      pickup: true,
      delivery: true,
      deliveryRadius: 50,
    },
  })

  const categories = [
    { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { value: 'fruits', label: 'Fruits', icon: '🍎' },
    { value: 'grains', label: 'Grains', icon: '🌾' },
    { value: 'pulses', label: 'Pulses', icon: '🫘' },
    { value: 'spices', label: 'Spices', icon: '🌶️' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'other', label: 'Other', icon: '📦' },
  ]

  const districts = [
    'Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Satara', 'Sangli', 'Ahmednagar', 'Ratnagiri',
    'Thane', 'Jalgaon', 'Amravati', 'Nanded', 'Beed', 'Latur',
  ]

  const units = ['kg', 'quintal', 'ton', 'piece', 'dozen', 'litre']

  // ── Fetch existing product ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const p = res.data.data.product

        setExistingImages(p.images || [])

        const toDateString = (val) => {
          if (!val) return ''
          return new Date(val).toISOString().split('T')[0]
        }

        setFormData({
          cropName: p.cropName || '',
          category: p.category || '',
          description: p.description || '',
          quantityAvailable: p.quantityAvailable ?? '',
          unit: p.unit || 'kg',
          pricePerKg: p.pricePerKg ?? '',
          qualityGrade: p.qualityGrade || 'A',
          harvestDate: toDateString(p.harvestDate),
          expiryDate: toDateString(p.expiryDate),
          district: p.district || '',
          isOrganic: p.isOrganic || false,
          certifications: p.certifications || [],
          tags: p.tags || [],
          minimumOrder: p.minimumOrder || 1,
          deliveryOptions: p.deliveryOptions || { pickup: true, delivery: true, deliveryRadius: 50 },
        })
      } catch (err) {
        toast.error('Failed to load product')
        navigate('/farmer/products')
      } finally {
        setPageLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files)
    const totalImages = existingImages.length + newImages.length + files.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed in total')
      return
    }
    const previews = files.map(f => URL.createObjectURL(f))
    setNewImagePreviews(prev => [...prev, ...previews])
    setNewImages(prev => [...prev, ...files])
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const t = newTag.trim()
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }))
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const addCertification = () => {
    const c = newCertification.trim()
    if (c && !formData.certifications.includes(c)) {
      setFormData(prev => ({ ...prev, certifications: [...prev.certifications, c] }))
      setNewCertification('')
    }
  }

  const removeCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
    }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.cropName.trim()) return toast.error('Crop name is required')
    if (!formData.category) return toast.error('Category is required')
    if (!formData.quantityAvailable || Number(formData.quantityAvailable) < 0)
      return toast.error('Please enter a valid quantity')
    if (!formData.pricePerKg || Number(formData.pricePerKg) <= 0)
      return toast.error('Please enter a valid price')
    if (!formData.district) return toast.error('District is required')

    try {
      setSubmitting(true)

      const submitData = new FormData()

      Object.keys(formData).forEach(key => {
        if (key === 'deliveryOptions' || key === 'tags' || key === 'certifications') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else {
          submitData.append(key, formData[key])
        }
      })

      // Send remaining existing image URLs so the server keeps them
      submitData.append('existingImages', JSON.stringify(existingImages))

      // Append any new image files
      newImages.forEach(img => submitData.append('images', img))

      await api.put(`/products/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Product updated successfully! ✅')
      navigate('/farmer/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading) return <Loading />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/farmer/products')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update your listing — changes are reflected immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Information ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Crop Name *</label>
                <Input
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
                maxLength={1000}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Quantity & Pricing ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Quantity & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity Available *</label>
                <Input
                  type="number"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price per Kg (₹) *</label>
                <Input
                  type="number"
                  name="pricePerKg"
                  value={formData.pricePerKg}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quality Grade *</label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Economy)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order (kg)</label>
                <Input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Harvest & Location ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Harvest & Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Harvest Date *</label>
                <Input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ── Product Images ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-farmer-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            {(existingImages.length + newImages.length) < 5 && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                  id="new-image-upload"
                />
                <label htmlFor="new-image-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to add more images (Max 5 total, {5 - existingImages.length - newImages.length} remaining)
                  </p>
                </label>
              </div>
            )}

            {/* New image previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">New Images to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {newImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border border-dashed"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Organic & Certifications ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2" />
              Organic & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isOrganic"
                checked={formData.isOrganic}
                onChange={handleInputChange}
                className="mr-1"
              />
              <Leaf className="w-4 h-4 text-green-600" />
              This is an organic product
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Certifications</label>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="e.g., Organic India Certified"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm"
                    >
                      <Award className="w-3 h-3" />
                      {cert}
                      <button type="button" onClick={() => removeCertification(cert)} className="hover:bg-green-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., farm-fresh"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        <div className="flex gap-4 justify-end pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/farmer/products')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-farmer-600 hover:bg-farmer-700 text-white min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditProduct
