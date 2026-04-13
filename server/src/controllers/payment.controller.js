import Order from '../models/Order.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'

// @desc    Create Razorpay Order (Demo simulated)
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { orderId, amount } = req.body

  // For Demo: we just return a mock razorpay order id
  const demoRazorpayOrder = {
    razorpayOrderId: `order_demo_${Math.random().toString(36).substring(7)}`,
    amount: amount * 100, // amount in paise
    currency: 'INR',
    orderId: orderId
  }

  return sendResponse(res, 200, demoRazorpayOrder, 'Demo payment initiated')
})

// @desc    Verify Payment (Demo simulated)
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, isDemo } = req.body

  const order = await Order.findById(orderId)

  if (!order) {
    return next(new ApiError('Order not found', 404))
  }

  // Logic for Demo verification
  if (isDemo || razorpayOrderId.startsWith('order_demo_')) {
    order.paymentStatus = 'paid'
    order.paymentDetails = {
      razorpayOrderId: razorpayOrderId || `demo_order_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `demo_pay_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'demo_signature',
      paidAt: new Date()
    }
    
    // In a real scenario, we might also update orderStatus to 'confirmed' if it wasn't already
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed'
    }

    await order.save()

    return sendResponse(res, 200, { order }, 'Demo payment verified successfully')
  }

  // Placeholder for real verification logic (currently disabled as requested)
  return next(new ApiError('Real payment verification is disabled in this environment', 403))
})

// @desc    Get payment details
// @route   GET /api/payment/:paymentId
export const getPaymentDetails = asyncHandler(async (req, res, next) => {
  return sendResponse(res, 403, null, 'Payment details lookup is disabled')
})

// @desc    Process refund
// @route   POST /api/payment/:paymentId/refund
export const processRefund = asyncHandler(async (req, res, next) => {
  return sendResponse(res, 403, null, 'Refund processing is disabled')
})

// @desc    Handle Razorpay Webhook
// @route   POST /api/payment/webhook
export const handleWebhook = async (req, res) => {
  res.status(200).json({ status: 'success', message: 'Webhook received (simulated)' })
}

