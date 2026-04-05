import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  BarChart3,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { formatPrice, formatDate, getInitials, cn } from '@/lib/utils'
import api from '@/config/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Stats data
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      positive: true,
      icon: Users,
      color: 'bg-blue-500',
      subtext: '45 new this week',
    },
    {
      title: 'Total Products',
      value: '856',
      change: '+8%',
      positive: true,
      icon: Package,
      color: 'bg-purple-500',
      subtext: '23 pending approval',
    },
    {
      title: 'Total Orders',
      value: '3,421',
      change: '+23%',
      positive: true,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      subtext: '89 active today',
    },
    {
      title: 'Revenue',
      value: '₹12,45,000',
      change: '+15%',
      positive: true,
      icon: IndianRupee,
      color: 'bg-green-500',
      subtext: 'This month',
    },
  ]

  // Chart data
  const revenueData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 500000) + 100000,
    orders: Math.floor(Math.random() * 500) + 100,
  }))

  const userTypeData = [
    { name: 'Farmers', value: 520, color: '#22c55e' },
    { name: 'Buyers', value: 680, color: '#3b82f6' },
    { name: 'Admin', value: 5, color: '#f59e0b' },
  ]

  const districtOrdersData = [
    { district: 'Nashik', orders: 450 },
    { district: 'Pune', orders: 380 },
    { district: 'Nagpur', orders: 320 },
    { district: 'Aurangabad', orders: 280 },
    { district: 'Kolhapur', orders: 250 },
    { district: 'Solapur', orders: 200 },
  ]

  // Recent activities
  const recentActivities = [
    {
      type: 'user',
      action: 'New farmer registration',
      name: 'Ramesh Patil',
      district: 'Nashik',
      time: '2 min ago',
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
    },
    {
      type: 'order',
      action: 'New order placed',
      name: 'Order #FM2412003',
      district: '₹2,500',
      time: '5 min ago',
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      type: 'product',
      action: 'Product listed',
      name: 'Fresh Tomatoes - 500kg',
      district: 'Grade A',
      time: '15 min ago',
      icon: Package,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      type: 'alert',
      action: 'Payment failed',
      name: 'Order #FM2412001',
      district: 'Retry needed',
      time: '30 min ago',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
    },
    {
      type: 'user',
      action: 'Farmer verified',
      name: 'Sunil Jadhav',
      district: 'Sangli',
      time: '1 hr ago',
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100',
    },
  ]

  // Pending verifications
  const pendingVerifications = [
    { name: 'Ganesh More', district: 'Nashik', date: 'Today', crops: 'Grapes, Onion' },
    { name: 'Vijay Shinde', district: 'Solapur', date: 'Today', crops: 'Pomegranate' },
    { name: 'Sanjay Pawar', district: 'Kolhapur', date: 'Yesterday', crops: 'Sugarcane' },
  ]

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>
        
        <Menubar className="hidden md:flex">
          <MenubarMenu>
            <MenubarTrigger>Management</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => navigate('/admin/users')}>
                Users <MenubarShortcut>⌘U</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => navigate('/admin/products')}>
                Products <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => navigate('/admin/orders')}>
                Orders <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => navigate('/admin/apmc')}>
                APMC Data
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Settings</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Platform Settings</MenubarItem>
              <MenubarItem>Security Audit</MenubarItem>
              <MenubarItem>Manage Admins</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Reports</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Revenue Report</MenubarItem>
              <MenubarItem>Verification Log</MenubarItem>
              <MenubarItem>User Activity</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-medium flex items-center gap-0.5',
                          stat.positive ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {stat.positive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.subtext}
                      </span>
                    </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue & orders</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                This Year
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders',
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>By account type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {userTypeData.map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {type.name} ({type.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-background transition-colors"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      activity.color
                    )}
                  >
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-muted-foreground">{activity.name}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{activity.district}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Farmers awaiting approval</CardDescription>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingVerifications.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVerifications.map((farmer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-xl"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-farmer-100 text-farmer-700 text-sm">
                      {getInitials(farmer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {farmer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {farmer.district} • {farmer.crops}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{farmer.date}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => navigate('/admin/users')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/admin/users')}
            >
              View All Users
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Orders by District */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by District</CardTitle>
          <CardDescription>Top performing districts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtOrdersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="district"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  fill="#22c55e"
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-blue-500' },
              { name: 'View Orders', icon: ShoppingCart, href: '/admin/orders', color: 'bg-orange-500' },
              { name: 'Upload APMC Data', icon: TrendingUp, href: '/admin/apmc', color: 'bg-purple-500' },
              { name: 'Generate Reports', icon: BarChart3, href: '/admin/reports', color: 'bg-green-500' },
            ].map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center p-5 border rounded-xl hover:bg-background hover:shadow-md transition-all group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform',
                    action.color
                  )}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {action.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard