import express from 'express'
import { 
  createGroupBuy, 
  joinGroupBuy, 
  getGroupBuys, 
  getGroupBuyById,
  getFarmerGroupBuys
} from '../controllers/groupBuy.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getGroupBuys)
router.get('/:id', getGroupBuyById)

// Protected routes
router.use(protect)

router.get('/farmer/me', authorize('farmer', 'admin'), getFarmerGroupBuys)
router.post('/', authorize('farmer', 'admin'), createGroupBuy)
router.post('/:id/join', joinGroupBuy)

export default router
