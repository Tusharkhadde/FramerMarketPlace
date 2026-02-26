import crypto from 'crypto'
import User from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendResponse } from '../utils/apiResponse.js'
import { sendEmail } from '../services/email.service.js'

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, password, userType, district, taluka, village, farmSize } = req.body

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  })

  if (existingUser) {
    return next(new ApiError('User with this email or phone already exists', 400))
  }

  // Create user object based on user type
  const userData = {
    fullName,
    email,
    phone,
    password,
    userType,
  }

  // Add farmer-specific fields
  if (userType === 'farmer') {
    if (!district) {
      return next(new ApiError('District is required for farmers', 400))
    }
    userData.district = district
    userData.taluka = taluka
    userData.village = village
    userData.farmSize = farmSize
  }

  // Create user
  const user = await User.create(userData)

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Farmer Marketplace!',
      template: 'welcome',
      data: {
        name: user.fullName,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error('Welcome email failed:', error)
    // Don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res, 'Registration successful')
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  console.log("Login controller running")
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400))
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ApiError('Invalid credentials', 401))
  }

  // Check if user is banned
  if (user.isBanned) {
    return next(new ApiError('Your account has been suspended. Please contact support.', 403))
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ApiError('Your account is deactivated', 403))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ApiError('Invalid credentials', 401))
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  sendTokenResponse(user, 200, res, 'Login successful')
})

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  sendResponse(res, 200, {}, 'Logged out successfully')
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  sendResponse(res, 200, { user }, 'User fetched successfully')
})

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(new ApiError('Please provide current and new password', 400))
  }

  const user = await User.findById(req.user.id).select('+password')

  // Check current password
  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) {
    return next(new ApiError('Current password is incorrect', 401))
  }

  // Update password
  user.password = newPassword
  await user.save()

  sendTokenResponse(user, 200, res, 'Password updated successfully')
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    return next(new ApiError('No user found with this email', 404))
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  await user.save({ validateBeforeSave: false })

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      data: {
        name: user.fullName,
        resetUrl,
      },
    })

    sendResponse(res, 200, {}, 'Password reset email sent')
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })

    return next(new ApiError('Email could not be sent', 500))
  }
})

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body
  const { resetToken } = req.params

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(new ApiError('Invalid or expired reset token', 400))
  }

  // Set new password
  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res, 'Password reset successful')
})

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params

  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await User.findOne({ emailVerificationToken })

  if (!user) {
    return next(new ApiError('Invalid verification token', 400))
  }

  user.emailVerifiedAt = new Date()
  user.emailVerificationToken = undefined
  await user.save({ validateBeforeSave: false })

  sendResponse(res, 200, {}, 'Email verified successfully')
})

// Helper function to get token and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }

  // Remove password from output
  const userResponse = user.toObject()
  delete userResponse.password

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      data: {
        token,
        user: userResponse,
      },
    })
}