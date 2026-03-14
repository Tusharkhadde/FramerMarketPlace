// import express from 'express'
// import {
//   register,
//   login,
//   logout,
//   getMe,
//   forgotPassword,
//   resetPassword,
//   updatePassword,
//   verifyEmail,
// } from '../controllers/auth.controller.js'
// import { protect } from '../middleware/auth.middleware.js'
// import { validateRequest } from '../middleware/validate.middleware.js'
// import { registerSchema, loginSchema } from '../utils/validators.js'

// const router = express.Router()

// router.post('/register', validateRequest(registerSchema), register)
// router.post('/login', validateRequest(loginSchema), login)
// router.post('/logout', logout)
// router.get('/me', protect, getMe)
// router.post('/forgot-password', forgotPassword)
// router.put('/reset-password/:resetToken', resetPassword)
// router.put('/update-password', protect, updatePassword)
// router.get('/verify-email/:token', verifyEmail)

// export default router
import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, userType, district, taluka, village, farmSize } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone',
      })
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      userType,
      district,
      taluka,
      village,
      farmSize,
    })

    // Generate token
    const token = user.getSignedJwtToken()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { token, user: userResponse },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Generate token
    const token = user.getSignedJwtToken()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: userResponse },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    })
  }
})

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      data: { user },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
    })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
})

export default router