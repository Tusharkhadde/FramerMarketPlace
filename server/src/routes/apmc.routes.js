import express from 'express'
import {
  getPricesByDistrict,
  getPriceHistory,
  getCommodities,
  importAPMCData,
} from '../controllers/apmc.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/district/:district', getPricesByDistrict)
router.get('/history/:commodity', getPriceHistory)
router.get('/commodities', getCommodities)
router.post('/import', protect, authorize('admin'), importAPMCData)

export default router