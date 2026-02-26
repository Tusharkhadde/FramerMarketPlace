import User from '../models/User.js'
import Product from '../models/Product.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (Buyer)
export const getCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'cart.product',
    populate: {
      path: 'farmer',
      select: 'fullName district',
    },
  })

  if (!user) {
    return next(new ApiError('User not found', 404))
  }

  // Filter out any invalid cart items
  const validCartItems = user.cart.filter(item => item.product)

  sendResponse(res, 200, { items: validCartItems }, 'Cart fetched successfully')
})

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private (Buyer)
export const addToCart = asyncHandler(async (req, res, next) => {
  const { product: productId, quantity, price } = req.body

  if (!productId || !quantity) {
    return next(new ApiError('Product and quantity are required', 400))
  }

  // Check if product exists
  const product = await Product.findById(productId)
  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  if (!product.isAvailable) {
    return next(new ApiError('Product is not available', 400))
  }

  if (quantity > product.quantityAvailable) {
    return next(new ApiError('Requested quantity not available', 400))
  }

  if (quantity < product.minimumOrder) {
    return next(new ApiError(`Minimum order quantity is ${product.minimumOrder} kg`, 400))
  }

  const user = await User.findById(req.user.id)

  // Check if product already in cart
  const existingItemIndex = user.cart.findIndex(
    item => item.product.toString() === productId
  )

  if (existingItemIndex > -1) {
    // Update quantity
    user.cart[existingItemIndex].quantity += quantity
    
    // Check if updated quantity exceeds available stock
    if (user.cart[existingItemIndex].quantity > product.quantityAvailable) {
      return next(new ApiError('Total quantity exceeds available stock', 400))
    }
  } else {
    // Add new item
    user.cart.push({
      product: productId,
      quantity,
      price: price || product.pricePerKg,
    })
  }

  await user.save()

  // Populate cart items
  await user.populate({
    path: 'cart.product',
    populate: {
      path: 'farmer',
      select: 'fullName district',
    },
  })

  sendResponse(res, 200, { cart: user }, 'Item added to cart')
})

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private (Buyer)
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body

  if (!productId || quantity === undefined) {
    return next(new ApiError('Product and quantity are required', 400))
  }

  if (quantity < 1) {
    return next(new ApiError('Quantity must be at least 1', 400))
  }

  const product = await Product.findById(productId)
  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  if (quantity > product.quantityAvailable) {
    return next(new ApiError('Requested quantity not available', 400))
  }

  const user = await User.findById(req.user.id)

  const cartItemIndex = user.cart.findIndex(
    item => item.product.toString() === productId
  )

  if (cartItemIndex === -1) {
    return next(new ApiError('Item not found in cart', 404))
  }

  user.cart[cartItemIndex].quantity = quantity
  await user.save()

  await user.populate({
    path: 'cart.product',
    populate: {
      path: 'farmer',
      select: 'fullName district',
    },
  })

  sendResponse(res, 200, { cart: user }, 'Cart updated')
})

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private (Buyer)
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params

  const user = await User.findById(req.user.id)

  user.cart = user.cart.filter(
    item => item.product.toString() !== productId
  )

  await user.save()

  await user.populate({
    path: 'cart.product',
    populate: {
      path: 'farmer',
      select: 'fullName district',
    },
  })

  sendResponse(res, 200, { cart: user }, 'Item removed from cart')
})

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private (Buyer)
export const clearCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  user.cart = []
  await user.save()

  sendResponse(res, 200, {}, 'Cart cleared')
})