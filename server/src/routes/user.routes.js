import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'

const router = express.Router()

router.use(protect)

// Update profile
router.put('/profile', asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'phone', 'district', 'taluka', 'village', 'farmSize', 'farmAddress', 'bankDetails']
  const updateData = {}
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field]
  })

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true })
  sendResponse(res, 200, { user }, 'Profile updated')
}))

// Get user addresses
router.get('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  sendResponse(res, 200, { addresses: user.addresses || [] }, 'Addresses fetched')
}))

// Add new address
router.post('/addresses', asyncHandler(async (req, res) => {
  const {
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    district,
    state,
    pincode,
    isDefault,
  } = req.body

  const user = await User.findById(req.user.id)

  if (isDefault) {
    // unset other defaults
    user.addresses.forEach(a => { a.isDefault = false })
  }

  user.addresses.push({
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    district,
    state,
    pincode,
    isDefault: !!isDefault,
  })

  await user.save()

  const newAddress = user.addresses[user.addresses.length - 1]
  sendResponse(res, 201, { address: newAddress }, 'Address added')
}))

// Get farmer stats
router.get('/farmer/stats', authorize('farmer'), asyncHandler(async (req, res) => {
  const Product = (await import('../models/Product.js')).default
  const Order = (await import('../models/Order.js')).default

  const [totalProducts, activeOrders] = await Promise.all([
    Product.countDocuments({ farmer: req.user.id }),
    Order.countDocuments({ 'items.farmer': req.user.id, orderStatus: { $nin: ['delivered', 'cancelled'] } }),
  ])

  sendResponse(res, 200, { totalProducts, activeOrders, monthlyRevenue: 0, pendingOrders: 0 }, 'Stats fetched')
}))

// Admin: Get all users
router.get('/admin/all', authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userType, search } = req.query
  const query = {}
  if (userType && userType !== 'all') query.userType = userType
  if (search) {
    query.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ]
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ])

  sendResponse(res, 200, { users, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total } }, 'Users fetched')
}))

// Admin: Verify farmer
router.patch('/admin/verify/:userId', authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { isVerified: true, verifiedAt: new Date() }, { new: true })
  sendResponse(res, 200, { user }, 'User verified')
}))

// Admin: Ban/Unban user
router.patch('/admin/ban/:userId', authorize('admin'), asyncHandler(async (req, res) => {
  const { ban } = req.body
  const user = await User.findByIdAndUpdate(req.params.userId, { isBanned: ban, isActive: !ban }, { new: true })
  sendResponse(res, 200, { user }, `User ${ban ? 'banned' : 'unbanned'}`)
}))

// Admin: Delete user
router.delete('/admin/:userId', authorize('admin'), asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.userId)
  sendResponse(res, 200, {}, 'User deleted')
}))

export default router