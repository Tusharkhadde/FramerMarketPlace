import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Leaf,
  ShoppingCart,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Truck,
  Shield,
  Clock,
  Package,
  Minus,
  Plus,
  Check,
  User,
  Calendar,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
//import productService from '@/services/product.service'
import { formatPrice, formatDate, getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'
import Loading from '@/components/shared/Loading'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await productService.getProductById(id)
      setProduct(response.data.product)
      
      // Fetch related products
      const relatedResponse = await productService.getProducts({
        category: response.data.product.category,
        limit: 4,
        excludeId: id,
      })
      setRelatedProducts(relatedResponse.data.products.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.quantityAvailable) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    if (user?.userType !== 'buyer') {
      toast.error('Only buyers can add items to cart')
      return
    }
    addItem(product, quantity)
    toast.success(`Added ${quantity} kg to cart`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.cropName,
        text: `Check out ${product.cropName} from ${product.farmer?.fullName}`,
        url: window.location.href,
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-farmer-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-farmer-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/products?category=${product.category}`} className="hover:text-farmer-600 capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.cropName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white"
            >
              <img
                src={product.images?.[selectedImage]?.url || '/images/placeholder-product.jpg'}
                alt={product.cropName}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isOrganic && (
                  <Badge className="bg-green-500">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic
                  </Badge>
                )}
                {product.isFresh && (
                  <Badge className="bg-blue-500">Fresh Harvest</Badge>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                      selectedImage === index ? 'border-farmer-500' : 'border-transparent'
                    )}
                  >
                    <img
                      src={image.url}
                      alt={`${product.cropName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                <Badge
                  className={cn(
                    product.qualityGrade === 'A'
                      ? 'bg-farmer-500'
                      : product.qualityGrade === 'B'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  )}
                >
                  Grade {product.qualityGrade}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.cropName}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.district}
                </div>
                {product.ratings?.average > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium text-gray-900">
                      {product.ratings.average}
                    </span>
                    <span className="ml-1">({product.ratings.count} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-farmer-50 rounded-xl p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-farmer-600">
                  {formatPrice(product.pricePerKg)}
                </span>
                <span className="text-lg text-gray-500">per kg</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {product.quantityAvailable} kg available • Min. order: {product.minimumOrder} kg
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Quantity (kg):</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= product.minimumOrder}
                  className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantityAvailable}
                  className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Total: {formatPrice(product.pricePerKg * quantity)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="farmer"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.quantityAvailable === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={!product.isAvailable || product.quantityAvailable === 0}
              >
                Buy Now
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Truck, text: 'Free delivery on orders above ₹500' },
                { icon: Shield, text: 'Quality assured' },
                { icon: Clock, text: 'Fresh from farm' },
                { icon: Package, text: 'Secure packaging' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <feature.icon className="w-4 h-4 text-farmer-500" />
                  {feature.text}
                </div>
              ))}
            </div>

            <Separator />

            {/* Farmer Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={product.farmer?.avatar?.url} />
                      <AvatarFallback className="bg-farmer-100 text-farmer-700">
                        {getInitials(product.farmer?.fullName || 'F')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {product.farmer?.fullName}
                        </h3>
                        {product.farmer?.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {product.farmer?.village}, {product.farmer?.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-farmer-500 data-[state=active]:bg-transparent"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-farmer-500 data-[state=active]:bg-transparent"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-farmer-500 data-[state=active]:bg-transparent"
            >
              Reviews ({product.ratings?.count || 0})
            </TabsTrigger>
            <TabsTrigger
              value="farmer"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-farmer-500 data-[state=active]:bg-transparent"
            >
              About Farmer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Category', value: product.category, icon: Package },
                    { label: 'Quality Grade', value: `Grade ${product.qualityGrade}`, icon: Award },
                    { label: 'Harvest Date', value: formatDate(product.harvestDate), icon: Calendar },
                    { label: 'Available Quantity', value: `${product.quantityAvailable} kg`, icon: Package },
                    { label: 'Minimum Order', value: `${product.minimumOrder} kg`, icon: Package },
                    { label: 'Organic', value: product.isOrganic ? 'Yes' : 'No', icon: Leaf },
                    { label: 'District', value: product.district, icon: MapPin },
                    { label: 'Delivery', value: product.deliveryOptions?.delivery ? 'Available' : 'Pickup Only', icon: Truck },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-farmer-50 rounded-lg flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-farmer-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="font-medium text-gray-900 capitalize">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.ratings?.count > 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Reviews coming soon...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-500">
                      Be the first to review this product
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farmer" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={product.farmer?.avatar?.url} />
                    <AvatarFallback className="bg-farmer-100 text-farmer-700 text-2xl">
                      {getInitials(product.farmer?.fullName || 'F')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {product.farmer?.fullName}
                      </h3>
                      {product.farmer?.isVerified && (
                        <Badge className="bg-green-500">
                          <Check className="w-3 h-3 mr-1" />
                          Verified Farmer
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 mb-4">
                      {product.farmer?.village}, {product.farmer?.taluka}, {product.farmer?.district}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Farm Size</p>
                        <p className="font-medium">{product.farmer?.farmSize || 'N/A'} acres</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(product.farmer?.createdAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/farmer/${product.farmer?._id}`)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      View All Products
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${relatedProduct._id}`)}
                >
                  <div className="relative h-40">
                    <img
                      src={relatedProduct.images?.[0]?.url || '/images/placeholder-product.jpg'}
                      alt={relatedProduct.cropName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {relatedProduct.cropName}
                    </h3>
                    <p className="text-farmer-600 font-bold">
                      {formatPrice(relatedProduct.pricePerKg)}/kg
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetail