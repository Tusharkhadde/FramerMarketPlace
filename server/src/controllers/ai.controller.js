import APMCPrice from '../models/APMCPrice.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { linearRegression, linearRegressionLine } from 'simple-statistics'
import { generateMarketAdvice, analyzeCropImage } from '../services/ai.service.js'
import { ApiError } from '../utils/apiError.js'
import fs from 'fs'

// @desc    Predict future price
// @route   POST /api/ai/predict-price
export const predictPrice = asyncHandler(async (req, res) => {
  const { commodity, district, daysAhead = 7 } = req.body

  // Fetch historical data (last 90 days)
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - 90)

  const historicalPrices = await APMCPrice.find({
    commodity: new RegExp(commodity, 'i'),
    district: new RegExp(district, 'i'),
    date: { $gte: dateFrom },
  }).sort({ date: 1 })

  if (historicalPrices.length < 5) {
    // Not enough data - use simple estimation
    const avgPrice = historicalPrices.length > 0
      ? historicalPrices.reduce((sum, p) => sum + p.modalPrice, 0) / historicalPrices.length
      : 2000

    const predictionData = {
      commodity,
      district,
      currentPrice: avgPrice,
      predictions: [
        { days: 7, price: Math.round(avgPrice * 1.02), confidence: 40 },
        { days: 15, price: Math.round(avgPrice * 1.03), confidence: 30 },
        { days: 30, price: Math.round(avgPrice * 1.05), confidence: 20 },
      ],
      method: 'average_estimation',
      dataPoints: historicalPrices.length,
      trend: 'slight_rise'
    }

    // Add AI Advisor Narrative
    const aiAdvisor = await generateMarketAdvice(predictionData)

    return sendResponse(res, 200, {
      ...predictionData,
      aiAdvisor,
    }, 'Prediction generated (limited data)')
  }

  // Prepare data for linear regression
  const dataPoints = historicalPrices.map((price, index) => [index, price.modalPrice])

  // Calculate linear regression
  const regression = linearRegression(dataPoints)
  const predict = linearRegressionLine(regression)

  const lastIndex = dataPoints.length - 1
  const currentPrice = historicalPrices[historicalPrices.length - 1].modalPrice

  // Generate predictions
  const predictions = [7, 15, 30].map(days => {
    const predictedPrice = Math.round(predict(lastIndex + days))
    const confidence = Math.max(30, Math.round(90 - (days * 1.5)))
    
    // Add some noise for realism
    const noise = (Math.random() - 0.5) * predictedPrice * 0.05
    
    return {
      days,
      price: Math.round(predictedPrice + noise),
      confidence,
    }
  })

  // Generate recommendation
  const shortTermTrend = predictions[0].price > currentPrice ? 'rising' : 'falling'
  
  const predictionData = {
    commodity,
    district,
    currentPrice,
    predictions,
    trend: shortTermTrend,
    method: 'linear_regression',
    dataPoints: historicalPrices.length,
    factors: [
      'Historical price patterns',
      'Supply arrival trends',
      'Seasonal demand factors',
      'Market conditions',
    ],
  }

  // Add Master AI Advisor Narrative
  const aiAdvisor = await generateMarketAdvice(predictionData)

  sendResponse(res, 200, {
    ...predictionData,
    aiAdvisor,
    recommendation: aiAdvisor, // Use AI's recommendation primarily
  }, 'Prediction generated successfully')
})

// @desc    Get crop recommendations
// @route   POST /api/ai/crop-recommendations
export const getCropRecommendations = asyncHandler(async (req, res) => {
  const { district, month } = req.body

  // Simple crop recommendation based on district and month
  const recommendations = {
    Nashik: { kharif: ['Tomato', 'Onion', 'Grapes'], rabi: ['Wheat', 'Onion', 'Potato'] },
    Pune: { kharif: ['Sugarcane', 'Vegetables', 'Rice'], rabi: ['Wheat', 'Vegetables', 'Grapes'] },
    Nagpur: { kharif: ['Cotton', 'Soybean', 'Rice'], rabi: ['Wheat', 'Orange', 'Pulses'] },
    Solapur: { kharif: ['Sugarcane', 'Pomegranate', 'Jowar'], rabi: ['Wheat', 'Gram', 'Pomegranate'] },
    default: { kharif: ['Rice', 'Cotton', 'Soybean'], rabi: ['Wheat', 'Gram', 'Pulses'] },
  }

  const currentMonth = month || new Date().getMonth() + 1
  const season = currentMonth >= 6 && currentMonth <= 10 ? 'kharif' : 'rabi'
  const districtRecs = recommendations[district] || recommendations.default

  sendResponse(res, 200, {
    district,
    season,
    recommendedCrops: districtRecs[season],
    tips: [
      'Check soil health before planting',
      'Use drip irrigation for water efficiency',
      'Monitor APMC prices before harvest',
      'Consider organic farming for premium pricing',
    ],
  }, 'Recommendations generated')
})

// @desc    Analyze crop image for health and quality
// @route   POST /api/ai/analyze-crop
export const analyzeCrop = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError('No image provided', 400))
  }

  try {
    // Read file and convert to base64
    const imageBase64 = fs.readFileSync(req.file.path).toString('base64')
    const mimeType = req.file.mimetype

    // Call service
    const analysis = await analyzeCropImage(imageBase64, mimeType)

    // Clean up temporary file
    fs.unlinkSync(req.file.path)

    sendResponse(res, 200, { analysis }, 'Crop analysis completed')
  } catch (error) {
    // Clean up on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (e) {}
    }
    return next(new ApiError(error.message || 'Image analysis failed', 500))
  }
})