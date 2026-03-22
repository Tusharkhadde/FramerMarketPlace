import Product from '../models/Product.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'
import fs from 'fs'
import path from 'path'

// @desc    Get all products with filtering
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
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query

  // Build query
  const query = { isAvailable: true, isApproved: true }

  // Search by crop name or description
  if (search) {
    query.$or = [
      { cropName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  if (category) query.category = category
  if (district) query.district = district
  if (qualityGrade) query.qualityGrade = qualityGrade
  if (isOrganic === 'true') query.isOrganic = true
  if (featured === 'true') query.isFeatured = true

  // Price range filter
  if (minPrice || maxPrice) {
    query.pricePerKg = {}
    if (minPrice) query.pricePerKg.$gte = Number(minPrice)
    if (maxPrice) query.pricePerKg.$lte = Number(maxPrice)
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit)

  // Sort
  const sort = {}
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1

  const products = await Product.find(query)
    .populate('farmer', 'fullName district phone')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))

  const total = await Product.countDocuments(query)

  sendResponse(res, 200, {
    products,
    total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  }, 'Products fetched successfully')
})

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('farmer', 'fullName district phone email village')

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Increment views
  product.views = (product.views || 0) + 1
  await product.save({ validateBeforeSave: false })

  sendResponse(res, 200, { product }, 'Product fetched successfully')
})

