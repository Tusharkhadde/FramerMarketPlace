import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Clock,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import api from '@/config/api'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

const FarmerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [salesData, setSalesData] = useState([])
  const [apmcPrices, setApmcPrices] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all dashboard data in parallel
      const [statsRes, ordersRes, productsRes, apmcRes] = await Promise.all([
        api.get('/users/farmer/stats'),
        api.get('/orders/farmer/recent?limit=5'),
        api.get('/products/my/products?limit=5'),
        api.get(`/apmc/district/${user?.district}?limit=5`),
      ])

      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.data.data.orders || [])
      setTopProducts(productsRes.data.data.products || [])
      setApmcPrices(apmcRes.data.data.prices || [])

      // Generate sample sales data for chart
      setSalesData(generateSalesData())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set dummy data for demo
      setStats({
        totalProducts: 12,
        activeOrders: 5,
        monthlyRevenue: 45000,
        pendingOrders: 3,
      })
      setSalesData(generateSalesData())
      setApmcPrices(dummyApmcPrices)
    } finally {
      setLoading(false)
    }
  }

  const generateSalesData = () => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 10) + 1,
      })
    }
    return data
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      change: '+2 this week',
      positive: true,
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: '3 pending',
      positive: null,
    },
    {
      title: 'Monthly Revenue',
      value: formatPrice(stats.monthlyRevenue),
      icon: IndianRupee,
      color: 'bg-green-500',
      change: '+12% from last month',
      positive: true,
    },
    {
      title: 'Pending Actions',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: 'Require attention',
      positive: false,
    },
  ]

  const orderStatusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your farm today.
          </p>
        </div>
        <Button variant="farmer" onClick={() => navigate('/farmer/products/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-1 flex items-center',
                        stat.positive === true && 'text-green-600',
                        stat.positive === false && 'text-red-600',
                        stat.positive === null && 'text-gray-500'
                      )}
                    >
                      {stat.positive === true && <TrendingUp className="w-3 h-3 mr-1" />}
                      {stat.positive === false && <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      stat.color
                    )}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Last 30 days revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, 'Sales']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>Daily order count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & APMC Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from buyers</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/farmer/orders')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-farmer-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-farmer-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length} items • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.pricing?.total)}
                      </p>
                      <Badge
                        className={cn(
                          'text-xs',
                          orderStatusColors[order.orderStatus]
                        )}
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* APMC Prices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>APMC Market Prices</CardTitle>
              <CardDescription>Current prices in {user?.district || 'your district'}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/farmer/market-prices')}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apmcPrices.length > 0 ? (
                apmcPrices.map((price, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{price.commodity}</p>
                      <p className="text-sm text-gray-500">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-farmer-600">
                        {formatPrice(price.modalPrice)}/quintal
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{price.minPrice} - ₹{price.maxPrice}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No price data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: 'Add Product',
                icon: Plus,
                color: 'bg-farmer-500',
                href: '/farmer/products/add',
              },
              {
                name: 'View Orders',
                icon: ShoppingCart,
                color: 'bg-blue-500',
                href: '/farmer/orders',
              },
              {
                name: 'Check Prices',
                icon: TrendingUp,
                color: 'bg-purple-500',
                href: '/farmer/market-prices',
              },
              {
                name: 'Analytics',
                icon: BarChart3,
                color: 'bg-orange-500',
                href: '/farmer/analytics',
              },
            ].map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex flex-col items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                    action.color
                  )}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dummy APMC prices for demo
const dummyApmcPrices = [
  { commodity: 'Tomato', market: 'Nashik APMC', modalPrice: 2500, minPrice: 2000, maxPrice: 3000 },
  { commodity: 'Onion', market: 'Nashik APMC', modalPrice: 1800, minPrice: 1500, maxPrice: 2100 },
  { commodity: 'Potato', market: 'Pune APMC', modalPrice: 1200, minPrice: 1000, maxPrice: 1400 },
  { commodity: 'Grapes', market: 'Nashik APMC', modalPrice: 4500, minPrice: 4000, maxPrice: 5000 },
  { commodity: 'Pomegranate', market: 'Solapur APMC', modalPrice: 8000, minPrice: 7000, maxPrice: 9000 },
]

export default FarmerDashboard