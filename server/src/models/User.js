import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address',
    ],
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please add a valid Indian phone number (10 digits starting with 6-9)'],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true, // allows null but enforces uniqueness when set
    index: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: [true, 'Please specify user type'],
  },
  district: String,
  taluka: String,
  village: String,
  farmSize: Number,
  avatar: {
    url: String,
    publicId: String,
  },
  addresses: [{
    label: { type: String, default: 'home' },
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    district: String,
    state: { type: String, default: 'Maharashtra' },
    pincode: String,
    isDefault: { type: Boolean, default: false },
  }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    price: Number,
  }],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ userType: 1 })
userSchema.index({ district: 1 })

// Hash password before saving (skip for Google OAuth users)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

// Match password (not applicable for Google auth)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)