// @desc    Get farmer's products
// @route   GET /api/products/my/products
// @access  Private (Farmer)
export const getMyProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ farmer: req.user.id })
    .sort({ createdAt: -1 })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isAvailable).length,
    inactive: products.filter(p => !p.isAvailable).length,
    totalValue: products.reduce((sum, p) => sum + (p.pricePerKg * p.quantityAvailable), 0),
  }

  sendResponse(res, 200, { products, stats }, 'Products fetched successfully')
})

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmer)
export const createProduct = asyncHandler(async (req, res, next) => {
  console.log('=== CREATE PRODUCT START ===')
  console.log('User:', req.user?.id, req.user?.userType)
  console.log('Body:', req.body)
  console.log('Files:', req.files?.length || 0, 'files')

  try {
    // Handle images - upload to Cloudinary
    let uploadedImages = []

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, 'products')
        return {
          url: result.secure_url,
          publicId: result.public_id,
        }
      })
      uploadedImages = await Promise.all(uploadPromises)
      console.log('Images uploaded to Cloudinary:', uploadedImages)
    } else {
      // Default placeholder image
      uploadedImages = [{
        url: 'https://placehold.co/400x400?text=Product+Image',
        publicId: null,
      }]
    }

    // Parse JSON fields safely
    let deliveryOptions = { pickup: true, delivery: true, deliveryRadius: 50 }
    let tags = []
    let certifications = []

    if (req.body.deliveryOptions) {
      try {
        deliveryOptions = typeof req.body.deliveryOptions === 'string'
          ? JSON.parse(req.body.deliveryOptions)
          : req.body.deliveryOptions
      } catch (e) {
        console.log('Parse deliveryOptions error:', e.message)
      }
    }

    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string'
          ? JSON.parse(req.body.tags)
          : req.body.tags
      } catch (e) {
        console.log('Parse tags error:', e.message)
      }
    }

    if (req.body.certifications) {
      try {
        certifications = typeof req.body.certifications === 'string'
          ? JSON.parse(req.body.certifications)
          : req.body.certifications
      } catch (e) {
        console.log('Parse certifications error:', e.message)
      }
    }

    // Build product data
    const productData = {
      farmer: req.user.id,
      cropName: req.body.cropName,
      category: req.body.category,
      description: req.body.description || '',
      quantityAvailable: Number(req.body.quantityAvailable) || 0,
      unit: req.body.unit || 'kg',
      pricePerKg: Number(req.body.pricePerKg) || 0,
      qualityGrade: req.body.qualityGrade || 'A',
      harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : new Date(),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      district: req.body.district,
      isOrganic: req.body.isOrganic === 'true' || req.body.isOrganic === true,
      images: uploadedImages,
      deliveryOptions,
      tags: Array.isArray(tags) ? tags : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      minimumOrder: Number(req.body.minimumOrder) || 1,
      isAvailable: true,
      isApproved: true,
    }

    console.log('Product data:', JSON.stringify(productData, null, 2))

    // Create product
    const product = await Product.create(productData)
    console.log('Product created with ID:', product._id)

    // Populate farmer info
    await product.populate('farmer', 'fullName district')

    console.log('=== CREATE PRODUCT SUCCESS ===')
    sendResponse(res, 201, { product }, 'Product created successfully')

  } catch (error) {
    console.error('=== CREATE PRODUCT ERROR ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path)
        } catch (e) {
          console.log('Error deleting file:', e.message)
        }
      })
    }

    return next(new ApiError(error.message || 'Failed to create product', 500))
  }
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer/Admin)
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Check ownership
  if (req.user.userType === 'farmer' && product.farmer.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to update this product', 403))
  }

  // Handle new images
  let uploadedImages = product.images

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path, 'products')
      return {
        url: result.secure_url,
        publicId: result.public_id,
      }
    })
    const newImages = await Promise.all(uploadPromises)
    
    // Delete old images from Cloudinary
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.publicId && !img.url.includes('placehold.co')) {
          deleteFromCloudinary(img.publicId).catch(console.error)
        }
      })
    }
    
    uploadedImages = newImages
  }

  // Parse JSON fields
  let deliveryOptions = product.deliveryOptions
  let tags = product.tags
  let certifications = product.certifications

  if (req.body.deliveryOptions) {
    try {
      deliveryOptions = typeof req.body.deliveryOptions === 'string'
        ? JSON.parse(req.body.deliveryOptions)
        : req.body.deliveryOptions
    } catch (e) { }
  }

  if (req.body.tags) {
    try {
      tags = typeof req.body.tags === 'string'
        ? JSON.parse(req.body.tags)
        : req.body.tags
    } catch (e) { }
  }

  if (req.body.certifications) {
    try {
      certifications = typeof req.body.certifications === 'string'
        ? JSON.parse(req.body.certifications)
        : req.body.certifications
    } catch (e) { }
  }

  const updateData = {
    cropName: req.body.cropName || product.cropName,
    category: req.body.category || product.category,
    description: req.body.description ?? product.description,
    quantityAvailable: req.body.quantityAvailable ? Number(req.body.quantityAvailable) : product.quantityAvailable,
    unit: req.body.unit || product.unit,
    pricePerKg: req.body.pricePerKg ? Number(req.body.pricePerKg) : product.pricePerKg,
    qualityGrade: req.body.qualityGrade || product.qualityGrade,
    harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : product.harvestDate,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : product.expiryDate,
    district: req.body.district || product.district,
    isOrganic: req.body.isOrganic === 'true' || req.body.isOrganic === true,
    images: uploadedImages,
    deliveryOptions,
    tags,
    certifications,
    minimumOrder: req.body.minimumOrder ? Number(req.body.minimumOrder) : product.minimumOrder,
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('farmer', 'fullName district')

  sendResponse(res, 200, { product }, 'Product updated successfully')
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer/Admin)
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ApiError('Product not found', 404))
  }

  // Check ownership
  if (req.user.userType === 'farmer' && product.farmer.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to delete this product', 403))
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img.publicId && !img.url.includes('placehold.co')) {
        deleteFromCloudinary(img.publicId).catch(console.error)
      }
    })
  }

  await product.deleteOne()

  sendResponse(res, 200, {}, 'Product deleted successfully')
})

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/toggle-availability
// @access  Private (Farmer)
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

  sendResponse(res, 200, { product }, 'Product availability updated')
})

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = [
    { category: 'vegetables', count: await Product.countDocuments({ category: 'vegetables', isAvailable: true }) },
    { category: 'fruits', count: await Product.countDocuments({ category: 'fruits', isAvailable: true }) },
    { category: 'grains', count: await Product.countDocuments({ category: 'grains', isAvailable: true }) },
    { category: 'pulses', count: await Product.countDocuments({ category: 'pulses', isAvailable: true }) },
    { category: 'spices', count: await Product.countDocuments({ category: 'spices', isAvailable: true }) },
    { category: 'dairy', count: await Product.countDocuments({ category: 'dairy', isAvailable: true }) },
  ]

  sendResponse(res, 200, { categories }, 'Categories fetched successfully')
})

// @desc    Get products by farmer
// @route   GET /api/products/farmer/:farmerId
// @access  Public
export const getProductsByFarmer = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    farmer: req.params.farmerId,
    isAvailable: true,
  })
    .populate('farmer', 'fullName district')
    .sort({ createdAt: -1 })

  sendResponse(res, 200, { products }, 'Farmer products fetched successfully')
})

// @desc    Search autocomplete
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
  })
    .select('cropName category')
    .limit(10)

  sendResponse(res, 200, { suggestions }, 'Suggestions fetched successfully')
})