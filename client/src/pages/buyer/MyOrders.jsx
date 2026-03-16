import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Star,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const MyOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [orderToCancel, setOrderToCancel] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders/my-orders')
      setOrders(response.data.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filter === 'all' || order.status === filter
    const matchesDate = !dateFilter || new Date(order.createdAt).toDateString() === dateFilter.toDateString()
    return matchesStatus && matchesDate
  })

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    try {
      await api.patch(`/orders/${orderToCancel._id}/cancel`)
      toast.success('Order cancelled successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    } finally {
      setOrderToCancel(null)
    }
  }

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
          <div className="flex-1">
            <Label className="mb-2 block">Filter by Status</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All', count: stats.all },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'processing', label: 'Processing', count: stats.processing },
                { key: 'delivered', label: 'Delivered', count: stats.delivered },
                { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === tab.key
                      ? 'bg-farmer-500 text-white'
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Label className="mb-2 block">Filter by Date</Label>
            <div className="flex gap-2">
              <DatePicker
                date={dateFilter}
                setDate={setDateFilter}
                placeholder="All Dates"
              />
              {dateFilter && (
                <Button variant="ghost" onClick={() => setDateFilter(null)}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all'
                  ? "You haven't placed any orders yet"
                  : `No ${filter} orders`}
              </p>
              {filter === 'all' && (
                <Button onClick={() => navigate('/products')}>
                  Start Shopping
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={() => setOrderToCancel(order)}
              />
            ))}
          </div>
        )}

        {/* Cancel Order Dialog */}
        <Dialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel order #
                {orderToCancel?.orderNumber || orderToCancel?._id.slice(-8)}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setOrderToCancel(null)}>
                No, Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder}>
                Yes, Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Order Card Component
const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate()

  const statusConfig = {
    pending: { icon: Clock, color: 'yellow', label: 'Pending' },
    confirmed: { icon: CheckCircle, color: 'blue', label: 'Confirmed' },
    processing: { icon: Package, color: 'purple', label: 'Processing' },
    shipped: { icon: Truck, color: 'indigo', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'green', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'red', label: 'Cancelled' },
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">
                  Order #{order.orderNumber || order._id.slice(-8)}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-${status.color}-100 text-${status.color}-700`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-farmer-600">
                {formatPrice(order.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                  <DrawerHeader>
                    <DrawerTitle>Order Summary</DrawerTitle>
                    <DrawerDescription>
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-12 overflow-y-auto max-h-[60vh]">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-2 rounded-lg border">
                          <img
                            src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                            alt={item.product.cropName}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product.cropName}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} kg × {formatPrice(item.price)}
                            </p>
                            <p className="text-sm font-bold text-farmer-600">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Delivery Details</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {order.deliveryAddress.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.addressLine1}
                        {order.deliveryAddress.addressLine2 &&
                          `, ${order.deliveryAddress.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.city},{' '}
                        {order.deliveryAddress.district} -{' '}
                        {order.deliveryAddress.pincode}
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        Go to Detailed View
                      </Button>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            {order.status === 'delivered' && (
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Rate & Review
              </Button>
            )}

            {order.status === 'pending' && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onCancel}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MyOrders