// import express from 'express'
// import cors from 'cors'
// import helmet from 'helmet'
// import morgan from 'morgan'
// import cookieParser from 'cookie-parser'
// import rateLimit from 'express-rate-limit'

// // Import routes
// import authRoutes from './routes/auth.routes.js'
// //import userRoutes from './routes/user.routes.js'
// import productRoutes from './routes/product.routes.js'
// import orderRoutes from './routes/order.routes.js'
// //import paymentRoutes from './routes/payment.routes.js'
// //import apmcRoutes from './routes/apmc.routes.js'
// //import aiRoutes from './routes/ai.routes.js'
// //import adminRoutes from './routes/admin.routes.js'

// // Import middleware
// import errorHandler from './middleware/error.middleware.js'

// const app = express()

// // Security middleware
// app.use(helmet())

// // CORS configuration
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }))

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//   message: {
//     success: false,
//     message: 'Too many requests, please try again later.',
//   },
// })
// app.use('/api', limiter)

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// app.use(cookieParser())

// // Logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'))
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Server is healthy',
//     timestamp: new Date().toISOString(),
//   })
// })

// // API Routes
// app.use('/api/auth', authRoutes)
// // app.use('/api/users', userRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/orders', orderRoutes)
// // app.use('/api/payments', paymentRoutes)
// // app.use('/api/apmc', apmcRoutes)
// // app.use('/api/ai', aiRoutes)
// // app.use('/api/admin', adminRoutes)

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//   })
// })

// // Global error handler
// app.use(errorHandler)

// export default app
// import express from 'express'
// import cors from 'cors'
// import morgan from 'morgan'
// import helmet from 'helmet'
// import rateLimit from 'express-rate-limit'
// import mongoSanitize from 'express-mongo-sanitize'

// // Import routes
// import authRoutes from './routes/auth.routes.js'
// import productRoutes from './routes/product.routes.js'
// import cartRoutes from './routes/cart.routes.js'
// import orderRoutes from './routes/order.routes.js'
// import userRoutes from './routes/user.routes.js'
// import paymentRoutes from './routes/payment.routes.js'
// import apmcRoutes from './routes/apmc.routes.js'

// // Import middleware
// import errorHandler from './middleware/error.middleware.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const app = express()
// // Security middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' },
// }))

// // CORS
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true,
// }))

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
// })
// app.use('/api', limiter)

// // Body parser
// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// // Sanitize data
// app.use(mongoSanitize())

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'))
// }

// // Routes
// app.use('/api/auth', authRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/cart', cartRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/payment', paymentRoutes)
// app.use('/api/apmc', apmcRoutes)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// // Health check
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'OK', timestamp: new Date() })
// })

// // Error handler
// app.use(errorHandler)

// export default app
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

// Routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import userRoutes from './routes/user.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

export default app