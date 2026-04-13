import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import api from '@/config/api'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Leaf,
  Shield,
  FileText,
  BarChart3,
  Database,
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
import { Badge } from '@/components/ui/badge'
import { cn, getInitials } from '@/lib/utils'

const adminLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Farmers', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        withCredentials: true,
      })

      socket.on('connect', () => {
        socket.emit('join', user._id)
      })

      socket.on('new-notification', (data) => {
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(data.unreadCount)
        toast.info(data.notification.title, {
          description: data.notification.content,
        })
      })

      fetchNotifications()

      return () => socket.disconnect()
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

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Overlay */}
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-background text-foreground transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-farmer-500 to-farmer-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">FarmMarket</span>
                <Badge className="ml-2 bg-red-500 text-[10px] px-1.5 py-0">
                  Admin
                </Badge>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-card rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Main Menu
            </p>
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
                      isActive
                        ? 'bg-farmer-600 text-white shadow-lg shadow-farmer-600/30'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                  {link.name === 'Farmers' && (
                    <Badge className="ml-auto bg-green-500 text-[10px]">New</Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 p-3 bg-card rounded-xl">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-farmer-600 text-white">
                  {getInitials(user?.fullName || 'A')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-card rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-foreground">
                {adminLinks.find((l) => l.href === location.pathname)?.name || 'Admin'}
              </h2>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 hover:bg-card rounded-lg transition-colors">
                    <Bell className={cn("w-5 h-5 transition-colors", unreadCount > 0 ? "text-farmer-600 animate-pulse" : "text-muted-foreground")} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden glass-premium border-farmer-500/20 shadow-2xl">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <h3 className="font-bold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-farmer-500 hover:text-farmer-600 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification._id}
                          onClick={() => {
                            handleMarkAsRead(notification._id)
                            if (notification.link) navigate(notification.link)
                          }}
                          className={cn(
                            "p-4 border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                            !notification.isRead ? "bg-farmer-500/5" : ""
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                              !notification.isRead ? "bg-farmer-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-transparent"
                            )} />
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm",
                                !notification.isRead ? "font-bold text-foreground" : "text-muted-foreground"
                              )}>
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
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 hover:bg-card rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-farmer-600 text-white text-sm">
                        {getInitials(user?.fullName || 'A')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
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
    </div>
  )
}

export default AdminLayout