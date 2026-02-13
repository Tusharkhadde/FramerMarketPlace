import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Textarea } from '@/components/ui/textarea'
import orderService from '@/services/order.service'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-700', label: 'Processing' },
  packed: { color: 'bg-indigo-100 text-indigo-700', label: 'Packed' },
  shipped: { color: 'bg-cyan-100 text-cyan-700', label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
}

const statusActions = {
  confirmed: [
    { value: 'processing', label: 'Start Processing' },
    { value: 'cancelled', label: 'Cancel' },
  ],
  processing: [
    { value: 'packed', label: 'Mark as Packed' },
    { value: 'cancelled', label: 'Cancel' },
  ],
  packed: [
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'cancelled', label: 'Cancel' },
  ],
  shipped: [{ value: 'delivered', label: 'Mark as Delivered' }],
}

const FarmerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await orderService.getFarmerOrders(params)
      setOrders(response.data.orders)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    setUpdating(true)
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus, statusNote)
      toast.success('Order status updated')
      setUpdateDialogOpen(false)
      setSelectedOrder(null)
      setNewStatus('')
      setStatusNote('')
      fetchOrders(pagination.currentPage)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) =>
        ['confirmed', 'processing'].includes(o.orderStatus)
      ).length,
      shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
      delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    }
  }

  const stats = getOrderStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage orders from buyers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-blue-600' },
          {
            label: 'Pending',
            value: stats.pending,
            color: 'text-yellow-600',
          },
          { label: 'Shipped', value: stats.shipped, color: 'text-cyan-600' },
          {
            label: 'Delivered',
            value: stats.delivered,
            color: 'text-green-600',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-farmer-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyer?.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {order.deliveryAddress?.district}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <img
                              key={idx}
                              src={
                                item.productSnapshot?.image ||
                                '/images/placeholder-product.jpg'
                              }
                              alt={item.productSnapshot?.cropName}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ))}
                          {order.items?.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(
                          order.items?.reduce((sum, item) => sum + item.subtotal, 0)
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[order.orderStatus]?.color}>
                          {statusConfig[order.orderStatus]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {statusActions[order.orderStatus] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setUpdateDialogOpen(true)
                              }}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 1}
            onClick={() => fetchOrders(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchOrders(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder && !updateDialogOpen}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Buyer Info */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Buyer Details</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.buyer?.fullName}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <a
                        href={`tel:${selectedOrder.buyer?.phone}`}
                        className="text-sm text-farmer-600 flex items-center"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {selectedOrder.buyer?.phone}
                      </a>
                    </div>
                  </div>
                  <Badge className={statusConfig[selectedOrder.orderStatus]?.color}>
                    {statusConfig[selectedOrder.orderStatus]?.label}
                  </Badge>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-farmer-600" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.deliveryAddress?.fullName}
                    <br />
                    {selectedOrder.deliveryAddress?.addressLine1}
                    {selectedOrder.deliveryAddress?.addressLine2 &&
                      `, ${selectedOrder.deliveryAddress.addressLine2}`}
                    <br />
                    {selectedOrder.deliveryAddress?.city &&
                      `${selectedOrder.deliveryAddress.city}, `}
                    {selectedOrder.deliveryAddress?.district} -{' '}
                    {selectedOrder.deliveryAddress?.pincode}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Your Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.productSnapshot?.image ||
                              '/images/placeholder-product.jpg'
                            }
                            alt={item.productSnapshot?.cropName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">
                              {item.productSnapshot?.cropName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} kg × {formatPrice(item.pricePerKg)}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Schedule */}
                {selectedOrder.deliverySchedule?.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-farmer-600" />
                    Scheduled for:{' '}
                    {formatDate(selectedOrder.deliverySchedule.date)} (
                    {selectedOrder.deliverySchedule.timeSlot})
                  </div>
                )}

                {/* Actions */}
                {statusActions[selectedOrder.orderStatus] && (
                  <DialogFooter>
                    <Button
                      variant="farmer"
                      onClick={() => setUpdateDialogOpen(true)}
                    >
                      Update Status
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusActions[selectedOrder?.orderStatus]?.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note (Optional)</label>
              <Textarea
                placeholder="Add a note about this update..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpdateDialogOpen(false)
                setNewStatus('')
                setStatusNote('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="farmer"
              onClick={handleUpdateStatus}
              disabled={!newStatus || updating}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FarmerOrders