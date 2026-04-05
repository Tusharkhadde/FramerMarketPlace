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
  AreaChart,
  Area,
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
      const [statsRes, ordersRes, productsRes, apmcRes, analyticsRes] = await Promise.all([
        api.get('/users/farmer/stats'),
        api.get('/orders/farmer/recent?limit=5'),
        api.get('/products/my/products?limit=5'),
        api.get(`/apmc/district/${user?.district}?limit=5`),
        api.get('/users/farmer/analytics?range=30days'),
      ])

      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.data.data.orders || [])
      setTopProducts(productsRes.data.data.products || [])
      setApmcPrices(apmcRes.data.data.prices || [])
      
      const sales = analyticsRes.data.data.salesOverTime || []
      setSalesData(sales.map(s => ({
        date: new Date(s._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        sales: s.revenue,
        orders: s.orders
      })))
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
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-r from-farmer-600/10 to-transparent p-6 md:p-8 rounded-[2rem] border border-farmer-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-64 h-64 bg-farmer-500/10 rounded-full blur-3xl mix-blend-multiply" />
        <div className="relative z-10">
          <Badge className="bg-card shadow-sm text-farmer-700 hover:bg-card px-3 py-1 mb-4 border-none uppercase tracking-widest text-[10px] font-bold">
            Farmer Dashboard
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Welcome back, <span className="text-farmer-600">{user?.fullName?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Here's what's happening with your farm today.
          </p>
        </div>
        <Button variant="farmer" className="rounded-full shadow-lg shadow-farmer-500/25 px-8 h-12 relative z-10" onClick={() => navigate('/farmer/products/add')}>
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', bounce: 0.4 }}
          >
            <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full mix-blend-multiply opacity-10 group-hover:opacity-20 transition-opacity blur-2xl" style={{ backgroundColor: stat.color.replace('bg-', '') }} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">
                      {stat.value}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-3 flex items-center font-bold px-2 py-1 rounded-full w-fit',
                        stat.positive === true && 'bg-green-500/20 text-green-400',
                        stat.positive === false && 'bg-red-500/20 text-red-400',
                        stat.positive === null && 'bg-gray-500/20 text-gray-300'
                      )}
                    >
                      {stat.positive === true && <TrendingUp className="w-3 h-3 mr-1" />}
                      {stat.positive === false && <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner',
                      stat.color
                    )}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
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
        <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-card/50 backdrop-blur-sm border-b border-white/5 p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-500" />
              Sales Overview
            </CardTitle>
            <CardDescription>Revenue trajectory over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData.length > 0 ? salesData : [{date: 'Today', sales: 0}]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-card/50 backdrop-blur-sm border-b border-white/5 p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Orders Overview
            </CardTitle>
            <CardDescription>Daily order volume count</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.length > 0 ? salesData.slice(-14) : [{date: 'Today', orders: 0}]}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa', tickCount: 5 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 'bold'
                    }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="orders" fill="url(#colorOrders)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & APMC Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <CardDescription>Latest orders from your buyers</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate('/farmer/orders')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-farmer-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-farmer-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length} items • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
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
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* APMC Prices */}
        <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-xl">APMC Market</CardTitle>
              <CardDescription>Live prices in {user?.district || 'your district'}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
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
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{price.commodity}</p>
                      <p className="text-sm text-muted-foreground">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-farmer-600">
                        {formatPrice(price.modalPrice)}/quintal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{price.minPrice} - ₹{price.maxPrice}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No price data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/30">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Frequent management tools</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                className="group flex flex-col items-center p-6 bg-background rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300',
                    action.color
                  )}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80">
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