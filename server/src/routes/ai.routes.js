import express from 'express'
import { predictPrice, getCropRecommendations, analyzeCrop } from '../controllers/ai.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

router.post('/predict-price', protect, predictPrice)
router.post('/crop-recommendations', protect, getCropRecommendations)
router.post('/analyze-crop', protect, upload.single('image'), analyzeCrop)

export default router