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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatDate, getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/config/api'

// Dummy users have been removed, fetching from backend instead
const AdminUsers = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', verificationFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('type', 'farmer') // Force query to pull only farmers
      if (searchTerm) params.append('search', searchTerm)
      if (verificationFilter && verificationFilter !== 'all') params.append('status', verificationFilter)
      
      const res = await api.get(`/admin/users?${params.toString()}`)
      return res.data.data.users
    }
  })

  const users = usersData || []

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBanned).length,
    unverified: users.filter((u) => !u.isVerified).length,
    banned: users.filter((u) => u.isBanned).length,
  }

  // Filter users (Local fallback, though API already filters)
  const filteredUsers = users

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      return api.patch(`/admin/users/${id}/status`, { action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      setConfirmDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error updating user')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries(['admin-users'])
      setConfirmDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error deleting user')
    }
  })

  const handleVerifyUser = (userId) => {
    updateStatusMutation.mutate({ id: userId, action: 'verify' })
    toast.success('Verifying user...')
  }

  const handleBanUser = (userId) => {
    updateStatusMutation.mutate({ id: userId, action: 'ban' })
    toast.success('Banning user...')
  }

  const handleUnbanUser = (userId) => {
    updateStatusMutation.mutate({ id: userId, action: 'unban' })
    toast.success('Unbanning user...')
  }

  const handleDeleteUser = (userId) => {
    deleteMutation.mutate(userId)
    toast.success('Deleting user...')
  }

  const openConfirmDialog = (action, user) => {
    setSelectedUser(user)
    setConfirmAction(action)
    setConfirmDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farmers Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and verify registered farmers</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-500">Active</p>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-500">Pending</p>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.unverified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-500">Banned</p>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.banned}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Farm Size</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Loading farmers...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No farmers found.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-background">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar?.url} />
                            <AvatarFallback className="bg-farmer-100 text-farmer-700 text-sm">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.district ? `${user.district}, MH` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.farmSize ? `${user.farmSize} acres` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!user.isBanned}
                              onCheckedChange={() => 
                                openConfirmDialog(user.isBanned ? 'unban' : 'ban', user)
                              }
                              className="scale-75 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                            <span className={cn(
                              "text-xs font-medium",
                              user.isBanned ? "text-red-600" : "text-green-600"
                            )}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isVerified}
                              disabled={user.isVerified}
                              onCheckedChange={() => openConfirmDialog('verify', user)}
                              className="scale-75"
                            />
                            <span className={cn(
                              "text-[10px] uppercase tracking-wider font-bold",
                              user.isVerified ? "text-blue-600" : "text-muted-foreground"
                            )}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
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

                            {!user.isVerified && (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog('verify', user)}
                                className="text-green-600"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Verify Farmer
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </p>
                    <p className="text-sm font-medium">+91 {selectedUser.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      District
                    </p>
                    <p className="text-sm font-medium">
                      {selectedUser.district || 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  {selectedUser.userType === 'farmer' && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Farm Size</p>
                      <p className="text-sm font-medium">
                        {selectedUser.farmSize || 'N/A'} acres
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Last Login</p>
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