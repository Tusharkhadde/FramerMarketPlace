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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const MyOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Orders', count: stats.all },
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
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
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
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Order Card Component
const OrderCard = ({ order }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">
                  Order #{order.orderNumber || order._id.slice(-8)}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-${status.color}-100 text-${status.color}-700`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
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
              <p className="text-sm text-gray-500">
                {order.items.length} item(s)
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <img
                  src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                  alt={item.product.cropName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.cropName}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} kg × {formatPrice(item.price)}
                  </p>
                  <p className="text-sm font-semibold text-farmer-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium mb-1">Delivery Address</p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.addressLine1}
              {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
            </p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.city}, {order.deliveryAddress.district} - {order.deliveryAddress.pincode}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${order._id}`)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            {order.status === 'delivered' && (
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Rate & Review
              </Button>
            )}

            {order.status === 'pending' && (
              <Button variant="outline" className="text-red-600 hover:text-red-700">
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