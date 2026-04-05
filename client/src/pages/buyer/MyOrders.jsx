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
  MapPin,
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-white/70">Track and manage your orders</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
          <div className="flex-1">
            <Label className="mb-2 block text-white/90">Filter by Status</Label>
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
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === tab.key
                    ? 'bg-farmer-500 text-white'
                    : 'bg-card text-gray-300 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Label className="mb-2 block text-white/90">Filter by Date</Label>
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
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No orders found
              </h3>
              <p className="text-muted-foreground mb-4">
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
              <p className="text-sm text-white/70">
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
                {formatPrice(order.pricing?.total || order.totalAmount || 0)}
              </p>
              <p className="text-sm text-white/70">{order.items.length} item(s)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 rounded-xl hover:bg-zinc-50 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-xl">
                  <DrawerHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 bg-farmer-50 rounded-2xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-farmer-600" />
                      </div>
                    </div>
                    <DrawerTitle className="text-2xl font-bold">Order Summary</DrawerTitle>
                    <DrawerDescription className="text-sm font-medium text-zinc-500">
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="p-6 pb-10 overflow-y-auto max-h-[70vh]">
                    {/* Status Badge */}
                    <div className="flex justify-center mb-8">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-100`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-8">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Items</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-3 rounded-2xl border border-zinc-100 bg-card shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={item.product?.images?.[0]?.url || item.productSnapshot?.image || '/placeholder.jpg'}
                            alt={item.product?.cropName || item.productSnapshot?.cropName}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="font-bold text-zinc-900">{item.product?.cropName || item.productSnapshot?.cropName}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-zinc-500">
                                {item.quantity} kg × {formatPrice(item.pricePerKg || item.productSnapshot?.pricePerKg)}
                              </p>
                              <p className="text-base font-bold text-farmer-600">
                                {formatPrice(item.subtotal || (item.quantity * (item.pricePerKg || item.productSnapshot?.pricePerKg)))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4 pt-6 border-t border-zinc-100">
                      {/* Delivery Address */}
                      <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-zinc-400" />
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Delivery Details</p>
                        </div>
                        <p className="text-sm text-zinc-900 font-bold mb-1">
                          {order.deliveryAddress.fullName}
                        </p>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {order.deliveryAddress.addressLine1}
                          {order.deliveryAddress.addressLine2 &&
                            `, ${order.deliveryAddress.addressLine2}`}<br />
                          {order.deliveryAddress.city}, {order.deliveryAddress.district} - {order.deliveryAddress.pincode}
                        </p>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-card p-4 rounded-2xl border border-zinc-100 shadow-sm">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">Pricing Breakdown</p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Subtotal</span>
                            <span className="font-medium">{formatPrice(order.pricing?.subtotal || order.totalAmount)}</span>
                          </div>
                          {order.pricing?.deliveryCharges > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Delivery</span>
                              <span className="font-medium">{formatPrice(order.pricing.deliveryCharges)}</span>
                            </div>
                          )}
                          {order.pricing?.tax > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Tax</span>
                              <span className="font-medium">{formatPrice(order.pricing.tax)}</span>
                            </div>
                          )}
                          <div className="h-px bg-zinc-100 my-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-zinc-900">Total</span>
                            <span className="text-xl font-black text-farmer-600">
                              {formatPrice(order.pricing?.total || order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-xl h-12 font-semibold text-zinc-500 hover:text-zinc-900"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        Close
                      </Button>
                      <Button
                        className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-farmer-200 bg-farmer-600 hover:bg-farmer-700 transition-all hover:-translate-y-0.5"
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