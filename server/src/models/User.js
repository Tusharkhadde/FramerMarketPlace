// import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

// const addressSchema = new mongoose.Schema({
//   label: {
//     type: String,
//     enum: ['home', 'work', 'other'],
//     default: 'home',
//   },
//   fullName: String,
//   phone: String,
//   addressLine1: {
//     type: String,
//     required: true,
//   },
//   addressLine2: String,
//   city: String,
//   district: String,
//   state: {
//     type: String,
//     default: 'Maharashtra',
//   },
//   pincode: {
//     type: String,
//     required: true,
//   },
//   isDefault: {
//     type: Boolean,
//     default: false,
//   },
// })

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: [true, 'Please add a name'],
//       trim: true,
//       maxlength: [50, 'Name cannot be more than 50 characters'],
//     },
//     email: {
//       type: String,
//       required: [true, 'Please add an email'],
//       unique: true,
//       lowercase: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         'Please add a valid email',
//       ],
//     },
//     phone: {
//       type: String,
//       required: [true, 'Please add a phone number'],
//       match: [/^[6-9]\d{9}$/, 'Please add a valid Indian phone number'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Please add a password'],
//       minlength: [6, 'Password must be at least 6 characters'],
//       select: false,
//     },
//     userType: {
//       type: String,
//       enum: ['farmer', 'buyer', 'admin'],
//       required: [true, 'Please specify user type'],
//     },
//     avatar: {
//       url: String,
//       publicId: String,
//     },
//     // Farmer specific fields
//     district: {
//       type: String,
//       required: function () {
//         return this.userType === 'farmer'
//       },
//     },
//     taluka: String,
//     village: String,
//     farmSize: {
//       type: Number, // in acres
//       min: 0,
//     },
//     farmAddress: String,
//     crops: [String], // Main crops grown
//     documents: {
//       aadharCard: String,
//       landDocument: String,
//       farmPhoto: String,
//     },
//     bankDetails: {
//       accountHolderName: String,
//       accountNumber: String,
//       ifscCode: String,
//       bankName: String,
//     },
//     // Buyer specific fields
//     addresses: [addressSchema],
//     // Common fields
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     isBanned: {
//       type: Boolean,
//       default: false,
//     },
//     verifiedAt: Date,
//     lastLogin: Date,
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,
//     emailVerificationToken: String,
//     emailVerifiedAt: Date,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// )

// // Indexes
// userSchema.index({ email: 1 })
// userSchema.index({ phone: 1 })
// userSchema.index({ userType: 1 })
// userSchema.index({ district: 1 })
// userSchema.index({ isVerified: 1 })

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     next()
//   }
//   const salt = await bcrypt.genSalt(10)
//   this.password = await bcrypt.hash(this.password, salt)
// })

// // Sign JWT and return
// userSchema.methods.getSignedJwtToken = function () {
//   return jwt.sign(
//     { id: this._id, userType: this.userType },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRE }
//   )
// }

// // Match entered password to hashed password
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password)
// }

// // Virtual for full address
// userSchema.virtual('fullAddress').get(function () {
//   if (this.userType === 'farmer') {
//     return `${this.village || ''}, ${this.taluka || ''}, ${this.district || ''}, Maharashtra`
//   }
//   return ''
// })

// const User = mongoose.model('User', userSchema)

// export default User
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: true,
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)