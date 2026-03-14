// import multer from 'multer'
// import path from 'path'

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
//   },
// })

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp/
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
//   const mimetype = allowedTypes.test(file.mimetype)

//   if (extname && mimetype) {
//     cb(null, true)
//   } else {
//     cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'))
//   }
// }

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// })
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, '../../uploads')
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true })
// }

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir)
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//     const ext = path.extname(file.originalname)
//     cb(null, `product-${uniqueSuffix}${ext}`)
//   },
// })

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp|gif/
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
//   const mimetype = allowedTypes.test(file.mimetype)

//   if (extname && mimetype) {
//     cb(null, true)
//   } else {
//     cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'), false)
//   }
// }

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// })
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)
  cb(isValid ? null : new Error('Only images allowed'), isValid)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})