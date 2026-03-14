import express from 'express'
// import {
//   createRazorpayOrder,
//   verifyPayment,
//   getPaymentDetails,
//   processRefund,
//   handleWebhook,
// } from '../controllers/payment.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

// Webhook (no auth required - verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// Protected routes
router.use(protect)

router.post('/create-order', createRazorpayOrder)
router.post('/verify', verifyPayment)
router.get('/:paymentId', getPaymentDetails)
router.post('/:paymentId/refund', authorize('admin'), processRefund)

export default router