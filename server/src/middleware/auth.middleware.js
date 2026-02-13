import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Protect routes - Verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    return next(new ApiError('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new ApiError('User not found', 404))
    }

    if (user.isBanned) {
      return next(new ApiError('Your account has been suspended', 403))
    }

    if (!user.isActive) {
      return next(new ApiError('Your account is deactivated', 403))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new ApiError('Not authorized to access this route', 401))
  }
})

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(
        new ApiError(
          `User role '${req.user.userType}' is not authorized to access this route`,
          403
        )
      )
    }
    next()
  }
}

// Optional auth - Continue even if not authenticated
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null
    }
  }

  next()
})