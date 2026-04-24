import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFarmerOrders,
  updateOrderStatus,
  getFarmerRecentOrders,
  getFarmerOrderStats,
  releaseEscrow,
} from '../controllers/order.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

// Protected routes
router.use(protect)

// Buyer routes
router.post('/', authorize('buyer'), createOrder)
router.get('/my-orders', authorize('buyer'), getMyOrders)
router.patch('/:id/cancel', authorize('buyer'), cancelOrder)
router.patch('/:id/release-escrow', authorize('buyer'), releaseEscrow)

// Farmer routes
router.get('/farmer/orders', authorize('farmer'), getFarmerOrders)
router.get('/farmer/recent', authorize('farmer'), getFarmerRecentOrders)
router.get('/farmer/stats', authorize('farmer'), getFarmerOrderStats)
router.patch('/:id/status', authorize('farmer', 'admin'), updateOrderStatus)

// Common routes
router.get('/:id', getOrderById)

export default router