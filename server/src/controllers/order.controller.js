import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { sendEmail } from '../services/email.service.js'
import notificationService from '../services/notification.service.js'
import smsService from '../services/sms.service.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyers only)
export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    deliveryAddress,
    deliverySchedule,
    paymentMethod,
    paymentDetails,
    notes,
  } = req.body

  if (!items || items.length === 0) {
    return next(new ApiError('No items in order', 400))
  }

  // Validate and process items
  const orderItems = []
  let subtotal = 0

  for (const item of items) {
    const product = await Product.findById(item.productId).populate(
      'farmer',
      'fullName email phone'
    )

    if (!product) {
      return next(new ApiError(`Product not found: ${item.productId}`, 404))
    }

    if (!product.isAvailable) {
      return next(new ApiError(`Product not available: ${product.cropName}`, 400))
    }

    if (product.quantityAvailable < item.quantity) {
      return next(
        new ApiError(
          `Insufficient stock for ${product.cropName}. Available: ${product.quantityAvailable} kg`,
          400
        )
      )
    }

    const itemSubtotal = product.pricePerKg * item.quantity

    orderItems.push({
      product: product._id,
      productSnapshot: {
        cropName: product.cropName,
        pricePerKg: product.pricePerKg,
        qualityGrade: product.qualityGrade,
        image: product.images?.[0]?.url,
      },
      farmer: product.farmer._id,
      quantity: item.quantity,
      pricePerKg: product.pricePerKg,
      subtotal: itemSubtotal,
    })

    subtotal += itemSubtotal

    // Update product quantity
    product.quantityAvailable -= item.quantity
    if (product.quantityAvailable === 0) {
      product.isAvailable = false
    }
    await product.save()
  }

  // Calculate pricing
  const deliveryCharges = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryCharges

  // Create order
  const order = await Order.create({
    buyer: req.user.id,
    items: orderItems,
    deliveryAddress,
    deliverySchedule: {
      date: deliverySchedule?.date ? new Date(deliverySchedule.date) : undefined,
      timeSlot: deliverySchedule?.timeSlot,
    },
    pricing: {
      subtotal,
      deliveryCharges,
      total,
    },
    paymentMethod,
    paymentStatus: 'pending',
    paymentDetails: paymentDetails || {},
    orderStatus: 'confirmed',
    notes,
    estimatedDelivery: deliverySchedule?.date
      ? new Date(deliverySchedule.date)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  })

  // Populate order details
  await order.populate([
    { path: 'buyer', select: 'fullName email phone' },
    { path: 'items.farmer', select: 'fullName email phone' },
  ])

  // Send confirmation email (Background)
  sendEmail({
    email: req.user.email,
    subject: `Order Confirmed - #${order.orderNumber}`,
    template: 'orderConfirmation',
    data: {
      buyerName: req.user.fullName,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.productSnapshot.cropName,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      total: order.pricing.total,
      deliveryAddress: `${deliveryAddress.addressLine1}, ${deliveryAddress.district}`,
      estimatedDelivery: order.estimatedDelivery.toLocaleDateString('en-IN'),
      orderId: order._id,
    },
  }).catch(err => console.error('Order confirmation email failed (background):', err))

  // Send real-time notification to buyer (Background)
  notificationService.createNotification({
    recipient: req.user.id,
    type: 'order',
    title: 'Order Confirmed!',
    content: `Your order #${order.orderNumber} has been placed successfully.`,
    link: `/orders/${order._id}`,
    sendSMS: true,
    phone: req.user.phone
  }).catch(err => console.error('Buyer notification failed (background):', err))

  // Notify farmers about new order (Background)
  const farmerIds = [...new Set(orderItems.map((item) => item.farmer.toString()))]
  Promise.all(farmerIds.map(async (farmerId) => {
    const farmer = await User.findById(farmerId)
    if (!farmer) return

    // Email
    sendEmail({
      email: farmer.email,
      subject: `New Order Received - #${order.orderNumber}`,
      template: 'newOrderFarmer',
      data: {
        farmerName: farmer.fullName,
        orderNumber: order.orderNumber,
        items: order.items
          .filter((item) => item.farmer.toString() === farmerId)
          .map((item) => ({
            name: item.productSnapshot.cropName,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
      },
    }).catch(err => console.error(`Farmer email failed (${farmerId}):`, err))

    // Real-time Notification
    notificationService.createNotification({
      recipient: farmerId,
      type: 'order',
      title: 'New Order Received!',
      content: `You have a new order #${order.orderNumber}.`,
      link: `/farmer/orders`,
      sendSMS: true,
      phone: farmer.phone
    }).catch(err => console.error(`Farmer notification failed (${farmerId}):`, err))
  })).catch(err => console.error('Farmer notifications loop error:', err))

  sendResponse(res, 201, { order }, 'Order placed successfully')
})

// @desc    Get buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyers)
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query

  const query = { buyer: req.user.id }

  if (status === 'active') {
    query.orderStatus = { $nin: ['delivered', 'cancelled'] }
  } else if (status === 'delivered') {
    query.orderStatus = 'delivered'
  } else if (status === 'cancelled') {
    query.orderStatus = 'cancelled'
  }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.farmer', 'fullName phone')
      .populate('items.product', 'images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ])

  sendResponse(res, 200, {
    orders,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalOrders: total,
    },
  }, 'Orders fetched successfully')
})

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'fullName email phone')
    .populate('items.farmer', 'fullName email phone district village')
    .populate('items.product', 'images cropName')

  if (!order) {
    return next(new ApiError('Order not found', 404))
  }

  // Check authorization
  const isOwner = order.buyer._id.toString() === req.user.id
  const isFarmer = order.items.some(
    (item) => item.farmer._id.toString() === req.user.id
  )
  const isAdmin = req.user.userType === 'admin'

  if (!isOwner && !isFarmer && !isAdmin) {
    return next(new ApiError('Not authorized to view this order', 403))
  }

  sendResponse(res, 200, { order }, 'Order fetched successfully')
})

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Buyer)
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ApiError('Order not found', 404))
  }

  if (order.buyer.toString() !== req.user.id) {
    return next(new ApiError('Not authorized', 403))
  }

  // Can only cancel if not shipped or delivered
  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    return next(new ApiError('Cannot cancel order at this stage', 400))
  }

  // Restore product quantities
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantityAvailable: item.quantity },
      isAvailable: true,
    })
  }

  order.orderStatus = 'cancelled'
  order.cancellationReason = reason
  order.cancelledBy = 'buyer'
  await order.save()

  sendResponse(res, 200, { order }, 'Order cancelled successfully')
})

