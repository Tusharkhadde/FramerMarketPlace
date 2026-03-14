import api from '@/config/api'

const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  // Get buyer's orders
  getMyOrders: async (params = {}) => {
    const queryParams = new URLSearchParams(params)
    const response = await api.get(`/orders/my-orders?${queryParams.toString()}`)
    return response.data
  },

  // Get single order
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.patch(`/orders/${orderId}/cancel`, { reason })
    return response.data
  },

  // Get farmer's orders
  getFarmerOrders: async (params = {}) => {
    const queryParams = new URLSearchParams(params)
    const response = await api.get(`/orders/farmer/orders?${queryParams.toString()}`)
    return response.data
  },

  // Update order status (for farmers)
  updateOrderStatus: async (orderId, status, note) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status, note })
    return response.data
  },

  // Get order tracking
  getOrderTracking: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/tracking`)
    return response.data
  },

  // Reorder (add same items to cart)
  reorder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/reorder`)
    return response.data
  },
}

export default orderService