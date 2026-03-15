import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  MapPin,
  Calendar,
  Package,
  Truck,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Leaf,
  Award,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/config/api'
import { formatPrice, getProductImageUrl } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      setProduct(response.data.data.product)

      // Fetch related products
      if (response.data.data.product.category) {
        fetchRelatedProducts(response.data.data.product.category)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await api.get(`/products?category=${category}&limit=4`)
      setRelatedProducts(response.data.data.products.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login?redirect=/products/' + id)
      return
    }

    if (user?.userType !== 'buyer') {
      toast.error('Only buyers can add products to cart')
      return
    }

    addToCart({
      product: product._id,
      quantity,
      price: product.pricePerKg,
    })

    toast.success('Product added to cart')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const handleContactFarmer = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact farmer')
      navigate('/login')
      return
    }
    // Open contact modal or navigate to chat
    toast.info('Contact feature coming soon')
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  if (loading) return <Loading />
  if (!product) return null

  const maxQuantity = Math.min(product.quantityAvailable, 1000)
  const totalPrice = product.pricePerKg * quantity

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={getProductImageUrl(product.images[currentImageIndex]?.url)}
                  alt={product.cropName}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isOrganic && (
                    <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
                      <Leaf className="w-4 h-4 mr-1" />
                      Organic
                    </span>
                  )}
                  {product.isFresh && (
                    <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                      Fresh
                    </span>
                  )}
                </div>

                <span className={`absolute top-4 right-4 text-sm px-3 py-1 rounded-full ${product.qualityGrade === 'A' ? 'bg-farmer-500 text-white' :
                    product.qualityGrade === 'B' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                  }`}>
                  Grade {product.qualityGrade}
                </span>
              </div>
            </Card>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? 'border-farmer-500' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={getProductImageUrl(image.url)}
                      alt={`${product.cropName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.cropName}
              </h1>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {product.district}, Maharashtra
              </p>
            </div>

            {/* Price */}
            <div className="bg-farmer-50 p-6 rounded-lg">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-farmer-600">
                  {formatPrice(product.pricePerKg)}
                </span>
                <span className="text-xl text-gray-600">/kg</span>
              </div>
              <p className="text-sm text-gray-600">
                Minimum order: {product.minimumOrder} kg
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity (kg)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(product.minimumOrder, quantity - 1))}
                    disabled={quantity <= product.minimumOrder}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val >= product.minimumOrder && val <= maxQuantity) {
                        setQuantity(val)
                      }
                    }}
                    className="w-20 text-center border-0"
                    min={product.minimumOrder}
                    max={maxQuantity}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    +
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Available: {product.quantityAvailable} kg
                </div>
              </div>
              <div className="mt-2 text-lg font-semibold">
                Total: {formatPrice(totalPrice)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.quantityAvailable === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.isAvailable || product.quantityAvailable === 0}
              >
                Buy Now
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={Shield}
                title="Quality Assured"
                description={`Grade ${product.qualityGrade} Quality`}
              />
              <FeatureCard
                icon={Calendar}
                title="Fresh Harvest"
                description={new Date(product.harvestDate).toLocaleDateString()}
              />
              {product.deliveryOptions.delivery && (
                <FeatureCard
                  icon={Truck}
                  title="Home Delivery"
                  description={`Within ${product.deliveryOptions.deliveryRadius} km`}
                />
              )}
              {product.deliveryOptions.pickup && (
                <FeatureCard
                  icon={Package}
                  title="Farm Pickup"
                  description="Available"
                />
              )}
            </div>

            {/* Certifications */}
            {product.certifications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Details Tabs */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>

            {product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farmer Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">About the Farmer</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-farmer-100 rounded-full flex items-center justify-center text-farmer-600 font-semibold text-2xl">
                {product.farmer.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.farmer.fullName}</h3>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.farmer.village && `${product.farmer.village}, `}
                  {product.farmer.district}
                </p>
                <div className="mt-4 flex gap-4">
                  <Button variant="outline" onClick={handleContactFarmer}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Card
                  key={product._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <img
                    src={getProductImageUrl(product.images[0]?.url)}
                    alt={product.cropName}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.cropName}</h3>
                    <p className="text-farmer-600 font-bold">
                      {formatPrice(product.pricePerKg)}/kg
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
    <div className="w-10 h-10 bg-farmer-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-farmer-600" />
    </div>
    <div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
)

export default ProductDetail