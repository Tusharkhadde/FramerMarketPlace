import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import api from '@/config/api'
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Package,
  Heart,
  Bell,
  ChevronDown,
  Search,
  Leaf,
  TrendingUp,
  MapPin,
  Home,
  Store,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, signOut, isFarmer, isBuyer, isAdmin } = useAuth()
  const { cartCount } = useCart() // Changed from getCartCount() to cartCount

  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Socket.io integration
  useEffect(() => {
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket'], // Forces websocket to avoid polling 400 Bad Request errors in dev
        withCredentials: true,
      })
      
      socketInstance.on('connect', () => {
        console.log('🔌 Connected to notification server')
        socketInstance.emit('join', user._id)
      })

      socketInstance.on('new-notification', (data) => {
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(data.unreadCount)
        
        // Show toast for new notification
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
  }, [isAuthenticated, user])

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

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Store },
    { name: 'Market Prices', href: '/market-prices', icon: TrendingUp },
    { name: 'Farms', href: '/farms', icon: MapPin },
  ]

  const getDashboardLink = () => {
    if (isFarmer) return '/farmer/dashboard'
    if (isAdmin) return '/admin/dashboard'
    return '/orders'
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
          ? 'bg-background/70 backdrop-blur-xl border-border/50 shadow-sm'
          : 'bg-background/40 backdrop-blur-md border-border/20'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-farmer-500 to-farmer-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Farm<span className="text-farmer-600">Market</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-farmer-500/10 text-farmer-600'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-muted/40 border-border/50 focus:bg-background/80 transition-all duration-200 rounded-full"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart (for buyers) */}
                {isBuyer && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-farmer-500 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Button>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 transition-colors rounded-full">
                      <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-farmer-600 animate-pulse' : 'text-muted-foreground'}`} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
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
                            className={`p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-farmer-50/30' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-farmer-500' : 'bg-transparent'}`} />
                              <div className="flex-1">
                                <p className={`text-sm ${!notification.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
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
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent/50 rounded-full pl-1 pr-3">
                      <Avatar className="w-8 h-8 border border-border/50">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-farmer-500 text-white text-xs">
                          {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate text-sm font-medium text-foreground">
                        {user?.fullName?.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs bg-farmer-100 text-farmer-700 px-2 py-0.5 rounded capitalize">
                        {user?.userType}
                      </span>
                    </div>

                    <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>

                    {isBuyer && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/orders')}>
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </DropdownMenuItem>
                      
                      </>
                    )}

                    {isFarmer && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/farmer/products')}>
                          <Package className="w-4 h-4 mr-2" />
                          My Products
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/farmer/orders')}>
                          <Store className="w-4 h-4 mr-2" />
                          Orders
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate(isFarmer ? '/farmer/settings' : '/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-foreground">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && isBuyer && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-farmer-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </form>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = location.pathname === link.href
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center px-4 py-3 rounded-lg ${isActive
                            ? 'bg-farmer-100 text-farmer-700'
                            : 'text-foreground hover:bg-card'
                          }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {link.name}
                    </Link>
                  )
                })}
              </div>

              {/* Mobile User Section */}
              {isAuthenticated ? (
                <div className="border-t pt-4 space-y-1">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback className="bg-farmer-500 text-white">
                        {user?.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user?.userType}</p>
                    </div>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    className="flex items-center px-4 py-3 rounded-lg text-foreground hover:bg-card"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>

                  {isBuyer && (
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 rounded-lg text-foreground hover:bg-card"
                    >
                      <Package className="w-5 h-5 mr-3" />
                      My Orders
                    </Link>
                  )}

                  {isFarmer && (
                    <Link
                      to="/farmer/products"
                      className="flex items-center px-4 py-3 rounded-lg text-foreground hover:bg-card"
                    >
                      <Package className="w-5 h-5 mr-3" />
                      My Products
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar