import Product from '../models/Product.js'
import User from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmers only)
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    cropName,
    category,
    description,
    quantityAvailable,
    unit,
    pricePerKg,
    qualityGrade,
    harvestDate,
    isOrganic,
    minimumOrder,
    deliveryOptions,
    tags,
  } = req.body

  // Get farmer's district from profile
  const farmer = await User.findById(req.user.id)
  if (!farmer || farmer.userType !== 'farmer') {
    return next(new ApiError('Only farmers can create products', 403))
  }

  // Handle image uploads
  let images = []
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'products')
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }
  }

  const product = await Product.create({
    farmer: req.user.id,
    cropName,
    category,
    description,
    quantityAvailable,
    unit: unit || 'kg',
    pricePerKg,
    qualityGrade,
    harvestDate,
    isOrganic: isOrganic || false,
    minimumOrder: minimumOrder || 1,
    deliveryOptions: deliveryOptions || { pickup: true, delivery: true },
    tags: tags || [],
    district: farmer.district,
    images,
  })

  // Populate farmer details
  await product.populate('farmer', 'fullName phone district village')

  sendResponse(res, 201, { product }, 'Product created successfully')
})

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    district,
    minPrice,
    maxPrice,
    qualityGrade,
    isOrganic,
    isAvailable = 'true',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    featured,
  } = req.query

  // Build query
  const query = {}

  // Search by crop name or description
  if (search) {
    query.$text = { $search: search }
  }

  // Filter by category
  if (category && category !== 'all') {
    query.category = category.toLowerCase()
  }

  // Filter by district
  if (district) {
    query.district = district
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.pricePerKg = {}
    if (minPrice) query.pricePerKg.$gte = parseFloat(minPrice)
    if (maxPrice) query.pricePerKg.$lte = parseFloat(maxPrice)
  }

  // Filter by quality grade
  if (qualityGrade) {
    query.qualityGrade = qualityGrade.toUpperCase()
  }

  // Filter by organic
  if (isOrganic === 'true') {
    query.isOrganic = true
  }

  // Filter by availability
  if (isAvailable === 'true') {
    query.isAvailable = true
    query.quantityAvailable = { $gt: 0 }
  }

  // Filter by featured
  if (featured === 'true') {
    query.isFeatured = true
  }

  // Only show approved products
  query.isApproved = true

  // Sort options
  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

  // Pagination
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('farmer', 'fullName phone district village ratings')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ])

  sendResponse(res, 200, {
    products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
      hasMore: skip + products.length < total,
    },
  }, 'Products fetched successfully')
})

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('farmer', 'fullName phone email district village taluka farmSize isVerified createdAt')

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Increment view count
  product.views += 1
  await product.save({ validateBeforeSave: false })

  sendResponse(res, 200, { product }, 'Product fetched successfully')
})

// @desc    Get farmer's own products
// @route   GET /api/products/my-products
// @access  Private (Farmers only)
export const getMyProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query

  const query = { farmer: req.user.id }

  if (status === 'available') {
    query.isAvailable = true
    query.quantityAvailable = { $gt: 0 }
  } else if (status === 'unavailable') {
    query.$or = [
      { isAvailable: false },
      { quantityAvailable: 0 },
    ]
  }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ])

  sendResponse(res, 200, {
    products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
    },
  }, 'Products fetched successfully')
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product owner only)
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Check ownership
  if (product.farmer.toString() !== req.user.id && req.user.userType !== 'admin') {
    return next(new ApiError('Not authorized to update this product', 403))
  }

  const updateFields = [
    'cropName', 'category', 'description', 'quantityAvailable',
    'unit', 'pricePerKg', 'qualityGrade', 'harvestDate',
    'isOrganic', 'minimumOrder', 'deliveryOptions', 'tags', 'isAvailable',
  ]

  const updateData = {}
  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field]
    }
  })

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = []
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'products')
      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }
    
    // If replacing all images, delete old ones
    if (req.body.replaceImages === 'true') {
      for (const image of product.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId)
        }
      }
      updateData.images = newImages
    } else {
      // Add to existing images (max 5)
      const combinedImages = [...product.images, ...newImages].slice(0, 5)
      updateData.images = combinedImages
    }
  }

  // Handle image deletion
  if (req.body.deleteImages) {
    const imagesToDelete = JSON.parse(req.body.deleteImages)
    for (const publicId of imagesToDelete) {
      await deleteFromCloudinary(publicId)
    }
    updateData.images = product.images.filter(
      img => !imagesToDelete.includes(img.publicId)
    )
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('farmer', 'fullName phone district village')

  sendResponse(res, 200, { product }, 'Product updated successfully')
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product owner or admin)
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Check ownership
  if (product.farmer.toString() !== req.user.id && req.user.userType !== 'admin') {
    return next(new ApiError('Not authorized to delete this product', 403))
  }

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId)
    }
  }

  await product.deleteOne()

  sendResponse(res, 200, {}, 'Product deleted successfully')
})

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/toggle-availability
// @access  Private (Product owner only)
export const toggleAvailability = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  if (product.farmer.toString() !== req.user.id) {
    return next(new ApiError('Not authorized', 403))
  }

  product.isAvailable = !product.isAvailable
  await product.save()

  sendResponse(res, 200, { 
    product,
    isAvailable: product.isAvailable 
  }, `Product ${product.isAvailable ? 'enabled' : 'disabled'} successfully`)
})

// @desc    Get product categories with counts
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.aggregate([
    { $match: { isAvailable: true, isApproved: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  sendResponse(res, 200, { categories }, 'Categories fetched successfully')
})

// @desc    Get products by farmer ID
// @route   GET /api/products/farmer/:farmerId
// @access  Public
export const getProductsByFarmer = asyncHandler(async (req, res, next) => {
  const { farmerId } = req.params
  const { page = 1, limit = 10 } = req.query

  const farmer = await User.findById(farmerId)
  if (!farmer || farmer.userType !== 'farmer') {
    return next(new ApiError('Farmer not found', 404))
  }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  const [products, total] = await Promise.all([
    Product.find({
      farmer: farmerId,
      isAvailable: true,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments({
      farmer: farmerId,
      isAvailable: true,
      isApproved: true,
    }),
  ])

  sendResponse(res, 200, {
    farmer: {
      _id: farmer._id,
      fullName: farmer.fullName,
      district: farmer.district,
      village: farmer.village,
      isVerified: farmer.isVerified,
    },
    products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
    },
  }, 'Farmer products fetched successfully')
})

// @desc    Search products with autocomplete
// @route   GET /api/products/search/autocomplete
// @access  Public
export const searchAutocomplete = asyncHandler(async (req, res, next) => {
  const { q } = req.query

  if (!q || q.length < 2) {
    return sendResponse(res, 200, { suggestions: [] }, 'No suggestions')
  }

  const suggestions = await Product.find({
    cropName: { $regex: q, $options: 'i' },
    isAvailable: true,
    isApproved: true,
  })
    .select('cropName category')
    .limit(10)
    .lean()

  // Get unique crop names
  const uniqueSuggestions = [...new Set(suggestions.map(s => s.cropName))]

  sendResponse(res, 200, { suggestions: uniqueSuggestions }, 'Suggestions fetched')
})