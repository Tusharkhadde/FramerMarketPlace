import express from 'express'
import passport from 'passport'
import User from '../models/User.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// ─── Register ────────────────────────────────────────────────────────────────

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
      authProvider: 'local',
    })

    const token = user.getSignedJwtToken()
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

// ─── Login ───────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Reject Google-only accounts from password login
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.',
      })
    }

    // Enforce account status
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated.' })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = user.getSignedJwtToken()
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: userResponse },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message || 'Login failed' })
  }
})

// ─── Get Current User ────────────────────────────────────────────────────────

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user' })
  }
})

// ─── Logout ──────────────────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// Step 1: Redirect user to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}))

// Step 2: Google redirects back here with code
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed` }),
  (req, res) => {
    try {
      const user = req.user
      const token = user.getSignedJwtToken()

      // Strip sensitive fields
      const userObj = user.toObject()
      delete userObj.password
      delete userObj.googleId

      // Redirect to frontend with token and user encoded in query params
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
      const params = new URLSearchParams({
        token,
        user: JSON.stringify(userObj),
      })

      res.redirect(`${clientUrl}/auth/callback?${params.toString()}`)
    } catch (error) {
      console.error('Google callback error:', error)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
      res.redirect(`${clientUrl}/login?error=auth_failed`)
    }
  }
)

export default router