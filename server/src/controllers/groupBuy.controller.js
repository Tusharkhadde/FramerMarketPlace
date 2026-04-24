import GroupBuy from '../models/GroupBuy.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { sendResponse } from '../utils/apiResponse.js'
import notificationService from '../services/notification.service.js'

// @desc    Create a new group buy deal
// @route   POST /api/group-buys
// @access  Private (Farmer)
export const createGroupBuy = asyncHandler(async (req, res, next) => {
  const { productId, targetQuantity, discountPrice, expiryDate, minParticipantQuantity } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Check ownership
  if (product.farmer.toString() !== req.user.id) {
    return next(new ApiError('You can only create deals for your own products', 403))
  }

  const groupBuy = await GroupBuy.create({
    product: productId,
    farmer: req.user.id,
    targetQuantity,
    discountPrice,
    expiryDate: new Date(expiryDate),
    minParticipantQuantity: minParticipantQuantity || 1
  })

  sendResponse(res, 201, { groupBuy }, 'Group Buy deal created successfully')
})

// @desc    Join an active group buy
// @route   POST /api/group-buys/:id/join
// @access  Private (Buyer)
export const joinGroupBuy = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body
  const groupBuy = await GroupBuy.findById(req.params.id)

  if (!groupBuy) {
    return next(new ApiError('Group Buy deal not found', 404))
  }

  if (groupBuy.status !== 'active') {
    return next(new ApiError('This deal is no longer active', 400))
  }

  if (new Date() > groupBuy.expiryDate) {
    groupBuy.status = 'expired'
    await groupBuy.save()
    return next(new ApiError('This deal has expired', 400))
  }

  if (quantity < groupBuy.minParticipantQuantity) {
    return next(new ApiError(`Minimum quantity to join is ${groupBuy.minParticipantQuantity}`, 400))
  }

  // Check if user already joined
  const existingParticipant = groupBuy.participants.find(p => p.user.toString() === req.user.id)
  if (existingParticipant) {
    return next(new ApiError('You have already joined this deal', 400))
  }

  // Add participant
  groupBuy.participants.push({
    user: req.user.id,
    quantity: Number(quantity)
  })

  groupBuy.currentQuantity += Number(quantity)

  // Check if goal reached
  if (groupBuy.currentQuantity >= groupBuy.targetQuantity) {
    groupBuy.status = 'reached'
    
    // Notify farmer
    await notificationService.createNotification({
      recipient: groupBuy.farmer,
      type: 'deal',
      title: 'Group Buy Goal Reached!',
      content: `Your deal for "${groupBuy.product.cropName}" has reached its goal of ${groupBuy.targetQuantity} units!`,
      link: `/farmer/deals/${groupBuy._id}`
    })
  }

  await groupBuy.save()

  sendResponse(res, 200, { groupBuy }, 'Joined Group Buy successfully')
})

// @desc    Get all active group buy deals
// @route   GET /api/group-buys
// @access  Public
export const getGroupBuys = asyncHandler(async (req, res, next) => {
  const deals = await GroupBuy.find({ status: 'active' })
    .populate('product', 'cropName images category pricePerKg')
    .populate('farmer', 'fullName district')
    .sort({ expiryDate: 1 })

  sendResponse(res, 200, { deals }, 'Active deals fetched successfully')
})

// @desc    Get single deal details
// @route   GET /api/group-buys/:id
// @access  Public
export const getGroupBuyById = asyncHandler(async (req, res, next) => {
  const deal = await GroupBuy.findById(req.params.id)
    .populate('product')
    .populate('farmer', 'fullName district phone')
    .populate('participants.user', 'fullName')

  if (!deal) {
    return next(new ApiError('Deal not found', 404))
  }

  sendResponse(res, 200, { deal }, 'Deal details fetched successfully')
})
