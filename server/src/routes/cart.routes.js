import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cart.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

// All cart routes require authentication and buyer role
router.use(protect, authorize('buyer'))

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.delete('/remove/:productId', removeFromCart)
router.delete('/clear', clearCart)

export default router