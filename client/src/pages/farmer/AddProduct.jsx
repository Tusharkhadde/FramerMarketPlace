import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  X,
  Plus,
  Calendar,
  Package,
  DollarSign,
  FileText,
  MapPin,
  Leaf,
  Award,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

const AddProduct = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzingPrice, setIsAnalyzingPrice] = useState(false)
  const [priceAnalysis, setPriceAnalysis] = useState(null)
  const [imagePreview, setImagePreview] = useState([])

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
    district: user?.district || '',
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

  const [images, setImages] = useState([])
  const [newTag, setNewTag] = useState('')
  const [newCertification, setNewCertification] = useState('')

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

  const generateAIDescription = () => {
    if (!formData.cropName) {
      toast.error('Please enter a Crop Name first so the AI knows what to describe!')
      return
    }
    
    setIsGenerating(true)
    
    // Simulate AI API call logic here (e.g., Gemini or OpenAI)
    setTimeout(() => {
      const isOrganicStr = formData.isOrganic ? '100% organic, ' : 'fresh, '
      const categoryStr = formData.category ? formData.category : 'produce'
      const cropNameCap = formData.cropName.charAt(0).toUpperCase() + formData.cropName.slice(1)
      
      const mockAiResponse = `Premium quality ${cropNameCap} sourced directly from our local farms. This ${isOrganicStr}farm-fresh ${categoryStr} is carefully cultivated and harvested to ensure the highest standards of taste and nutrition. Perfect for households and businesses looking for authentic, direct-from-farm produce. We guarantee quality and freshness in every order!`
      
      setFormData(prev => ({
        ...prev,
        description: mockAiResponse,
        tags: [...new Set([...prev.tags, 'farm-fresh', 'premium-quality', formData.cropName.toLowerCase().replace(/\s+/g, '-')])]
      }))
      
      setIsGenerating(false)
      toast.success('✨ AI successfully generated a description and smart tags!')
    }, 1500)
  }

  const analyzePrice = async () => {
    if (!formData.cropName || !formData.pricePerKg) {
      toast.error('Please enter Crop Name and Price per Kg to get an AI analysis!')
      return
    }
    
    setIsAnalyzingPrice(true)
    setPriceAnalysis(null)
    
    try {
      const response = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropName: formData.cropName,
          district: formData.district,
          qualityGrade: formData.qualityGrade,
          pricePerKg: formData.pricePerKg
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze price')
      }
      
      setPriceAnalysis({
        status: data.status,
        message: data.message
      })
    } catch (error) {
      console.error('AI Analysis Error:', error)
      toast.error('Could not connect to ML Server. Is the Python Flask app running on port 5001?')
    } finally {
      setIsAnalyzingPrice(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreview(prev => [...prev, ...newPreviews])
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }))
      setNewCertification('')
    }
  }

  const removeCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
    }))
  }

  const validateForm = () => {
    if (!formData.cropName.trim()) {
      toast.error('Please enter crop name')
      return false
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return false
    }
    if (!formData.quantityAvailable || formData.quantityAvailable <= 0) {
      toast.error('Please enter valid quantity')
      return false
    }
    if (!formData.pricePerKg || formData.pricePerKg <= 0) {
      toast.error('Please enter valid price')
      return false
    }
    if (!formData.harvestDate) {
      toast.error('Please select harvest date')
      return false
    }
    if (!formData.district) {
      toast.error('Please select district')
      return false
    }
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      // Create FormData for file upload
      const submitData = new FormData()

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'deliveryOptions') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else if (key === 'tags' || key === 'certifications') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else {
          submitData.append(key, formData[key])
        }
      })

      // Append images
      images.forEach((image) => {
        submitData.append('images', image)
      })

      // Let the browser set the Content-Type (including multipart boundary)
      const response = await api.post('/products', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Product added successfully!')
      navigate('/farmer/products')
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add New Product
        </h1>
        <p className="text-muted-foreground">
          List your fresh produce to reach buyers across Maharashtra
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                <label className="block text-sm font-medium mb-2">
                  Crop Name *
                </label>
                <Input
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Description
                </label>
                <Button 
                  type="button" 
                  onClick={generateAIDescription}
                  disabled={isGenerating}
                  className="h-7 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? 'AI is thinking...' : 'Auto-Fill with AI'}
                </Button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product, growing methods, etc."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quantity & Pricing */}
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
                <label className="block text-sm font-medium mb-2">
                  Quantity Available *
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Price per Kg (₹) *
                  </label>
                  <Button 
                    type="button" 
                    onClick={analyzePrice}
                    disabled={isAnalyzingPrice}
                    className="h-6 px-2 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-sm transition-all rounded-full"
                  >
                    <Sparkles className={`w-3 h-3 mr-1 ${isAnalyzingPrice ? 'animate-pulse' : ''}`} />
                    {isAnalyzingPrice ? 'Analyzing...' : 'AI Check'}
                  </Button>
                </div>
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

            {priceAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg border ${
                  priceAnalysis.status === 'Excellent' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400' :
                  priceAnalysis.status === 'Low' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400' :
                  'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1 rounded-full ${
                    priceAnalysis.status === 'Excellent' ? 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    priceAnalysis.status === 'Low' ? 'bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                    'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm flex items-center">
                      AI Market Analysis: {priceAnalysis.status} Price
                    </p>
                    <p className="text-sm mt-1 leading-relaxed opacity-90">
                      {priceAnalysis.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality Grade *
                </label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Economy)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Order (kg)
                </label>
                <Input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harvest & Location */}
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
                <label className="block text-sm font-medium mb-2">
                  Harvest Date *
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  Expiry Date (Optional)
                </label>
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
              <label className="block text-sm font-medium mb-2">
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select District</option>
                {districts.map(dist => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Product Images *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images (Max 5)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or WEBP (Max 5MB each)
                  </p>
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-farmer-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organic & Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2" />
              Organic & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isOrganic"
                checked={formData.isOrganic}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Leaf className="w-4 h-4 mr-1 text-green-600" />
              This is an organic product
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                Certifications
              </label>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="e.g., Organic India Certified"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button
                  type="button"
                  onClick={addCertification}
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      <Award className="w-3 h-3" />
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.pickup}
                  onChange={(e) => handleNestedChange('deliveryOptions', 'pickup', e.target.checked)}
                  className="mr-2"
                />
                Farm Pickup Available
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.delivery}
                  onChange={(e) => handleNestedChange('deliveryOptions', 'delivery', e.target.checked)}
                  className="mr-2"
                />
                Home Delivery Available
              </label>
            </div>

            {formData.deliveryOptions.delivery && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Radius (km)
                </label>
                <Input
                  type="number"
                  value={formData.deliveryOptions.deliveryRadius}
                  onChange={(e) => handleNestedChange('deliveryOptions', 'deliveryRadius', Number(e.target.value))}
                  placeholder="50"
                  min="1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., fresh, pesticide-free, farm-grown"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-muted/10 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-muted/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/farmer/products')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct