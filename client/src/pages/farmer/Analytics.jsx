import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Package,
  Calendar,
  Filter,
  Download,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowUpRight,
  PieChart as PieChartIcon,
} from 'lucide-react'
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
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/config/api'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const FarmerAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    salesOverTime: [],
    topProducts: [],
    statusDistribution: [],
    recentOrders: [],
  })
  const [timeRange, setTimeRange] = useState('30days')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get(`/users/farmer/analytics?range=${timeRange}`),
        api.get('/orders/farmer/recent?limit=10')
      ])
      setData({
        ...analyticsRes.data.data,
        recentOrders: ordersRes.data.data.orders || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const overallStats = [
    {
      title: 'Total Revenue',
      value: formatPrice(data.salesOverTime.reduce((acc, curr) => acc + curr.revenue, 0)),
      change: '+12.5%',
      isPositive: true,
      icon: IndianRupee,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Total Orders',
      value: data.salesOverTime.reduce((acc, curr) => acc + curr.orders, 0),
      change: '+5.2%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Avg. Order Value',
      value: formatPrice(
        data.salesOverTime.length > 0
          ? data.salesOverTime.reduce((acc, curr) => acc + curr.revenue, 0) /
              (data.salesOverTime.reduce((acc, curr) => acc + curr.orders, 0) || 1)
          : 0
      ),
      change: '-2.4%',
      isPositive: false,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Active Listings',
      value: data.topProducts.length,
      change: 'Stable',
      isPositive: true,
      icon: Package,
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  if (loading && !data.salesOverTime.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Track your farm's performance and sales growth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="farmer" size="sm" onClick={fetchAnalytics}>
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="w-full">
        <Tabs defaultValue="30days" onValueChange={setTimeRange}>
          <div className="flex items-center justify-between pb-4">
            <TabsList>
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="year">1 Year</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overallStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                      "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                      stat.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {stat.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Revenue Over Time Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Gallery</CardTitle>
              <CardDescription>Visualizing your growth over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesOverTime}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="_id" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(val) => [formatPrice(val), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Breakdown</CardTitle>
              <CardDescription>Status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {data.statusDistribution.map((status, i) => (
                  <div key={status._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="capitalize">{status._id}</span>
                    </div>
                    <span className="font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products Table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Based on total revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 pt-0 font-medium">Product Name</th>
                      <th className="pb-3 pt-0 font-medium">Total Quantity</th>
                      <th className="pb-3 pt-0 font-medium text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.topProducts.map((product) => (
                      <tr key={product._id} className="group hover:bg-muted/50 transition-colors">
                        <td className="py-4 font-medium">{product.name || 'Unknown Product'}</td>
                        <td className="py-4 text-muted-foreground">{product.quantity} units</td>
                        <td className="py-4 text-right font-semibold">{formatPrice(product.revenue)}</td>
                      </tr>
                    ))}
                    {data.topProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-muted-foreground">
                          No sales data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders Table */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transactions from your buyers</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 pt-0 font-medium">Order ID / Date</th>
                      <th className="pb-3 pt-0 font-medium">Buyer</th>
                      <th className="pb-3 pt-0 font-medium">Status</th>
                      <th className="pb-3 pt-0 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.recentOrders?.map((order) => {
                      // Calculate total for just this farmer's items in the order
                      // We default to order.pricing.total if items are missing for some reason, but they shouldn't be.
                      const farmerTotal = order.items?.reduce((sum, item) => sum + item.subtotal, 0) || order.pricing?.total || 0;
                      
                      return (
                        <tr key={order._id} className="group hover:bg-muted/50 transition-colors">
                          <td className="py-4">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4">
                            <p className="font-medium">{order.buyer?.fullName || 'Guest Buyer'}</p>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2.5 py-1 text-xs font-medium rounded-full",
                              {
                                'bg-yellow-100 text-yellow-700': order.orderStatus === 'pending',
                                'bg-blue-100 text-blue-700': ['confirmed', 'processing', 'packed', 'shipped'].includes(order.orderStatus),
                                'bg-green-100 text-green-700': order.orderStatus === 'delivered',
                                'bg-red-100 text-red-700': order.orderStatus === 'cancelled',
                              }
                            )}>
                              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 text-right font-semibold">
                            {formatPrice(farmerTotal)}
                          </td>
                        </tr>
                      )
                    })}
                    {(!data.recentOrders || data.recentOrders.length === 0) && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-muted-foreground">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}

export default FarmerAnalytics
