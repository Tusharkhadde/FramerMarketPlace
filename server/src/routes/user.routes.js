import express from 'express'
import mongoose from 'mongoose'
import { protect, authorize } from '../middleware/auth.middleware.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'

const router = express.Router()

// @desc    Get all farmers (Public)
// @route   GET /api/users/public/farmers
router.get('/public/farmers', asyncHandler(async (req, res) => {
  const farmers = await User.find({ userType: 'farmer', isActive: true })
    .select('fullName district taluka village avatar')
  sendResponse(res, 200, { farmers }, 'Farmers fetched successfully')
}))

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

// Address Management
// @desc    Get all addresses
router.get('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses')
  sendResponse(res, 200, { addresses: user.addresses }, 'Addresses fetched')
}))

// @desc    Add new address
router.post('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  user.addresses.push(req.body)
  
  // If first address, make it default
  if (user.addresses.length === 1) {
    user.addresses[0].isDefault = true
  }
  
  await user.save()
  sendResponse(res, 201, { addresses: user.addresses }, 'Address added successfully')
}))

// @desc    Update address
router.put('/addresses/:addressId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  const address = user.addresses.id(req.params.addressId)
  
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' })
  }
  
  Object.assign(address, req.body)
  await user.save()
  sendResponse(res, 200, { addresses: user.addresses }, 'Address updated successfully')
}))

// @desc    Delete address
router.delete('/addresses/:addressId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  user.addresses.pull(req.params.addressId)
  await user.save()
  sendResponse(res, 200, { addresses: user.addresses }, 'Address deleted successfully')
}))

// @desc    Set default address
router.patch('/addresses/:addressId/default', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  user.addresses.forEach(addr => {
    addr.isDefault = (addr._id.toString() === req.params.addressId)
  })
  await user.save()
  sendResponse(res, 200, { addresses: user.addresses }, 'Default address updated')
}))

// Get farmer stats
router.get('/farmer/stats', authorize('farmer'), asyncHandler(async (req, res) => {
  const Product = (await import('../models/Product.js')).default
  const Order = (await import('../models/Order.js')).default

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalProducts, activeOrders, pendingOrders, revenueData] = await Promise.all([
    Product.countDocuments({ farmer: req.user.id }),
    Order.countDocuments({ 
      'items.farmer': req.user.id, 
      orderStatus: { $nin: ['delivered', 'cancelled'] } 
    }),
    Order.countDocuments({ 
      'items.farmer': req.user.id, 
      orderStatus: 'pending' 
    }),
    Order.aggregate([
      {
        $match: {
          'items.farmer': new mongoose.Types.ObjectId(req.user.id),
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.farmer': new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.subtotal' }
        }
      }
    ])
  ])

  sendResponse(res, 200, { 
    totalProducts, 
    activeOrders, 
    monthlyRevenue: revenueData[0]?.totalRevenue || 0, 
    pendingOrders 
  }, 'Stats fetched successfully')
}))

// Get detailed farmer analytics
router.get('/farmer/analytics', authorize('farmer'), asyncHandler(async (req, res) => {
  const Order = (await import('../models/Order.js')).default
  const Product = (await import('../models/Product.js')).default
  const farmerId = new mongoose.Types.ObjectId(req.user.id)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [salesOverTime, topProducts, statusDistribution] = await Promise.all([
    // Sales over time (last 30 days)
    Order.aggregate([
      {
        $match: {
          'items.farmer': farmerId,
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.farmer': farmerId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$items.subtotal" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]),

    // Top 5 products by revenue
    Order.aggregate([
      {
        $match: {
          'items.farmer': farmerId,
          orderStatus: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.farmer': farmerId } },
      {
        $group: {
          _id: "$items.product",
          revenue: { $sum: "$items.subtotal" },
          quantity: { $sum: "$items.quantity" },
          name: { $first: "$items.productSnapshot.cropName" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),

    // Order status distribution
    Order.aggregate([
      {
        $match: { 'items.farmer': farmerId }
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ])
  ])

  sendResponse(res, 200, {
    salesOverTime,
    topProducts,
    statusDistribution
  }, 'Analytics data fetched successfully')
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