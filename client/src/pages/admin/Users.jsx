import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatDate, getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/config/api'

// Dummy users for demo
const dummyUsers = [
  {
    _id: '1',
    fullName: 'Ramesh Patil',
    email: 'ramesh@example.com',
    phone: '9876543210',
    userType: 'farmer',
    district: 'Nashik',
    isVerified: true,
    isActive: true,
    isBanned: false,
    farmSize: 5,
    createdAt: '2024-01-15',
    lastLogin: '2024-12-10',
  },
  {
    _id: '2',
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543211',
    userType: 'buyer',
    district: 'Pune',
    isVerified: true,
    isActive: true,
    isBanned: false,
    createdAt: '2024-02-20',
    lastLogin: '2024-12-11',
  },
  {
    _id: '3',
    fullName: 'Sunil Jadhav',
    email: 'sunil@example.com',
    phone: '9876543212',
    userType: 'farmer',
    district: 'Sangli',
    isVerified: false,
    isActive: true,
    isBanned: false,
    farmSize: 8,
    createdAt: '2024-12-01',
    lastLogin: '2024-12-11',
  },
  {
    _id: '4',
    fullName: 'Ganesh More',
    email: 'ganesh@example.com',
    phone: '9876543213',
    userType: 'farmer',
    district: 'Nashik',
    isVerified: false,
    isActive: true,
    isBanned: false,
    farmSize: 3,
    createdAt: '2024-12-05',
    lastLogin: null,
  },
  {
    _id: '5',
    fullName: 'Vijay Shinde',
    email: 'vijay@example.com',
    phone: '9876543214',
    userType: 'buyer',
    district: 'Solapur',
    isVerified: true,
    isActive: false,
    isBanned: true,
    createdAt: '2024-03-10',
    lastLogin: '2024-11-25',
  },
]

const AdminUsers = () => {
  const [users, setUsers] = useState(dummyUsers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Stats
  const stats = {
    total: users.length,
    farmers: users.filter((u) => u.userType === 'farmer').length,
    buyers: users.filter((u) => u.userType === 'buyer').length,
    unverified: users.filter((u) => !u.isVerified && u.userType === 'farmer').length,
    banned: users.filter((u) => u.isBanned).length,
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    const matchesType = typeFilter === 'all' || user.userType === typeFilter

    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && user.isVerified) ||
      (verificationFilter === 'unverified' && !user.isVerified) ||
      (verificationFilter === 'banned' && user.isBanned)

    return matchesSearch && matchesType && matchesVerification
  })

  const handleVerifyUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, isVerified: true, verifiedAt: new Date() } : u
      )
    )
    toast.success('User verified successfully')
    setConfirmDialogOpen(false)
  }

  const handleBanUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, isBanned: true, isActive: false } : u
      )
    )
    toast.success('User banned successfully')
    setConfirmDialogOpen(false)
  }

  const handleUnbanUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, isBanned: false, isActive: true } : u
      )
    )
    toast.success('User unbanned successfully')
    setConfirmDialogOpen(false)
  }

  const handleDeleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId))
    toast.success('User deleted successfully')
    setConfirmDialogOpen(false)
  }

  const openConfirmDialog = (action, user) => {
    setSelectedUser(user)
    setConfirmAction(action)
    setConfirmDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all platform users
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Farmers', value: stats.farmers, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Buyers', value: stats.buyers, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Unverified', value: stats.unverified, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Banned', value: stats.banned, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="farmer">Farmers</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar?.url} />
                          <AvatarFallback
                            className={cn(
                              'text-sm',
                              user.userType === 'farmer'
                                ? 'bg-farmer-100 text-farmer-700'
                                : user.userType === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          user.userType === 'farmer'
                            ? 'bg-green-100 text-green-700'
                            : user.userType === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {user.district || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.isBanned ? (
                          <Badge className="bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Banned
                          </Badge>
                        ) : user.isVerified ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setDetailsDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {!user.isVerified && user.userType === 'farmer' && (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog('verify', user)}
                              className="text-green-600"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          {user.isBanned ? (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog('unban', user)}
                              className="text-blue-600"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog('ban', user)}
                              className="text-orange-600"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openConfirmDialog('delete', user)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback
                      className={cn(
                        'text-xl',
                        selectedUser.userType === 'farmer'
                          ? 'bg-farmer-100 text-farmer-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {getInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          selectedUser.userType === 'farmer'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {selectedUser.userType}
                      </Badge>
                      {selectedUser.isVerified ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </p>
                    <p className="text-sm font-medium">+91 {selectedUser.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      District
                    </p>
                    <p className="text-sm font-medium">
                      {selectedUser.district || 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  {selectedUser.userType === 'farmer' && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Farm Size</p>
                      <p className="text-sm font-medium">
                        {selectedUser.farmSize || 'N/A'} acres
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium">
                      {selectedUser.lastLogin
                        ? formatDate(selectedUser.lastLogin)
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {!selectedUser.isVerified && selectedUser.userType === 'farmer' && (
                  <Button
                    variant="farmer"
                    onClick={() => {
                      handleVerifyUser(selectedUser._id)
                      setDetailsDialogOpen(false)
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Verify Farmer
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'verify' && 'Verify User'}
              {confirmAction === 'ban' && 'Ban User'}
              {confirmAction === 'unban' && 'Unban User'}
              {confirmAction === 'delete' && 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'verify' &&
                `Are you sure you want to verify ${selectedUser?.fullName}?`}
              {confirmAction === 'ban' &&
                `Are you sure you want to ban ${selectedUser?.fullName}? They will not be able to access the platform.`}
              {confirmAction === 'unban' &&
                `Are you sure you want to unban ${selectedUser?.fullName}?`}
              {confirmAction === 'delete' &&
                `Are you sure you want to permanently delete ${selectedUser?.fullName}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={
                confirmAction === 'delete'
                  ? 'destructive'
                  : confirmAction === 'ban'
                  ? 'destructive'
                  : 'farmer'
              }
              onClick={() => {
                if (confirmAction === 'verify') handleVerifyUser(selectedUser._id)
                if (confirmAction === 'ban') handleBanUser(selectedUser._id)
                if (confirmAction === 'unban') handleUnbanUser(selectedUser._id)
                if (confirmAction === 'delete') handleDeleteUser(selectedUser._id)
              }}
            >
              {confirmAction === 'verify' && 'Verify'}
              {confirmAction === 'ban' && 'Ban User'}
              {confirmAction === 'unban' && 'Unban'}
              {confirmAction === 'delete' && 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminUsers