import express from 'express'
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate.middleware.js'
import { registerSchema, loginSchema } from '../utils/validators.js'

const router = express.Router()

router.post('/register', validateRequest(registerSchema), register)
router.post('/login', validateRequest(loginSchema), login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:resetToken', resetPassword)
router.put('/update-password', protect, updatePassword)
router.get('/verify-email/:token', verifyEmail)

export default router