import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Leaf,
  Calendar,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
//import productService from '@/services/product.service'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Validation schema
const productSchema = z.object({
  cropName: z.string().min(2, 'Crop name is required'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().max(1000, 'Description too long').optional(),
  quantityAvailable: z.number().min(1, 'Quantity must be at least 1'),
  pricePerKg: z.number().min(1, 'Price must be at least ₹1'),
  qualityGrade: z.enum(['A', 'B', 'C'], { required_error: 'Please select a grade' }),
  harvestDate: z.string().min(1, 'Please select harvest date'),
  isOrganic: z.boolean().default(false),
  minimumOrder: z.number().min(1).default(1),
})

const categories = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'pulses', label: 'Pulses & Legumes' },
  { value: 'spices', label: 'Spices' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'other', label: 'Other' },
]

const commonCrops = [
  'Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Cauliflower',
  'Carrot', 'Green Chilli', 'Capsicum', 'Cucumber', 'Bitter Gourd',
  'Lady Finger', 'Spinach', 'Coriander', 'Ginger', 'Garlic',
  'Mango', 'Banana', 'Grapes', 'Orange', 'Pomegranate', 'Papaya',
  'Watermelon', 'Guava', 'Strawberry', 'Rice', 'Wheat', 'Jowar',
  'Bajra', 'Maize', 'Tur Dal', 'Chana Dal', 'Moong Dal', 'Soybean',
  'Turmeric', 'Red Chilli', 'Cumin', 'Milk', 'Curd', 'Ghee',
]

const AddProduct = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      cropName: '',
      category: '',
      description: '',
      quantityAvailable: '',
      pricePerKg: '',
      qualityGrade: '',
      harvestDate: '',
      isOrganic: false,
      minimumOrder: 1,
    },
  })

  const watchedValues = watch()

  // Image dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setImageError('Some files were rejected. Max 5 images, 5MB each.')
        return
      }

      const newImages = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )

      setImages((prev) => [...prev, ...newImages].slice(0, 5))
      setImageError('')
    },
  })

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setImageError('Please add at least one image')
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        ...data,
        images,
      }

      await productService.createProduct(productData)
      toast.success('Product added successfully!')
      navigate('/farmer/products')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/farmer/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below to list your product
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-farmer-600" />
              Product Images
            </CardTitle>
            <CardDescription>
              Add up to 5 images of your product. First image will be the main image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-farmer-500 bg-farmer-50'
                  : 'border-gray-300 hover:border-farmer-500',
                imageError && 'border-red-500'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-farmer-600">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-400">
                    Max 5 images, up to 5MB each (JPEG, PNG, WebP)
                  </p>
                </>
              )}
            </div>

            {imageError && (
              <p className="text-sm text-red-500 mt-2">{imageError}</p>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-farmer-500 text-white text-xs px-2 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-farmer-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Crop Name */}
            <div className="space-y-2">
              <Label htmlFor="cropName">Crop Name *</Label>
              <Input
                id="cropName"
                placeholder="e.g., Tomato, Onion, Mango"
                list="crop-suggestions"
                {...register('cropName')}
              />
              <datalist id="crop-suggestions">
                {commonCrops.map((crop) => (
                  <option key={crop} value={crop} />
                ))}
              </datalist>
              {errors.cropName && (
                <p className="text-sm text-red-500">{errors.cropName.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                value={watchedValues.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Organic Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOrganic"
                checked={watchedValues.isOrganic}
                onCheckedChange={(checked) => setValue('isOrganic', checked)}
              />
              <Label htmlFor="isOrganic" className="flex items-center cursor-pointer">
                <Leaf className="w-4 h-4 mr-2 text-green-600" />
                This is an organic product
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Price per kg (₹) *</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  placeholder="e.g., 50"
                  min="1"
                  {...register('pricePerKg', { valueAsNumber: true })}
                />
                {errors.pricePerKg && (
                  <p className="text-sm text-red-500">{errors.pricePerKg.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantityAvailable">Available Quantity (kg) *</Label>
                <Input
                  id="quantityAvailable"
                  type="number"
                  placeholder="e.g., 100"
                  min="1"
                  {...register('quantityAvailable', { valueAsNumber: true })}
                />
                {errors.quantityAvailable && (
                  <p className="text-sm text-red-500">{errors.quantityAvailable.message}</p>
                )}
              </div>

              {/* Minimum Order */}
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Minimum Order (kg)</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  placeholder="e.g., 1"
                  min="1"
                  {...register('minimumOrder', { valueAsNumber: true })}
                />
              </div>

              {/* Quality Grade */}
              <div className="space-y-2">
                <Label>Quality Grade *</Label>
                <div className="flex space-x-4">
                  {['A', 'B', 'C'].map((grade) => (
                    <label
                      key={grade}
                      className={cn(
                        'flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors',
                        watchedValues.qualityGrade === grade
                          ? 'border-farmer-500 bg-farmer-50'
                          : 'border-gray-200 hover:border-farmer-300'
                      )}
                    >
                      <input
                        type="radio"
                        value={grade}
                        className="sr-only"
                        {...register('qualityGrade')}
                      />
                      <div className="font-semibold">Grade {grade}</div>
                      <div className="text-xs text-gray-500">
                        {grade === 'A' && 'Premium'}
                        {grade === 'B' && 'Standard'}
                        {grade === 'C' && 'Economy'}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.qualityGrade && (
                  <p className="text-sm text-red-500">{errors.qualityGrade.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harvest Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-farmer-600" />
              Harvest Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <Input
                id="harvestDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('harvestDate')}
              />
              {errors.harvestDate && (
                <p className="text-sm text-red-500">{errors.harvestDate.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/farmer/products')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="farmer" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Product...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct