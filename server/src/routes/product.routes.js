// import express from 'express'
// import {
//   createProduct,
//   getProducts,
//   getProductById,
//   getMyProducts,
//   updateProduct,
//   deleteProduct,
//   toggleAvailability,
//   getCategories,
//   getProductsByFarmer,
//   searchAutocomplete,
// } from '../controllers/product.controller.js'
// import { protect, authorize } from '../middleware/auth.middleware.js'
// import { upload } from '../middleware/upload.middleware.js'

// const router = express.Router()

// // Public routes
// router.get('/', getProducts)
// router.get('/categories', getCategories)
// router.get('/search/autocomplete', searchAutocomplete)
// router.get('/farmer/:farmerId', getProductsByFarmer)
// router.get('/:id', getProductById)

// // Protected routes (Farmers only)
// router.use(protect)

// router.get('/my/products', authorize('farmer'), getMyProducts)

// router.post(
//   '/',
//   authorize('farmer'),
//   upload.array('images', 5),
//   createProduct
// )

// router.put(
//   '/:id',
//   authorize('farmer', 'admin'),
//   upload.array('images', 5),
//   updateProduct
// )

// router.delete('/:id', authorize('farmer', 'admin'), deleteProduct)

// router.patch(
//   '/:id/toggle-availability',
//   authorize('farmer'),
//   toggleAvailability
// )

// export default router
// import express from 'express'
// import {
//   createProduct,
//   getProducts,
//   getProductById,
//   getMyProducts,
//   updateProduct,
//   deleteProduct,
//   toggleAvailability,
//   getCategories,
//   getProductsByFarmer,
//   searchAutocomplete,
// } from '../controllers/product.controller.js'
// import { protect, authorize } from '../middleware/auth.middleware.js'
// import { upload } from '../middleware/upload.middleware.js'

// const router = express.Router()

// // Public routes
// router.get('/', getProducts)
// router.get('/categories', getCategories)
// router.get('/search/autocomplete', searchAutocomplete)
// router.get('/farmer/:farmerId', getProductsByFarmer)
// router.get('/:id', getProductById)

// // Protected routes (Farmers only)
// router.use(protect)

// router.get('/my/products', authorize('farmer'), getMyProducts)

// router.post(
//   '/',
//   authorize('farmer'),
//   upload.array('images', 5),
//   createProduct
// )

// router.put(
//   '/:id',
//   authorize('farmer', 'admin'),
//   upload.array('images', 5),
//   updateProduct
// )

// router.delete('/:id', authorize('farmer', 'admin'), deleteProduct)

// router.patch(
//   '/:id/toggle-availability',
//   authorize('farmer'),
//   toggleAvailability
// )

// export default router
import express from 'express'
import Product from '../models/Product.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, district, minPrice, maxPrice, qualityGrade, isOrganic, featured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { isAvailable: true, isApproved: true }

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
    if (minPrice || maxPrice) {
      query.pricePerKg = {}
      if (minPrice) query.pricePerKg.$gte = Number(minPrice)
      if (maxPrice) query.pricePerKg.$lte = Number(maxPrice)
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    const skip = (Number(page) - 1) * Number(limit)

    const products = await Product.find(query)
      .populate('farmer', 'fullName district phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      data: {
        products,
        total,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'fullName district phone email village')
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    product.views += 1
    await product.save({ validateBeforeSave: false })
    res.json({ success: true, data: { product } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get my products (farmer)
router.get('/my/products', protect, authorize('farmer'), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 })
    res.json({ success: true, data: { products } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create product
router.post('/', protect, authorize('farmer'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('Creating product...')
    console.log('Body:', req.body)
    console.log('Files:', req.files?.length || 0)

    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        publicId: file.filename,
      }))
    } else {
      images = [{ url: 'https://via.placeholder.com/400x400.png?text=Product', publicId: null }]
    }

    // Parse JSON fields
    let deliveryOptions = { pickup: true, delivery: true, deliveryRadius: 50 }
    let tags = []
    let certifications = []

    try { if (req.body.deliveryOptions) deliveryOptions = JSON.parse(req.body.deliveryOptions) } catch (e) { }
    try { if (req.body.tags) tags = JSON.parse(req.body.tags) } catch (e) { }
    try { if (req.body.certifications) certifications = JSON.parse(req.body.certifications) } catch (e) { }

    const product = await Product.create({
      farmer: req.user.id,
      cropName: req.body.cropName,
      category: req.body.category,
      description: req.body.description || '',
      quantityAvailable: Number(req.body.quantityAvailable),
      unit: req.body.unit || 'kg',
      pricePerKg: Number(req.body.pricePerKg),
      qualityGrade: req.body.qualityGrade || 'A',
      harvestDate: new Date(req.body.harvestDate),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      district: req.body.district,
      isOrganic: req.body.isOrganic === 'true',
      images,
      deliveryOptions,
      tags,
      certifications,
      minimumOrder: Number(req.body.minimumOrder) || 1,
    })

    await product.populate('farmer', 'fullName district')
    console.log('Product created:', product._id)

    res.status(201).json({ success: true, message: 'Product created', data: { product } })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete product
router.delete('/:id', protect, authorize('farmer', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    if (req.user.userType === 'farmer' && product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    await product.deleteOne()
    res.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Toggle availability
router.patch('/:id/toggle-availability', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product || product.farmer.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    product.isAvailable = !product.isAvailable
    await product.save()
    res.json({ success: true, data: { product } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Categories
router.get('/data/categories', async (req, res) => {
  const categories = ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other']
  res.json({ success: true, data: { categories } })
})

export default router