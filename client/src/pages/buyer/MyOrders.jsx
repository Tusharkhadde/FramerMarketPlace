import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  MapPin,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  Star,
  MessageCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import orderService from '@/services/order.service'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import Loading from '@/components/shared/Loading'

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
    label: 'Pending',
  },
  confirmed: {
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-700',
    label: 'Confirmed',
  },
  processing: {
    icon: Package,
    color: 'bg-purple-100 text-purple-700',
    label: 'Processing',
  },
  packed: {
    icon: Package,
    color: 'bg-indigo-100 text-indigo-700',
    label: 'Packed',
  },
  shipped: {
    icon: Truck,
    color: 'bg-cyan-100 text-cyan-700',
    label: 'Shipped',
  },
  delivered: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
    label: 'Delivered',
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    label: 'Cancelled',
  },
}

const MyOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  })
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (activeTab !== 'all') {
        params.status = activeTab
      }
      const response = await orderService.getMyOrders(params)
      setOrders(response.data.orders)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return

    try {
      await orderService.cancelOrder(orderToCancel._id, cancelReason)
      toast.success('Order cancelled successfully')
      setCancelDialogOpen(false)
      setOrderToCancel(null)
      setCancelReason('')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleReorder = async (orderId) => {
    try {
      await orderService.reorder(orderId)
      toast.success('Items added to cart')
      navigate('/cart')
    } catch (error) {
      toast.error('Failed to reorder')
    }
  }

  const getProgressSteps = (status) => {
    const steps = ['confirmed', 'processing', 'packed', 'shipped', 'delivered']
    const currentIndex = steps.indexOf(status)
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="py-16">
                <Loading fullScreen={false} />
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === 'all'
                      ? "You haven't placed any orders yet"
                      : `No ${activeTab} orders`}
                  </p>
                  <Button variant="farmer" onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onViewDetails={() => setSelectedOrder(order)}
                    onCancel={() => {
                      setOrderToCancel(order)
                      setCancelDialogOpen(true)
                    }}
                    onReorder={() => handleReorder(order._id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
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
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{orderToCancel?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status Progress */}
                {selectedOrder.orderStatus !== 'cancelled' && (
                  <div className="flex justify-between">
                    {getProgressSteps(selectedOrder.orderStatus).map(
                      (step, index) => (
                        <div
                          key={step.name}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              step.completed
                                ? 'bg-farmer-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            )}
                          >
                            {step.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <span className="text-xs mt-1 capitalize">
                            {step.name}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={
                            item.productSnapshot?.image ||
                            '/images/placeholder-product.jpg'
                          }
                          alt={item.productSnapshot?.cropName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.productSnapshot?.cropName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} kg × {formatPrice(item.pricePerKg)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.deliveryAddress?.fullName}
                    <br />
                    {selectedOrder.deliveryAddress?.addressLine1}
                    {selectedOrder.deliveryAddress?.addressLine2 &&
                      `, ${selectedOrder.deliveryAddress.addressLine2}`}
                    <br />
                    {selectedOrder.deliveryAddress?.city &&
                      `${selectedOrder.deliveryAddress.city}, `}
                    {selectedOrder.deliveryAddress?.district}, Maharashtra -{' '}
                    {selectedOrder.deliveryAddress?.pincode}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : 'Online Payment'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-farmer-600">
                      {formatPrice(selectedOrder.pricing?.total)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Order Card Component
const OrderCard = ({ order, onViewDetails, onCancel, onReorder }) => {
  const status = statusConfig[order.orderStatus]
  const StatusIcon = status?.icon || Package

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                Order #{order.orderNumber}
              </CardTitle>
              <CardDescription>
                Placed on {formatDate(order.createdAt)}
              </CardDescription>
            </div>
            <Badge className={cn('w-fit', status?.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Items Preview */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, index) => (
                <img
                  key={index}
                  src={
                    item.productSnapshot?.image ||
                    item.product?.images?.[0]?.url ||
                    '/images/placeholder-product.jpg'
                  }
                  alt={item.productSnapshot?.cropName}
                  className="w-12 h-12 object-cover rounded-lg border-2 border-white"
                />
              ))}
              {order.items.length > 3 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-sm font-medium text-gray-500">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </p>
              <p className="font-semibold text-farmer-600">
                {formatPrice(order.pricing?.total)}
              </p>
            </div>
          </div>

          {/* Expected Delivery */}
          {order.orderStatus !== 'delivered' &&
            order.orderStatus !== 'cancelled' && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                Expected: {formatDate(order.estimatedDelivery)}
              </div>
            )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {order.orderStatus === 'delivered' && (
              <>
                <Button variant="outline" size="sm" onClick={onReorder}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reorder
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="w-4 h-4 mr-1" />
                  Rate
                </Button>
              </>
            )}

            {['pending', 'confirmed'].includes(order.orderStatus) && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={onCancel}
              >
                Cancel Order
              </Button>
            )}

            {order.orderStatus === 'shipped' && (
              <Button variant="outline" size="sm">
                <Truck className="w-4 h-4 mr-1" />
                Track
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MyOrders