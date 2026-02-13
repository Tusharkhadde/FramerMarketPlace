import multer from 'multer'
import { ApiError } from '../utils/apiError.js'

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage()

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new ApiError('Only image files are allowed!', 400), false)
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5, // Max 5 files
  },
})

// Single file upload
export const uploadSingle = (fieldName) => upload.single(fieldName)

// Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount)

// Handle multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('File too large. Maximum size is 5MB', 400))
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError('Too many files. Maximum is 5 files', 400))
    }
    return next(new ApiError(err.message, 400))
  }
  next(err)
}