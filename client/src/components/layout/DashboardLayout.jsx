import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import api from '@/config/api'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Leaf,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, getInitials } from '@/lib/utils'
import OnboardingWizard from '@/components/shared/OnboardingWizard'

const sidebarLinks = [
  {
    name: 'Dashboard',
    href: '/farmer/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Products',
    href: '/farmer/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/farmer/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Analytics',
    href: '/farmer/analytics',
    icon: BarChart3,
  },
  {
    name: 'Price Advisor',
    href: '/farmer/advisor',
    icon: Sparkles,
  },
  {
    name: 'Group Deals',
    href: '/farmer/deals',
    icon: Users,
  },
  {
    name: 'Market Prices',
    href: '/farmer/market-prices',
    icon: TrendingUp,
  },
  {
    name: 'Profile',
    href: '/farmer/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/farmer/settings',
    icon: Settings,
  },
]

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket'], // Forces websocket to avoid polling 400 Bad Request errors in dev
        withCredentials: true,
      })
      
      socketInstance.on('connect', () => {
        socketInstance.emit('join', user._id)
      })

      socketInstance.on('new-notification', (data) => {
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(data.unreadCount)
        
        toast.info(data.notification.title, {
          description: data.notification.content,
          action: {
            label: 'View',
            onClick: () => navigate(data.notification.link || '/notifications')
          }
        })
      })

      setSocket(socketInstance)
      fetchNotifications()

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.data.notifications)
      setUnreadCount(response.data.data.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-farmer-500 to-farmer-700 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">FarmMarket</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-card rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action */}
          <div className="p-4">
            <Button
              variant="farmer"
              className="w-full"
              onClick={() => navigate('/farmer/products/add')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.href)
                return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-farmer-50 text-farmer-700'
                      : 'text-foreground hover:bg-card'
                  )}
                >
                  <link.icon className={cn('w-5 h-5', isActive && 'text-farmer-600')} />
                  <span className="font-medium">{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-farmer-100 text-farmer-700">
                  {getInitials(user?.fullName || 'F')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-card rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 hover:bg-card rounded-lg transition-colors">
                    <Bell className={cn("w-5 h-5", unreadCount > 0 ? "text-farmer-600 animate-pulse" : "text-muted-foreground")} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                  <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-farmer-600 hover:text-farmer-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification._id}
                          onClick={() => {
                            handleMarkAsRead(notification._id)
                            if (notification.link) navigate(notification.link)
                          }}
                          className={cn("p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50", !notification.isRead && "bg-farmer-50/50")}
                        >
                          <div className="flex gap-3">
                            <div className={cn("mt-1 w-2 h-2 rounded-full flex-shrink-0", !notification.isRead ? "bg-farmer-500" : "bg-transparent")} />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm truncate", !notification.isRead ? "font-bold text-foreground" : "text-muted-foreground")}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.content}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 bg-muted/50 border-t text-center">
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 hover:bg-card rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback className="bg-farmer-100 text-farmer-700 text-sm">
                        {getInitials(user?.fullName || 'F')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.fullName}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/farmer/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/farmer/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <OnboardingWizard />
    </div>
  )
}

export default DashboardLayout