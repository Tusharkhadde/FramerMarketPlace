import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  ]

  const getDashboardLink = () => {
    if (isFarmer) return '/farmer/dashboard'
    if (isAdmin) return '/admin/dashboard'
    return '/orders'
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-card/95 backdrop-blur-md shadow-md'
          : 'bg-card/80 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-farmer-500 to-farmer-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">
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
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-farmer-100 text-farmer-700'
                      : 'text-zinc-900 hover:bg-zinc-100'
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
                className="pl-10 pr-4 w-full"
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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-farmer-500 text-white">
                          {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate text-sm font-medium">
                        {user?.fullName?.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
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
                        <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                          <Heart className="w-4 h-4 mr-2" />
                          Wishlist
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

                    <DropdownMenuItem onClick={() => navigate('/settings')}>
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
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-zinc-900">
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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