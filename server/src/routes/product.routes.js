import express from 'express'
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getCategories,
  getProductsByFarmer,
  searchAutocomplete,
  getSustainabilityStats,
} from '../controllers/product.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/search/autocomplete', searchAutocomplete)
router.get('/farmer/:farmerId', getProductsByFarmer)
router.get('/sustainability-stats', getSustainabilityStats)
router.get('/:id', getProductById)

// Protected routes
router.use(protect)

router.get('/my/products', authorize('farmer'), getMyProducts)

router.post(
  '/',
  authorize('farmer'),
  upload.array('images', 5),
  createProduct
)

router.put(
  '/:id',
  authorize('farmer', 'admin'),
  upload.array('images', 5),
  updateProduct
)

router.delete('/:id', authorize('farmer', 'admin'), deleteProduct)

router.patch(
  '/:id/toggle-availability',
  authorize('farmer'),
  toggleAvailability
)

export default router