// import { ApiError } from '../utils/apiError.js'

// const errorHandler = (err, req, res, next) => {
//   let error = { ...err }
//   error.message = err.message

//   // Log for development
//   if (process.env.NODE_ENV === 'development') {
//     console.error('Error:', err)
//   }

//   // Mongoose bad ObjectId
//   if (err.name === 'CastError') {
//     const message = 'Resource not found'
//     error = new ApiError(message, 404)
//   }

//   // Mongoose duplicate key
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0]
//     const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
//     error = new ApiError(message, 400)
//   }

//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const messages = Object.values(err.errors).map((val) => val.message)
//     const message = messages.join(', ')
//     error = new ApiError(message, 400)
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     const message = 'Invalid token'
//     error = new ApiError(message, 401)
//   }

//   if (err.name === 'TokenExpiredError') {
//     const message = 'Token expired'
//     error = new ApiError(message, 401)
//   }

//   res.status(error.statusCode || 500).json({
//     success: false,
//     message: error.message || 'Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//   })
// }

// export default errorHandler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found'
    statusCode = 404
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered'
    statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ')
    statusCode = 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token'
    statusCode = 401
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired'
    statusCode = 401
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
export default errorHandler