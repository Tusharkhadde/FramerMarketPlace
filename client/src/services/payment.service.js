import api from '@/config/api'

const paymentService = {
  // Create Razorpay order
  createOrder: async (amount) => {
    const response = await api.post('/payment/create-order', { amount })
    return response.data
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payment/verify', paymentData)
    return response.data
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/payment/${paymentId}`)
    return response.data
  },

  // Request refund
  requestRefund: async (paymentId, amount, reason) => {
    const response = await api.post(`/payment/${paymentId}/refund`, {
      amount,
      reason,
    })
    return response.data
  },
}

export default paymentService