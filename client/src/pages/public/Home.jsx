import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Leaf,
  TrendingUp,
  Shield,
  Truck,
  Star,
  Users,
  Package,
  IndianRupee,
  MapPin,
  ChevronRight,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SparklesCore } from '@/components/aceternity/sparkles'
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect'
import { BackgroundBeams } from '@/components/aceternity/background-beams'
import { MovingBorder } from '@/components/aceternity/moving-border'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'

const Home = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [stats, setStats] = useState({
    farmers: 500,
    products: 2000,
    orders: 10000,
    districts: 36,
  })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?featured=true&limit=8')
      setFeaturedProducts(response.data.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // Use dummy data for demo
      setFeaturedProducts(dummyProducts)
    }
  }

  const categories = [
    { name: 'Vegetables', icon: '🥬', color: 'bg-green-100', count: 150 },
    { name: 'Fruits', icon: '🍎', color: 'bg-red-100', count: 120 },
    { name: 'Grains', icon: '🌾', color: 'bg-yellow-100', count: 80 },
    { name: 'Pulses', icon: '🫘', color: 'bg-orange-100', count: 60 },
    { name: 'Spices', icon: '🌶️', color: 'bg-rose-100', count: 90 },
    { name: 'Dairy', icon: '🥛', color: 'bg-blue-100', count: 40 },
  ]

  const features = [
    {
      icon: TrendingUp,
      title: 'AI Price Predictions',
      description: 'Get accurate price forecasts based on historical APMC data and market trends.',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'All products are verified for quality with proper grading (A, B, C).',
    },
    {
      icon: Truck,
      title: 'Direct Delivery',
      description: 'Fresh produce delivered directly from farm to your doorstep.',
    },
    {
      icon: IndianRupee,
      title: 'Fair Pricing',
      description: 'Farmers get fair prices, buyers save money - no middlemen.',
    },
  ]

  const testimonials = [
    {
      name: 'Ramesh Patil',
      role: 'Farmer, Nashik',
      image: '/images/farmer1.jpg',
      text: 'Finally, I can sell my grapes directly to buyers and get better prices. The AI predictions helped me time my sales perfectly.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Buyer, Pune',
      image: '/images/buyer1.jpg',
      text: 'Fresh vegetables delivered to my home. The quality is amazing and prices are reasonable. Love supporting local farmers!',
      rating: 5,
    },
    {
      name: 'Sunil Jadhav',
      role: 'Farmer, Sangli',
      image: '/images/farmer2.jpg',
      text: 'This platform changed my life. I now have regular buyers and my income has increased by 40%. Thank you FarmMarket!',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-farmer-50 to-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <SparklesCore
            id="sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={50}
            particleColor="#22c55e"
            className="w-full h-full"
          />
        </div>
        <BackgroundBeams className="opacity-20" />

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 text-6xl"
        >
          🌾
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-40 right-20 text-6xl"
        >
          🥕
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-40 left-20 text-6xl"
        >
          🍅
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-farmer-100 text-farmer-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Leaf className="w-4 h-4" />
              <span>AI-Powered Agricultural Marketplace</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Fresh from{' '}
              <span className="bg-gradient-to-r from-farmer-600 to-farmer-400 bg-clip-text text-transparent">
                Farm
              </span>{' '}
              to
              <br />
              Your{' '}
              <span className="bg-gradient-to-r from-earth-600 to-earth-400 bg-clip-text text-transparent">
                Table
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
            >
              Connect directly with Maharashtra's farmers. Get fresh, quality produce at fair prices while supporting local agriculture.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MovingBorder
                duration={3000}
                className="px-8 py-4"
                containerClassName="rounded-full"
              >
                <Button
                  size="xl"
                  variant="farmer"
                  onClick={() => navigate('/products')}
                  className="rounded-full text-lg"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </MovingBorder>
              
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate('/register?type=farmer')}
                className="rounded-full text-lg"
              >
                Sell Your Produce
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: `${stats.farmers}+`, label: 'Active Farmers', icon: Users },
                { value: `${stats.products}+`, label: 'Products Listed', icon: Package },
                { value: `${stats.orders}+`, label: 'Orders Delivered', icon: Truck },
                { value: stats.districts, label: 'Districts Covered', icon: MapPin },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-farmer-100 rounded-xl mb-3">
                    <stat.icon className="w-6 h-6 text-farmer-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full p-1">
            <div className="w-1.5 h-3 bg-farmer-500 rounded-full mx-auto" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse fresh produce across multiple categories from verified farmers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.name.toLowerCase()}`}
                  className="group block"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      >
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count}+ products
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to get fresh produce from farmers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Select',
                description: 'Explore fresh products from verified farmers across Maharashtra. Filter by category, district, or quality.',
                icon: '🔍',
              },
              {
                step: '02',
                title: 'Order & Pay',
                description: 'Add to cart and checkout securely with multiple payment options including UPI, cards, or COD.',
                icon: '🛒',
              },
              {
                step: '03',
                title: 'Get Delivered',
                description: 'Receive fresh produce directly from farms to your doorstep. Track your order in real-time.',
                icon: '🚚',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="text-6xl mb-6">{item.icon}</div>
                    <div className="text-farmer-600 font-bold text-sm mb-2">
                      STEP {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-farmer-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Fresh picks from our farmers
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Button variant="outline" onClick={() => navigate('/products')}>
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts.length > 0 ? featuredProducts : dummyProducts).map(
              (product, index) => (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-farmer-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose FarmMarket?
            </h2>
            <p className="text-lg text-farmer-100 max-w-2xl mx-auto">
              We're revolutionizing how farmers and buyers connect in Maharashtra
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-farmer-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-farmer-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-farmer-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from farmers and buyers who are part of our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-farmer-100 rounded-full flex items-center justify-center text-farmer-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-farmer-600 to-farmer-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-farmer-100 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers and buyers who are already benefiting from direct farm-to-table connections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/register?type=buyer')}
                className="w-full sm:w-auto"
              >
                Start Buying
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register?type=farmer')}
                className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-farmer-600"
              >
                Start Selling
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
          alt={product.cropName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.isOrganic && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Organic
          </span>
        )}
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
            product.qualityGrade === 'A'
              ? 'bg-farmer-500 text-white'
              : product.qualityGrade === 'B'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          Grade {product.qualityGrade}
        </span>
      </div>
      <CardContent className="p-4">
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {product.district}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {product.cropName}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-farmer-600">
              {formatPrice(product.pricePerKg)}
            </span>
            <span className="text-sm text-gray-500">/kg</span>
          </div>
          <Button
            size="sm"
            variant="farmer"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View
          </Button>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          by {product.farmer?.fullName || 'Local Farmer'}
        </div>
      </CardContent>
    </Card>
  )
}

// Dummy products for demo
const dummyProducts = [
  {
    _id: '1',
    cropName: 'Fresh Tomatoes',
    category: 'vegetables',
    pricePerKg: 40,
    qualityGrade: 'A',
    district: 'Nashik',
    isOrganic: true,
    images: [{ url: 'data:image/jpeg;base64,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' }],
    farmer: { fullName: 'Ramesh Patil' },
  },
  {
    _id: '2',
    cropName: 'Alphonso Mangoes',
    category: 'fruits',
    pricePerKg: 350,
    qualityGrade: 'A',
    district: 'Ratnagiri',
    isOrganic: false,
    images: [{ url: 'data:image/jpeg;base64,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' }],
    farmer: { fullName: 'Suresh More' },
  },
  {
    _id: '3',
    cropName: 'Red Onions',
    category: 'vegetables',
    pricePerKg: 25,
    qualityGrade: 'A',
    district: 'Nashik',
    isOrganic: false,
    images: [{ url: 'data:image/jpeg;base64,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' }],
    farmer: { fullName: 'Ganesh Jadhav' },
  },
 { _id: '4', cropName: 'Pomegranate',
   category: 'fruits',
   pricePerKg: 180,
    qualityGrade: 'A',
    district: 'Solapur',
    isOrganic: true,
    images: [{ url: 'data:image/jpeg;base64,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' }],
     farmer: { fullName: 'Vijay Shinde' },
   },
   { _id: '5', cropName: 'Carrot',
   category: 'vegetables',
   pricePerKg: 180,
    qualityGrade: 'B',
    district: 'Nanded',
    isOrganic: true,
    images: [{ url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoGRLXO8yaXGbrvbR3bxHuvE2ZQTsorcpvGQ&s' }],
     farmer: { fullName: 'Vijay Shinde' }, },
]

export default Home