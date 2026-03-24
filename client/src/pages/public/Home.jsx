import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Map, MapTileLayer, MapControlContainer, MapZoomControl, MapLocateControl } from '@/components/ui/map'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
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
import { ChronicleButton } from '@/components/chronicle-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GenerativeTreeBackground from '@/components/ui/generative-tree-background'
import { getProductImageUrl } from '@/lib/utils'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import { MAHARASHTRA_DISTRICTS_COORDINATES, DEFAULT_MAHARASHTRA_CENTER } from '@/constants/locationConstants'

// Removing static HOME_FARMS as we fetch from DB now

const Home = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [mapProducts, setMapProducts] = useState([])
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
    fetchMapProducts()
  }, [])

  const fetchMapProducts = async () => {
    try {
      const response = await api.get('/products?limit=50')
      setMapProducts(response.data.data.products || [])
    } catch (error) {
      console.error('Error fetching map products:', error)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?featured=true&limit=8')
      let products = response.data.data.products || []
      
      // Fallback to latest products if no featured products found
      if (products.length === 0) {
        const latestResponse = await api.get('/products?limit=8')
        products = latestResponse.data.data.products || []
      }
      
      setFeaturedProducts(products)
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
      <section className="relative min-h-[85vh] w-full bg-[#0a0a0a] overflow-hidden flex items-center py-20 lg:py-0 border-b border-white/5">

        {/* Subtle radial gradient background for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-farmer-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 lg:mt-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

            {/* Left Content / Text */}
            <div className="w-full lg:w-[45%] flex flex-col items-start text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center rounded-full border border-farmer-500/30 bg-farmer-500/10 px-3 py-1 text-sm text-farmer-400 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-farmer-500 mr-2 animate-pulse"></span>
                  Farm to Table 2.0
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                  Fresh farm produce <br className="hidden sm:block" />
                  <span className="text-farmer-400">starts here</span>
                </h1>

                <p className="mt-6 text-lg tracking-wide text-zinc-400 max-w-lg leading-relaxed">
                  A beautiful platform connecting you directly with Maharashtra's farmers. Get fresh, quality produce at fair prices, making your meals stand out.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <ChronicleButton
                    text={"Get Started"}
                    onClick={() => navigate('/products')}
                    borderRadius={'8px'}
                    customBackground={'#d4a373'}
                    customForeground={'#18181b'}
                    hoverColor={'#e6ccb2'}
                    hoverForeground={'#18181b'}
                    className={'text-base font-semibold px-8 py-3 w-full sm:w-auto'}
                    width={'auto'}
                  />
                  <Button
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/5 px-6 py-6"
                    onClick={() => navigate('/about')}
                  >
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right Content / Generative Tree */}
            <div className="w-full lg:w-[55%] h-[400px] sm:h-[500px] lg:h-[650px] relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="w-full h-full relative flex items-center justify-center"
              >
                {/* Dark circular container resembling the reference image */}
                <div className="relative w-full max-w-[500px] aspect-square rounded-[2.5rem] bg-[#050505] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center">

                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-farmer-500/5 to-transparent pointer-events-none"></div>

                  <GenerativeTreeBackground />

                  <div className="absolute top-6 right-6 text-[10px] font-mono text-farmer-400/40 uppercase tracking-widest pointer-events-none select-none">
                    60 fps
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
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
                      <h3 className="font-semibold text-zinc-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-zinc-900/60">
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
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
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
                <Card className="h-full bg-zinc-900/30 border-white/5 shadow-none hover:bg-zinc-900/50 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-6xl mb-6">{item.icon}</div>
                    <div className="text-farmer-600 font-bold text-sm mb-2">
                      STEP {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-zinc-900/70">{item.description}</p>
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

      {/* Farm Network Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Explore Our Farm Network
            </h2>
            <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
              Directly connect with farmers across Maharashtra. Visualize our growing community through our interactive farm map.
            </p>
          </motion.div>

          <div className="h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group bg-zinc-900/5 backdrop-blur-sm">
            <Map center={[19.7507, 75.7139]} zoom={7} className="h-full w-full">
              <MapTileLayer />
              {mapProducts.map((product, index) => {
                const baseCoords = MAHARASHTRA_DISTRICTS_COORDINATES[product.district] || DEFAULT_MAHARASHTRA_CENTER
                // Add a small random offset if there are multiple products in the same district
                const coordinates = [
                  baseCoords[0] + (Math.random() - 0.5) * 0.1,
                  baseCoords[1] + (Math.random() - 0.5) * 0.1
                ]
                
                return (
                  <Marker 
                    key={product._id} 
                    position={coordinates}
                  >
                    <Popup>
                      <div className="p-1 min-w-[150px]">
                        <h4 className="font-bold text-sm text-zinc-900">{product.cropName}</h4>
                        <p className="text-xs text-zinc-600 mb-1">{product.district}</p>
                        <p className="text-xs font-semibold text-farmer-600 mb-2">₹{product.pricePerKg}/kg</p>
                        <Button 
                          size="sm" 
                          variant="farmer" 
                          className="w-full h-8 text-xs rounded-full"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          View Product
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
              <MapZoomControl position="bottom-6 right-6" />
              <MapLocateControl position="top-6 right-6" />
            </Map>
            
            {/* Elegant glass edge overlay */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-[2.5rem] z-[1002]"></div>
          </div>
          
          <div className="mt-12 text-center">
             <Button 
               variant="outline" 
               className="rounded-full px-10 h-14 border-farmer-500/30 text-farmer-600 hover:bg-farmer-500/10 transition-all font-semibold"
               onClick={() => navigate('/farms')}
             >
               Open Full Farmer Network Map <ArrowRight className="ml-2 w-5 h-5" />
             </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2">
                Featured Products
              </h2>
              <p className="text-lg text-zinc-900/70">
                Fresh picks from our farmers
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ChronicleButton
                text={"View All Products"}
                onClick={() => navigate('/products')}
                outlined={true}
                customBackground={'transparent'}
                customForeground={'#fff'}
                hoverColor={'var(--card)'}
                hoverForeground={'var(--foreground)'}
                borderRadius={'8px'}
                width={'auto'}
              />
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
      <section className="py-20 bg-zinc-900/20 text-zinc-900 border-y border-white/5">
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
            <p className="text-lg text-zinc-900/80 max-w-2xl mx-auto">
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
                <p className="text-zinc-900/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
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
                    <p className="text-zinc-900/70 mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-farmer-100 rounded-full flex items-center justify-center text-farmer-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-zinc-900/60">
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
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
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
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${product.qualityGrade === 'A'
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
        <div className="text-sm text-zinc-600 mb-1 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {product.district}
        </div>
        <h3 className="font-semibold text-zinc-900 mb-2 truncate">
          {product.cropName}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-farmer-600">
              {formatPrice(product.pricePerKg)}
            </span>
            <span className="text-sm text-zinc-600">/kg</span>
          </div>
          <Button
            size="sm"
            variant="farmer"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View
          </Button>
        </div>
        <div className="mt-3 text-sm text-zinc-600">
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
    images: [{ url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGBobGBgYGBoYGhsaGBoXFx0YGhoaHSggGxolHRcXIjEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi8mICU1Ly0tLy01LS0uLS8tLS0tLS8tLS0tLS0tLy0vLS0vLS0tLS0tLS0vLS0tLS0tLS0tLf/AABEIAOIA3wMBIgACEQEDEQH/xAAbAAADAQADAQAAAAAAAAAAAAAEBQYDAAIHAf/EAD8QAAECBAQEBAUCBAYBBAMAAAECEQADBCEFEjFBBiJRYRNxgZEyobHB8ELRFCNS4QcVM2Jy8bJDY4KSFiQ0/8QAGgEAAgMBAQAAAAAAAAAAAAAAAgMBBAUABv/EADURAAEEAQMCBAQEBQUBAAAAAAEAAgMRIQQSMUFREyJhcQUygcFCkaGxFCM08PEkM3LC4RX/2gAMAwEAAhEDEQA/AJD+H/iOQIAvct8hG87hAoDpABZ/Noy4cryghxYM/aKmsr0lQmDmS1wD2gb8tnlencA0AtbahcSqJglhMxTJSbA3JI2aNqXiROUFKMiweZjYjygPGFZiSrWM6GlkCW6nKyWHrue0QEEjXtl8vBXTFsUK1593hjQ8QMCAbEMYzxzB5KUgy5gNrjeEuG0alHlSVNct0ETtpI8SRj6PBR9fWZyw30AhzR8NT/CCgreyduresTtZUICkkDTWHtLxJOmDwUABJ1UdvKJFUbRb9/vwldNLGZQmAC5DdL/aD6XEjJUxukOxf2jerwTTKC5uTr6wsqJJkLcgLG4OhgaTSC1mAmtRxEQhwbmJ8VBmTPEKmbSOVlYhQAEsJGb6xmuQ9kJt2jqVTed19uyoqfF1SwC1lCEtUpM6dzFkl3y6xnTkzAlBDZbecMVYCWdJu0c0HhWpA6Vm4DC+YHh5WQlnYlvfWLHEsNQhAKjzAWYWMSmCVxllt4eTaxU5gpQITpHDlWQ0sDNhwlOMyAZeYaxOUVEZiiB7RS47PSJeRLW1hFgc/wDm5toMkWqk4a57bTbEKOWZaRkZWhbRxvCaQcnLsS/rFPildJKQEuTqSBZ+jmEnhIfmSSDtC3GyQmthIpzW5C1kVIcQbPSMmdTgAghxrvaAkSpGnOn5/SN103L/AKudPR7j0MRtRuc7qs5uKmaU5rBOg284xxKsSsgJAJ0tA8iWEpmMbrZIDXtd+0F0OGqQnO2lyImsqu2QkVVeqFoZ2RRJN3jtimIFZYOo7QDOp1KmkDcv7wfVYYZaQev1idqWHSPZQFeqX0deU2EfaxalauBHbDykTHN4a8QVMrKgJ1a8dQQNY50XmdhHYhRzUkGUM2YXSNfWF9VWTpQCVoUk9xDjB6pDHOopzWzwPjdSEpyhefUXY26R1XlXXMc0Ha5JTRzp6XSkkblo2o8IWSE67E9OvrB+EcUGXKKMtmaBqOaMyVhfxu4BuCDEmgEiPa51k5KOpcFOZQYKaz9fKAZ0+bTZ0oJSFO48/vFjglRLSxMS3EtYhc7l0JaJoAAhMlYMg/RSakF3LtDrBFMYfYvhCRIC0tpcQmwulLhSiEoY37iIcOiTpojG/cMq3wirR8MwbWPltErxKtBWrKXT942RiaNConZwPoSYU4rIyksokPZwx9RHF1ildfTQXDN/klK7EHYmKDClfqyZhpCqmlSySFvmFx0PZoZU8ybKTmQAEh9eh2iFRgtm7sUPWVCRNdIAB2eGciqmJYtytrtCSRK8aYkLADqa33iyqMBBUiVLWQFasbAbkekCTlOjlebA46JdgvC8+sUZqSJSH+JQ1O+UDWCMf4UqaVIWFpmo0UUukh7OR07gx6HTtLQlCQyUhgOwhPxJi2WXkSHK7AffyjvUpYLy7a1QVThqUywFKzzVMcqdEjuepjlPh6Ei/qB9zBMuzgXJ1J1eDaCkSpQzGyohtuNBakcDY27j+aUiQSAw6wYKAsLDSGKZWQlDXBsB/aN0nTyiy2HCeZDWEskYKo8x3Fut9o2mcO5Pi97xR0kskJbzg6qk+IWGgiCwLPdqCXUV5yiiEqaC1t4cYhXyhJ7fPyh5X4VblF9zELiuFFSmSWUNjof7woghKmA2WzoltDVOsqNnPtBmMYl4mVI2DCFS6JZIdQBNmGsG0Y8GYMwcbx1KqyZ5YGVXqgFSSDq2n4I+po82qiB5Q0nTZM5XKlefMAlKRYj7GG07C1oDlLAbaj3iUAjaeThT9NTTLp3Bb1gyZgc0pdTt2gmnrPEXmZgT+PFZS1WaUUpQVMLnYRzcp8UILBebUDh2F5lEHQGCZuGeGqzgu4O3lDpSFS1BVhf8eDMUrkKlhmzQINqRHG2qH1UtMrJjsoEE2j7UYctDLUHDvrtDGQqXMCkzDzag6R2l18tQRIUXBWkP0BUAflHWh3b/AJjwh5uLnwyh7QBRYbMnm1kPqfsN4zkUpn1aksUozqLf0oSTy/QRapASlksANB0/AIF7qTtO06gWRQH6pOrBwgaudyfxoxnyFt8OYDtDcSVLJew7x2GGHYv6RzQTkK81gaK4UwuWm3IxBuWuX2LnaD1YoEylIZybQ0n4Wncj1BBhPU0+VTO46i8SbCgwW2mpUMyJiS2gCvJ49H4RWFo8Ruw+5/OkSEvDElJBuo76k9BF1hGGiVKQhJIKUgeZ3P3iFQtzAWuR9fUhKSSdBEPOqiVLX5AHp1A+XtDLiGqWBlLF7ROifYD1PrHOzhW9BGC4ko+npsyVKF8rKbdrufS3oSdoMpVb/qhbRTCFpKSQXsRb8tD+RThRSsDlJAUkapLi4GuQj2YjpBt8q0NTIG+3RZSQ48yR7MR9TDCRLOWX5qf3aOSqAkMygfEZzoS2ttNidYbIpyLKTdI0BB1u/s8M8UUsqSfCzkygHUwcwXKRplv+ax8TLCj9u3U/tB1MhtfeO3WqZfaFmSQQREFxFTLRNCmIu7R6HiEoMFPaJTiKcklIlm5sbfvAu4VnT5x0K83lnJMUDso37G4PsYaYr4akJKdQLn7R0rcJPj5c7OA6vUj7RjjGAqlBlK176jrAi6tVy7aNtZ6LKTI8NSX3uIo0YkUg51nLsWf0iZTVqUlKVC6bP5QVMnugJJsIEeqcADCCulHLMsqlqLNp6a3h7SYmpKFICiDsRAPFK5alAS7WJt1gFCSyebzibKCFwb5Twu+NV82YwDC7kDdoCGIEpDFy7EdIYY0JcpICVBSlAFxt67QipBcvv1jgBSqucQ+m9V6PwRwiua6lhJS2/eF3E3A0ynWZqCFpBcgAhQD/ADaPQf8ACRR/hWJzHMWPbYfKDuIR8XrAb3E0m3ucWkdl5vWZEzVFKQCVKJI3Dk/tGdPMu50O3eMKoKCpii7Z8r92dvNiPK3URpKmJzDr084U/JW3pANgpNko306CO1LMY3LX2vAKlKMHUUj13PlFuPjCe+IHJR38L4gYq8rfV4n63DClTFvNor5NOk6qts0ZV9LJIIJ+sE4Aqi2XY6lESZipKw9w7g6+kXdJVhcsLGhEQGJSciyAoGNsJxlUl0l8h1H9L7jt1hPBXa2HxGb2rfiqq/mJHf7Qjp1RzieeVLSUXu9ukDyVCOSvh8lEgp9TJTYu34XhpIUSC3u4HzOg9YR4fe5+EdT9BuflDUTQpByBkpbS7qJZLnTU6RBJV+V14T6nqsoAJIdNyXyHUm5I05hv+mC8wZiGd9QTyPb4b3CToNtOqbxSnKjnPiXWPQ2GYcos+zuekFYdSlcpwtlOCSRcWzEEH4VJOVtLk3YNCCsCZp3Kiw5SCh3BJ3ICRYN3Ov3jQ16UJKlKDAfpHyAdyfSF1PUpWQmykpG4DE9WIv6F9XjedOlAXSlu237RZj4RNZ3WGJY3KVLIDlX9O/qdvKIibW5pqXSpIzNzHrrsIJxWZlXa6SXfcDp9Y5PUCGBdy5B0Ie1tI5zlpxMaxuOq+JmSjNWtJDhWVJ1AbXz1jvjlQhSGIBPVoCx5KJM5KE2s+UCwB2+sL1z/ABXzOkAkMbeveAY5JOnaW+JeVjTeCofzCR5QvxOZKBZF4HXJDliTeH2CcMmcC5bRmhgBKpy3twK/VDKpJk9RUW10TYMIDr5Cgvm5DowhrIqUydFHN0MdMUxYTgAEc3WIGAnujZtoFKMIQ8113Yxd45hEqbICpUvLMYaMx/vEDKzomKGQkkXHSHuAePNnJCioSpbEhzdtBrEk0FVjI2Cv8r0f/DvDp0mlyqDHMolr2Jg7GpjIJ6DeHPDa2lZjE5xVN/kr7g/l4rg3ZTGnJFcKKxGYyHmgqu6EgkJdWY5y231btZRLqGNvc/WKObLQqWx+DKEKLEhv6kquCpPKfK1wYTycPIzJWyfD+JaiWuQkMwJIJI0BsXsIi1q6fUtd0oJtQAzVJTL5rOXBA0OsGqkKQrKsIJ0dKhZv+J+sKaaWtBKCGIbQgg2BBDWIIIIO4IhgiWp2+kWoeFe5814pUVDSEgMQ3eNqvDQ11ewt7xtgNC6XVr3vBVfLQlBGcAt+fnaCJWHqJf5tBedY9Rh+W7bxPVUoh4r8RZyAp4m61DkiAcFqszFlK5U7ISWBtv8AaMZk5lE9bx2RNZQu3Szx0mSHECAsjUTFjgWreXUOIoeFp0szAJiglRYIJbKH1JJ0LWHnEdNQqXqCx36wbJnpy2v5/SO9VYj1IkG0r0ObXyiFtmJBy5iNuYX1IN46YdXJUrwlpTlXyuSdQwSSejtfb0ifwXEkSylC7y3VnbU5gQ48re0Nq3BZsoJmSv50klwtFyx6gRG0Fc6Ngwcdk2rphQcp+H9JB6FvcMz9oU12LOSzZtCzMfKPk+bMSkLWg5CQmYlQIc7LB2KkghxujuIAm0ozFtBdGrKF2Z4kEjCGMd19Csy7D4RceWvzgiWhBL3DkW7PAVG5FviJ9WjviFUJaSEZc4G9mG5HftAk2jeQE1l4GqsqDkIcskE7Nbb1gzH+DlyAUFln4jM0CQ3wt1PWJTB8eMv4F5T1ePReG8bXXU9TLmzhLIAZTZlKtsnfT5xwDU6SeRrAW1sFWPvjleWKppaXyk5gryDRf4cmZkAlIQElIdVg5G4u+brEHQkTF5ZmZCSRmKQ6gAbkJO/aMq/GamVMZE9eRBUJbgA5TYEgOMzR2eiXPLHE0HbYPSsBYImJnKcHKXOsPsNwrMkgTRnAdmFu7wvSJcsZywcsTrrtGkvHpaZZAu9iRa0MFKlIysWLWlEqXKP8wlYe6gCfpBeEVks1SxKJyKS4BBDEecTtJPJSsOySXEP+H8OYom9SR7iBcLBCMZYF6smclFOi4GYCJDi2pHhkA+37mKitTySkhjZ2hHiNCggnIH8oQwYSQVFYMtPgkLsoOzk/C7BrgPytf7wWuckSSlSlFZSJY6FAUlaVvuoBOXybpAc6QUzFPYMSOhS6DbvdZ9IyqDds2m7RJCvaOMEZ7qgkApRTXc+Go5jfl8RYCH/2sf8A7tsIKmod73HT+0J6KrWmXkLKQ+ZNrpVoSOjixDMWBZxBi5wOj/IQ6PAWgI3V/fe0/wAIQspuq3Qn6CDSiWNVC2zQhwuqQDzxvXY5KDiWgE9b28oYs6aF5kwEqxOcnMoh/kInq1fxK05T7wXUzlEEgEd4S4yohABU5JZn0Gv7e8C4q1M7ZGe9JajV/wDqDkrLWPsLfPWB5Eq0GyEdfzygOVUg0oq3LJYUoMpRI6bRgcPGzj86Q5lUr/uYKlYUo3AJHXSC2lWv4eE9FOpkrTbV9GhvgmMVNP8A6alAO5SQSk+YjeZTDqPeHvDldJKVJqMoyAqzEPmSNrXKu28QbCXNH4TbIsLOpxabUoKVpASoXYG7F7Em1wDH2omysiAspRlDAAuWADAe3eJTFcdNXUNLR4MlJZKE8qiOqyNSemg9ySMXp5Yy5HCgLkfcxNGrJVWORr27mCgn9LOlqKm5cqbPYE/eAkUYWkeKC39SSN+ogfGZqDKDL0FiLXG0L6RS5rIzFyNXgW1WFAcbu0qmSUCeoJLpBsYqMLkqCkqC2HV2iXxaiVTTcq977GDJFWqYyQSwGsEQkQy04tGDaLqsVTKq8wLh399YP4nxOmmSxNCUpmEju4/4jTziXxKgVnBCS/6jsw3gqnogpLBA84gCgrEcksm9hAxwTa5VAeGSo30Af6CE0uQCYqcMwlEwOovAGM4YlKwmWp3+UHVC1Vm05J3JjRyAUMbDYwywSsab4RGp8g7dPSJ7wpiAEgnL3GsFYTXrmVUlDNlU5PWxgDgK059N8w5Xt8gy5koMQFgb2PlCqsSSCwhlhdMhcsOLtqI619IUCxf86QlhCpnBXl2MTiiYUKDpOg+v52hbVpZaSpTA7628hDzivDlq5xYpLhoApkpnIdQHRQOxF7QRFZWjpZt3kJz0WtOpLB7dFJNj3H9od06k9iO8ThleGWQp065Vae4v9IZSq9KUf6anvZPMnexNmHnBNeFsG9lkH7ImqmAfpF97QtqVDqIFnYmC/Kp3s5gRVYTdngy5C+Ro5K7z54AN7wimzvEmE7Cw+5jernE6wLIF4E8LGl1DZpQ1vA/VHyxB9LLECU0MJGsFGVqtjtlprJSCzaDcwwABDHTYQqkTALEvDWjQVm0WsJDm7RlDV9GlrAC3pCdCMpB1Y9Ir6ijAHMHhFVFINmt6wiRSyTc2lO4thzL8VJYk83nsTC7/ADCYQpDjU5iYaY2okpIBudPIPBOBcMCcvMskJIHKNT5nbyhYPdZc8dCm/VTcvO3URYU9VS0klE8SzMnLQQUm6UqtzEbf3iwkcE0pRkCSH3zH7xIYzgCJQWgrugsUnpsR0s0T6oGsDgWg5UhiFQZxzEE9INwOpGZiAB0EMqGjYBC2Y6NHTGqSUkyzIzFWXnfZT/SCPFrhH4Z8R31WlXXIzLSzAo1Ie/2j7gMwIcq0hFVJmA3jqmvOgMDwbCmLUxNJB6pl/GJSGQbEMexgzDgLFQv1MIsawwyJmTxUrcOCn7iN017gZizBujxJUQ6nkOCsK6chYZABYa/t2icwJYFckHUv8gY2wipM0+GggEs5Nrecaz6FcuapaCGzBTgfFl2fpEG3Wie4urYvVMKr0hIEb1Nc41t3/wC4lqCpdjsRDKW2p+n7whrRaS7CDxWY6SSbRILpCFE/pVq2ttCO4/frFvPlFV2ZPf8AYQrrJI7Q+rSw5S01KgWsotq2o6wKqnmf9EQ3rFAGw9IXLqF/pSPU/aAoK/HJqXNptkLpLojv8y8fQNQfSNaaZMKsqykAhwwe9rax8nUyj8JPt1gg21ztNqJBZP0Siqk37QVJpXp1OLy1gg9pguD6iWR/yPWPk5C0llB/QgwdQlKwpBIBWnJfq4UlWtuZMsOxsPJoPZVfBkgducEskKhjTL2hHTVDmGMmZAjBW/p5g9mEymhiGEVWCTQALRIKmAgX0hrhVV3bzvD2vUTt3MpV2Iy8yCTp+fKI/EpoBIHy+0Op1WyOa76A9fKJ2rBfMb3Ln7RDyqkVtFFD11No+uYe7H7P7RV8LymuYT4dQqnrdAcSwCejq/SO4Af/AOQioqamTSywuarKDon9RPQCEkqk9wLiAqCRNADnQCPLOK5U5cybOWDLStWhDctkp+QDxVYfxEkzQuYhXhj4UgP79TGP+IXEsqoAloQzN20uxguiuwaWSN9ObyObwPT1Xncmeymew3OkMZM4F8qSTDjhjhw1EwJYB2c7AdTFGrh6mlz1yPESFfpJUAPX1iSKFpWshtu3dnmvT3Xl1QCublW6Q+jQfT4GPiJCRs9oI41lqRPEkJHiIuogu7s3pp7wrl081ZKZmbMnVJcN5gxNgLNgiaXbeqFk0y/EdTqUesUEvD5c5ORmWBaFVfMUZqco5k6x3qcSCGYKSvfd/KJBTWbW208IOlQZS1a2LRS4TPC2G/eJqiqgqYfEcBW8Mv4ZQdUpYUNuscHUUyIsDMK2mJTLUlAWCtnUkbCGdItx2/LR5RhNdM/ikKW4vlL/AO6149Lw+Y9nhL8PtIDg8WExqZvSw/NIncRrjcIbzP2jpjOJZ1GXL+EWUodeg7QvmLsEhiYkv6BWdPpb8zlnKlFiHcnfUk3v9o6y6a6tmB9N4NoUiYtMoBpi1BKbOl1FhfbWHuLUtNLV4aFGaU3mr08Qhnly9gOp1vra5NGLWu6RsdMHKnqOgzc7gIBYk/NuoAuf7xvUVNmloYPYq1PfsP3jotU2cogMlOVgBoANEjt+bwXUTpUhTHnWkX89ST37eXeGt4Q7iXZyeyQVElbnM7td3+8L1y+nvFV/quVhSS+raOCRmPUtYdoDRh2UlZTmSjRLWUq7A9RZz7bxzmXlMe5rhR5UrW4cqUQ9nALPcBQceVrt3EbSFBhzQyqJRUVEnm1L7k3gKTQEqOXo7QsilT8EwGxx1RCJgZoNkzSkWLfWFsuQoG8NEpdh+fWOtoTDNhZqnqJdy/cuYY4ZTLIVmdj119BtHelo/wClIA3Nh6kxpOxGWmWoJU7bjQntufOA3blXe4uwFvjPEooJaZMmVmmqBLsyAdywuo+0RsysXPWlc5SlLd+bT0Gjdo6UylT1kqUTcs+0NhRlKbpcPc9O8FtSIYxZcTzwqbh/GkiZmmIdISwSUhnGhtaJaunJE3Mv9aiSQLByTpBox5EgFIAW4LFi/qImhW51HMnlJ9ogtHRXmapou/mOB2/LoqlGLmW5lLUzNYFLjve0S0yrXNmnMSpRsSdm2EGKUogJQRl2Yh28oWkFEwkAkb+cTfRK1ErpC0u4vNK34PmUyZhmrRN5QkKA5ku9tL7PfpGuJAKnzFSZWULLjqR1Lwv4WrEmxbKS5S+pukH5x6Hw/T0MiWVTpiSo2Z3MQyMXuKa0xRgybC48Acrx2mKi01VyS5PeKrCMClT5cyomkBKAyU/cx8xLAFeKtUtKTLUCrIBlKW1AGh6wqBUiWUupv1JB6aExO7oqXgHAuijp2AoEhS2eY1kjbuekTeF0x8XLmKRu3WKaRiE6XKWlIfPqpns2gMTtLM8Oe6iHGvrBki10gOL7pvjqU+GQQAsXezv6QZJr1GSCn4lpHp1P5vAFNiKB4pCXmKASgliEjctuYIEjwpSAS5UCfRz26kwuTOUuKNzn5XUJYdD01jtJkkX1PSOSkveN0J3JH3gY2lxW7HEGi+qxWpg9wrYu1+sNMOpvFQkkszB2d02t2I+gA2j5h9IiZyKdTmxANvlFTT0AlZMqWFilTk3BFyHA167lukHNTQqGvl8MUOV9oMGARmIyuAQkkpCRdlLUQVEi1gBq9tAu/wAslghaQUhOvLmzKueRzctfp32hzVVExYBSQpJAYApAym6lEkENl5bPq9tRqolUtbPlZgFMGYlJYkcqAA/V1dmitHM/dSyGSvvnlS0xJXMygZUgEgFXKkAOVqP6lNcq7WbSOTEhYKQohI06nv5n5WEaVM1ABSkBYWRnVnZyl+QJYKCBY3AJPkI+08ogfCfYRp9FqROJF1VcKXq5aUqOvr94xophlTUTAHCTzDqk2UO7h4qamQsg8iiPKFSZTG59CIRIrjpA5tKzm4BJJC8gYgad9+kT+P1dKl0yyjMkkE5Qq/QNaAuIOKFIpE08pRE0gpJDumWHAY9SLP2MRFHSFSVDMQUhx3bYd4WBaxBua8g3hNMTxKYuwUMg9B7C0ZYlIKEgFCg6XcFwbaiMpCpcxCUo5VfqSb6dDu8UleJapCOawGj9G66wQATXUWbr5UVg1UAptDFrLrB4J5gCRvEOuhzTFBGxtDKXhs4jKC7a2ibS9OXeHThxwn+D4WifmJNwztsI+Y5w7LRJM1C3DG28EYdiKaWWRqSQyW+8C4hxAmZJ8HwiCCq+zmIKsCSQu29EjwOnSVhS0FaUhyBr2ioxFFNPRLVLSJaxZQZn01b6xJYZPUhYcN2iopkoUixylN7tdzoIJqkOoAhLuJcKEhlptpmIO50hBPxRZsVW/N4p8ZmImSihUwIZmJuHF8ogPDMCTPli7Fn+cdSrF0u47X16dCvWeJKVKUJnSzci47R5YMRlg787sSktYly/yhpxFxaEyTLl3URZyCAD2BvA06eqqEtKkpQEsyEhkgtt+0J5WjDuH8tpBI6n9AmOF44ZKCtpZH+4hhtYRCYjNQuavwwb6k9/6egj0DE+E1SpCVqAAXYA6kHfs0RtLg65aFLKXCrA+R2hmUWsjM20sAIzZHcdF3RQLCUEB7bQxxaoaYlI0QlKfuYCmYknPLCVEKLJYbXAgaomFU1RO6ngHJWncCQOyckg9/KDpWmg9YAkGwb89IPkWLnXp+8FCts/KEzw+W51IDjYHfobH1iyppaJiMsy73YOX6dy3Q94kqJTDMrTYCz+kOsNryFFRJsD6FTJDd2EdMwuWRroDILHROqXBQVrKVqHIAlLuE8z2B1dwHPSOnGCjLpwJZDjmZyArq7EcwOnl3jOr4jARy2KQwIbQECJHF5pVMzJWWVdrlLgNo/p7xEEOcqlotDI6UOfgDp3XabKDJIUk5rsCSQdwc147JHYfSFvikaF09O2tn1D+0OMOkKWyh7H94vkUFsSxbG2jqSUWcEt0hBX2mEXY9YqwlgQCx/PeJSumqzFKgHG4iq7KpQ5cSls3D0zJmztZ7aQp4hpcqGQGF2PUixbtFDLxeTIOSdJKwsvmBAAazdb3ijRS0tSUBhzpT5BLlgOm7wqzwAlSRZc6jleJ08olW46w78fNK8Pwg4Nl3zB9fN4o+KuEk0tSpMklaFjMhtUt8QPUdIzwulWnnXLKgNwHHW5AYQeCUuDR+QEC7U5TyVS5iSQQ/aLOTUIEklKgFtd9YnuMaoqVLmSiGv8JdiLZfSBKOtXMQQQAoakC7dY66RbRu8OqrK+UChOnHMeZ2A/aKw4WCkzMtnY9InsNo8nONAXBMUc3iBa5YlqAbtaIB8yWYZWV68pXj2GBEpK0DnB12IO0TM/Fi4GVlD2i78XxAAbJTcPqTEZiUhP8TkLOBf1/tBGrQOD8Uc8IeVIVMuoP5xQYRnlIfKcvnpAUlASpodrkAocGxOvltHDi0flGKU9OolLqyoSiAo/yx2ckG2piupMMXKWAoMp3uLf9QRIwKaiYJ6VKzpygLUTolgAHhlxJhs+pQpSVzUzQkMgostyHZQ7Qhz9pFq2JPAcXGjdlY4xxPLE1KapRcpISBdKEsLlrudvKI+fisszkpSt5Tsl7AX18oEl00+StcuaCL86TqbdejGBp+GSwoBINz5+3aDvNqrDrpBiPHp2TbiTAFKxKVLQUjOkTfEHwZQ5Kj6DTuIVTWE1Shcapszg3FvI6RWS5AlSFLUbrQUXcnLYqSnZylw3eJTFp4VMCgABp27fKIvooj/lzEE/5TPChmN1BLnVicvoNYY0yLuXIG+j3tAVMLApH51hgUlQtsPeCbhbscgIW6KgKLnQe3YQTLqmCU9VZj9B94VCUpwltTGsw8xPQED2aHiinCJpRUueFZQd3HqWj5JRncpDZH3e2hPvt3gXD5Zt2UPnaKnDqIInENZV/N9vYwXCXqHthukJhPD5UQt37B/Qxa4fgJYMAPpGfDNOETVIOmqPq33itAaILyV5f4j8Qlc/aDhTmL4O0oqDZhePMqynK5ua4vcR6jxNiDSyBpfm7jtvEFRJCpgUuyXGY6O5u3eFP4Vr4aX+C5zvoiuI+F0/5ciZYLbM52ckj5NEVRTlSwCknNfQtptFbxhxZ4v8hKXlgjMxsw2B20gbhTBwuXOnTA0sJOQkOH84gBa2jLodKX6jqcfXgLrhQlzpMydNUTMD5LswSMzgnV2IjrT16aamqJyph50N4Vm6Zj/u6Nq8JOE8PXUzSlK0iWFkOom4JZg3XrGnGuHBE1NL4eRIu5L51Gzv0H3gW4HulP2m42mycgdB/wCeyVcKUqJikhSQQR8yXePRMQwGXJlL/kjOBmllrKSWcEwJwtwDnleIJvhkfDbMO+9ttOsdMXx9XjJw9c0s7KmhgUADbMCDfZoiRtYKqPmG4Ma4eXkZ9OP2SbDcMlLzfxK/DSNEJtm1Yk69ISrnJ/iFyZR5QWSTr1vGNXWzBMUla8zEgKCAC2xYktGeEcPz5y1KkKTmSCrnJDts7Fz5xAAVia2tEjQSPxcYCtqTAZ4QFZAVEOHUB7nYR5/IplTpipqiMxUSQNmtbtaG1Tj1Vk8KasoCgxCRlt0MC0KjTrzZSuWoaAgOfx44HOVULLk3OHlHbp9E5puH0zEuFF+mUke40hdjU0oPghXKANPf6xXUnGVNKloBlLcgggfpIOpZnGm8ec4pWvNVcKuS6dC/R4Jps8Klq5ySQ1e8zFTZqBLmoCUpa5DO0GyyLXZm69LR5UriuqVMKhMsb5TdIb/k7CKnAuKhOUhE5SULexHwqszF99d4rPDuqXTnjytx6LXi3hYz1eNKbOzEHdtwesRk3CJ0laDMlKQkDKCz3ubN+Wj15OlrxMce0K5klK0/+mSVJHQ7+n3iGPPBQxSeE/dVqD4onAZZEt2QgX2JmC5B0NkpD+cD/wCTmYgAMSQ4v7Q6VjailCVSwoJSEulgSEgJBIUCkqYAORtBFPXSQla1MAlLhBRlWtQLhKVSzkU9rFI0g3kk4T2SkAuf1UjSzVIVkVbb10aG6agpYAw1rsE/iU+NKQvNulWXm8lJ3HkNIQyqJaVZVApUxsrts8E2QFamnmaeUyoq53cdbx8qAGtGtHQqym0FKw8pGYjX1h7XUtGOZgOCsMIICXOyh97xTVE5P8teaxYfP/r2iYqOQGxY/WM11joCX0LwwZQzafxnb1fVtZ4YQsfoI9vz6wXW8RBcs5TlNt294gf83UtBllzZn33gfDgpQHUWPeONDlUP/lNq5OQnlZiSpiW62316tEfxbWzJaUy0uEBySC2YggH2B9XMVtFVSJQVNW6yxYfpS1ipRiCxKp8Yr/ozkyx0BDMO0Kcb4Tgw0WxivVNBWSJCkypUwTAWVmZ3zDQtvfTt3g7Hccnrp/AlWQBokNCjhajBXcaGziPS6qikCSE2M2ZysNn3iLoFL8WNoDXtvOD29foo3h/D5KpJIUZZTK5SVAHx7cpA1R08+0DYlXTZiEeMgu4UhRbQWUx6RX1HDNKhGUqyuwChqD32MJeMuICl6aTVAoADoOXMdXa2nrEtfubaOKdr3ADPvivY0fyT3C+K5UmkOY2SHbqdvnHkc7E1T6qZOJ+IkwRIolTAUkkp7q9RBc/hZaDnQkhLX32D/WIIvKQdKP4jczi7OcrChkBZOa8VGM8PmnoEzs+WZM+EA3I/GifoaqVbKq++u3aK+kXKqgqXM8VRA5CCxsNANBE7g1hNK64vEW8Hy/irOOFIYdJUuYyl59nNwX84qOMeGpUqiQQtPiFQypFiQ/SFKZUtB5ZmVYLZZgKS76k6D1Mc4lk1AMuZUNkUGl5FBSdiXI0JEDubSrF0TngMfg3Y7jsuvCmCTZqgkJcHS3vHT/EDg1VGUzB8Ky3qz/YxXcHTZmVJkqCW5S+z3tD7GcLVPllE5QW7F1B+9g/b5mJeWsFKvrJnB4Y+qHTrf2UZQyKKdIlfpXlmJVqSFulleWvvBdLwb4kmZMzACXoerREYZinhWWiYOhSl/q0NaniaqmSP4eS6EEHMotmI3ACfPV4ispUWqbFACx+eo5Pqmi+OJ0s5ApLIAS7PoBud4F//ADGsWq0wsewb6Rjw9wUtaUkg8xYFTi4IuzOQ0UXE+GSKaUlCJSAtSrKuVBKdS5JO4HqYA7BgBZZJlkviyp5SyST1L+8dFIct1j6IacO02eaCRYGFE0FeVpg8nw5I2IAjpVYZLnAFY5tlDX+8bzVuyRGtMm/kIroDY8ySy8Dmy3yELT0NjGq5BZlpI9IogYKlQ1r3IP4pzc0vP8Ypk+CQRzC6S2vnEl4ZLliz6/bpHtFTQpV2PbQ+YjyziHE1qnKlpAAllSQNQVOUlR6Frdr9YfHI8mgFsfDtdJIC1jb6n0XbDaDO2ZSZQ6qLk+g+7QvxczM3hyTlT1HxKuRc7O2gh4qQqalEtIBIRmUuWXZX9BZn5Q/Z40peHHlImiYAywS+he9j5Wh7S0kblZE7D5pTz09fp90p4lp1TAiQJaZTpz8hJJLHlOzb+kT9DSKTyLDkbgt+Wj0TiTHqZS5IUAFoSQT3sG+sDcV8Oy5lGJsuyz8R+gB845wDSks1IhAkc0hxFe/J/XokU0SZXNLSvMpuR2HcvrC/FEzysTSsjKOVIfKD9X7w/wCH8HClBF9gSblvWKLEuD1kEJUk+doW5zVkanVFzqGAonDcaE8JTUKMtjZSVKJcN1ezN6iMq3h2mUv+SpSnS+c/1fcQPimCLp52RYOV9e0W/CWCyADNmTWCRo/X/qIZH1C1qhiiD7JH55/dT2B4fKTJmomqImOEhDXdP6n039otMKnzEFctYBQUMQQBl5fV31iOTjEyXUzigIUgqdOcPoGzRP8AEPE1StaklpZU7lJPMDZgdhs0E27SNUC1hLhg/v8AZKcLSCtRGmc+zn7R7DwRRukzJQFi57joI8WoV+CcxHL00J8oueG+LjIW0tf8snVQNn3MNBABBXRvdqdMYmcgcHg90N/iegJq1KSCnOASD/VofpExS19SEeCiYrw1H4GCgX3Ygt6RcY1w/U1i/GPhlJ0IWDb06xK4cFS6gFSbylB0lwbW2vCLBwFThZGLJ5FK84OrQGkzJYSrZTM/Yg766RV1MwB3OjaW89e5gagm0k6SGP8ANN02uCDsekahZCVOkghRa4BULXD9yfaFSNooNW8PksAj3/cLzLEw5S9+X7w64KkpzvlD+HMuwfVEcjkNPCoBXeHDllHfKYjf8QD/APsoH/tD/wA5kcjkIHKbD8ym4p+Exb3j5HIh/CuKkl6wZQ6qjkchKXL8pRMnWDZMcjkMaqUi+q0jwziJRC5xBY+JMuNfjVHI5DouStL4Ua3+ypuC1H+Bn3NkqbtymMuIZyhSU6QogFLkOWJc3aORyHN5HutSAXqR/wAv+qha8uq/SLfCZ6jQSQVEjxFWJJ0Bjkcjn8rviHDvf7J/wgOc+f2i4VHI5CH8rzM3KneN5STIcgOxu19IhqH/APnmnfL9o5HIZFwVu/DT/pj7pbgIcJe+mvnA2OlpMxrfzEaeZjkchvRXdT/TP/vqpV3Ve/neGeHD4vKORyBS/hn4V6f/AIb/AOisf7h/5QNxHKSKsEJAJlXIGt9+sfI5Fc/Ms3Xf1j/db8BoBRNLBwosd994a4yopRLUCxfUWN03vH2OQJ5SdZ/un6L/2Q==' }],
    farmer: { fullName: 'Ganesh Jadhav' },
  },
  {
    _id: '4', cropName: 'Pomegranate',
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