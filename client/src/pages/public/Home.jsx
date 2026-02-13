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
    images: [{ url: '/images/tomato.jpg' }],
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
    images: [{ url: '/images/mango.jpg' }],
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
    images: [{ url: '/images/onion.jpg' }],
    farmer: { fullName: 'Ganesh Jadhav' },
  },
  {
    _id: '4',
    cropName: 'Pomegranate',
    category: 'fruits',
    pricePerKg: 180,
    qualityGrade: 'A',
    district: 'Solapur',
    isOrganic: true,
    images: [{ url: '/images/pomegranate.jpg' }],
    farmer: { fullName: 'Vijay Shinde' },
  },
]

export default Home