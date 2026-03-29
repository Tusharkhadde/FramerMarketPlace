import axios from 'axios'
import APMCPrice from '../models/APMCPrice.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { linearRegression, linearRegressionLine } from 'simple-statistics'

// @desc    Predict future price
// @route   POST /api/ai/predict-price
export const predictPrice = asyncHandler(async (req, res) => {
  const { commodity, district, daysAhead = 30 } = req.body

  let pythonPredictions = null
  let method = 'python_scikit_learn'

  // Try calling Python ML Service
  try {
    const pythonResponse = await axios.post('http://localhost:8000/predict', {
      commodity,
      district,
      days_ahead: daysAhead
    })
    
    if (pythonResponse.data && pythonResponse.data.predictions) {
      pythonPredictions = pythonResponse.data.predictions
    }
  } catch (error) {
    console.error('Python ML Service unreachable, falling back to JS regression:', error.message)
    method = 'linear_regression_fallback'
  }

  // Fetch historical data (last 90 days) for current price and fallback
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - 90)

  const historicalPrices = await APMCPrice.find({
    commodity: new RegExp(commodity, 'i'),
    district: new RegExp(district, 'i'),
    date: { $gte: dateFrom },
  }).sort({ date: 1 })

  if (historicalPrices.length < 5 && !pythonPredictions) {
    // Not enough data and Python failed - use simple estimation
    const avgPrice = historicalPrices.length > 0
      ? historicalPrices.reduce((sum, p) => sum + p.modalPrice, 0) / historicalPrices.length
      : 2000

    const predictions = []
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const trend = 1 + (i * 0.001)
      predictions.push({
        date: date.toISOString(),
        price: Math.round(avgPrice * trend),
        confidence: Math.max(20, 40 - i),
      })
    }

    return sendResponse(res, 200, {
      commodity,
      district,
      currentPrice: avgPrice,
      predictions: [
        { days: 7, price: Math.round(avgPrice * 1.02), confidence: 40 },
        { days: 15, price: Math.round(avgPrice * 1.03), confidence: 30 },
        { days: 30, price: Math.round(avgPrice * 1.05), confidence: 20 },
      ],
      priceSeries: predictions,
      method: 'average_estimation_fallback',
      dataPoints: historicalPrices.length,
    }, 'Prediction generated (limited data/fallback)')
  }

  const currentPrice = historicalPrices.length > 0 
    ? historicalPrices[historicalPrices.length - 1].modalPrice 
    : 0

  let priceSeries = []
  let summaryPredictions = []

  if (pythonPredictions) {
    priceSeries = pythonPredictions
    summaryPredictions = [7, 15, 30].map(days => {
      const pred = priceSeries[days - 1] || priceSeries[priceSeries.length - 1]
      return {
        days,
        price: pred.price,
        confidence: pred.confidence,
      }
    })
  } else {
    // JS Linear Regression Fallback
    const dataPointsArray = historicalPrices.map((price, index) => [index, price.modalPrice])
    const regression = linearRegression(dataPointsArray)
    const predict = linearRegressionLine(regression)
    const lastIndex = dataPointsArray.length - 1

    summaryPredictions = [7, 15, 30].map(days => ({
      days,
      price: Math.round(predict(lastIndex + days)),
      confidence: Math.max(30, Math.round(90 - (days * 1.5))),
    }))

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      priceSeries.push({
        date: date.toISOString(),
        price: Math.round(predict(lastIndex + i)),
        confidence: Math.max(30, Math.round(90 - (i * 1.5))),
      })
    }
  }

  // Generate recommendation
  const shortTermTrend = summaryPredictions[0].price > currentPrice ? 'rising' : 'falling'
  const recommendation = shortTermTrend === 'rising'
    ? `HOLD - ${commodity} prices are expected to rise. Python ML predicts growth based on seasonal trends.`
    : `SELL - ${commodity} prices may decrease. Python ML suggests market saturation or seasonal decline.`

  sendResponse(res, 200, {
    commodity,
    district,
    currentPrice,
    predictions: summaryPredictions,
    priceSeries,
    recommendation,
    trend: shortTermTrend,
    method,
    dataPoints: historicalPrices.length,
    factors: [
      'Historical price patterns (Scikit-Learn)',
      'Supply arrival trends',
      'Polynomial trend analysis',
      'Market conditions',
    ],
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