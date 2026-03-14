import { useState } from 'react'
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
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'

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

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen" // for full height
      )}
    >
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => {
                const isActive = location.pathname === link.href
                return (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: link.name,
                      href: link.href,
                      icon: (
                        <link.icon
                          className={cn(
                            "text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0",
                            isActive && "text-farmer-600 dark:text-farmer-400"
                          )}
                        />
                      ),
                    }}
                  />
                )
              })}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Add Product",
                href: "/farmer/products/add",
                icon: (
                  <Plus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
            <SidebarLink
              link={{
                label: user?.fullName || "User",
                href: "/farmer/profile",
                icon: (
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.fullName || 'F'}&background=random`}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 rounded-tl-2xl rounded-bl-2xl overflow-hidden shadow-sm">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center">
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {sidebarLinks.find(l => l.href === location.pathname)?.name || 'Dashboard'}
                 </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                      <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-farmer-500 transition-all">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-farmer-100 text-farmer-700 text-sm font-medium">
                          {getInitials(user?.fullName || 'F')}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 shadow-lg">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/farmer/profile')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/farmer/settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50 dark:bg-neutral-900 w-full h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

// Dummy dashboard component with content
export const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-farmer-500 dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        FarmMarket
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-farmer-500 dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export default DashboardLayout