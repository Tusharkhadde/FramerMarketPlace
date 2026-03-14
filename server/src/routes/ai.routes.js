import express from 'express'
import { predictPrice, getCropRecommendations } from '../controllers/ai.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/predict-price', protect, predictPrice)
router.post('/crop-recommendations', protect, getCropRecommendations)

export default router