import APMCPrice from '../models/APMCPrice.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'

// @desc    Get APMC prices by district
// @route   GET /api/apmc/district/:district
export const getPricesByDistrict = asyncHandler(async (req, res) => {
  const { district } = req.params
  const { commodity, limit = 20, days = 7 } = req.query

  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - parseInt(days))

  const query = { district: new RegExp(district, 'i'), date: { $gte: dateFrom } }
  if (commodity) query.commodity = new RegExp(commodity, 'i')

  const prices = await APMCPrice.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit))

  sendResponse(res, 200, { prices }, 'Prices fetched')
})

// @desc    Get price history for a commodity
// @route   GET /api/apmc/history/:commodity
export const getPriceHistory = asyncHandler(async (req, res) => {
  const { commodity } = req.params
  const { district, days = 30 } = req.query

  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - parseInt(days))

  const query = {
    commodity: new RegExp(commodity, 'i'),
    date: { $gte: dateFrom },
  }
  if (district) query.district = new RegExp(district, 'i')

  const prices = await APMCPrice.find(query).sort({ date: 1 })

  sendResponse(res, 200, { prices }, 'Price history fetched')
})

// @desc    Get all commodities
// @route   GET /api/apmc/commodities
export const getCommodities = asyncHandler(async (req, res) => {
  const commodities = await APMCPrice.distinct('commodity')
  sendResponse(res, 200, { commodities }, 'Commodities fetched')
})

// @desc    Bulk import APMC data
// @route   POST /api/apmc/import
export const importAPMCData = asyncHandler(async (req, res) => {
  const { prices } = req.body

  if (!prices || !Array.isArray(prices)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' })
  }

  const result = await APMCPrice.insertMany(prices, { ordered: false })

  sendResponse(res, 201, {
    imported: result.length,
  }, `${result.length} records imported`)
})