// @desc    Get farmer's orders
// @route   GET /api/orders/farmer/orders
// @access  Private (Farmers)
export const getFarmerOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query

  const query = { 'items.farmer': req.user.id }

  if (status && status !== 'all') {
    query.orderStatus = status
  }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('buyer', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ])

  // Filter items to only show farmer's items
  const filteredOrders = orders.map((order) => {
    const orderObj = order.toObject()
    orderObj.items = orderObj.items.filter(
      (item) => item.farmer.toString() === req.user.id
    )
    return orderObj
  })

  sendResponse(res, 200, {
    orders: filteredOrders,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalOrders: total,
    },
  }, 'Orders fetched successfully')
})

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Farmers/Admin)
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ApiError('Order not found', 404))
  }

  // Check if farmer owns items in this order
  const isFarmer = order.items.some(
    (item) => item.farmer.toString() === req.user.id
  )

  if (!isFarmer && req.user.userType !== 'admin') {
    return next(new ApiError('Not authorized', 403))
  }

  const validTransitions = {
    confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  }

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    return next(
      new ApiError(`Cannot change status from ${order.orderStatus} to ${status}`, 400)
    )
  }

  order.orderStatus = status
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy: req.user.id,
  })

  if (status === 'delivered') {
    order.actualDelivery = new Date()
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid'
      order.paymentDetails.paidAt = new Date()
    }
  }

  await order.save()

  // Send status update email and notification (Background)
  await order.populate('buyer', 'fullName email phone')
  
  sendEmail({
    email: order.buyer.email,
    subject: `Order Update - #${order.orderNumber}`,
    template: 'orderStatusUpdate',
    data: {
      buyerName: order.buyer.fullName,
      orderNumber: order.orderNumber,
      status: status.charAt(0).toUpperCase() + status.slice(1),
      note,
    },
  }).catch(err => console.error('Status update email failed (background):', err))

  notificationService.createNotification({
    recipient: order.buyer._id,
    type: 'order',
    title: 'Order Status Updated',
    content: `Your order #${order.orderNumber} is now ${status}.`,
    link: `/orders/${order._id}`,
    sendSMS: true,
    phone: order.buyer.phone
  }).catch(err => console.error('Buyer status update notification failed (background):', err))

  sendResponse(res, 200, { order }, 'Order status updated')
})

// @desc    Get recent orders for farmer dashboard
// @route   GET /api/orders/farmer/recent
// @access  Private (Farmers)
export const getFarmerRecentOrders = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query

  const orders = await Order.find({ 'items.farmer': req.user.id })
    .populate('buyer', 'fullName')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))

  sendResponse(res, 200, { orders }, 'Recent orders fetched')
})

// @desc    Get order statistics for farmer
// @route   GET /api/orders/farmer/stats
// @access  Private (Farmers)
export const getFarmerOrderStats = asyncHandler(async (req, res, next) => {
  const farmerId = req.user.id

  // Get order stats
  const [stats] = await Order.aggregate([
    { $match: { 'items.farmer': farmerId } },
    { $unwind: '$items' },
    { $match: { 'items.farmer': farmerId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$items.subtotal' },
        pendingOrders: {
          $sum: {
            $cond: [
              { $in: ['$orderStatus', ['pending', 'confirmed', 'processing']] },
              1,
              0,
            ],
          },
        },
      },
    },
  ])

  // Get monthly revenue
  const monthlyRevenue = await Order.aggregate([
    { $match: { 'items.farmer': farmerId, orderStatus: 'delivered' } },
    { $unwind: '$items' },
    { $match: { 'items.farmer': farmerId } },
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setDate(1)), // First day of current month
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$items.subtotal' },
      },
    },
  ])

  sendResponse(res, 200, {
    totalOrders: stats?.totalOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
    pendingOrders: stats?.pendingOrders || 0,
    monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
  }, 'Stats fetched successfully')
})