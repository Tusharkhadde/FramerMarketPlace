import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cropName: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true,
    maxlength: [100, 'Crop name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Please add available quantity'],
    min: [0, 'Quantity cannot be negative'],
  },
  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'litre'],
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Please add price per kg'],
    min: [0, 'Price cannot be negative'],
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'A',
  },
  harvestDate: {
    type: Date,
    required: [true, 'Please add harvest date'],
  },
  expiryDate: Date,
  images: [{
    url: String,
    publicId: String,
  }],
  district: {
    type: String,
    required: [true, 'District is required'],
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  certifications: [String],
  tags: [String],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  minimumOrder: {
    type: Number,
    default: 1,
  },
  deliveryOptions: {
    pickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: true },
    deliveryRadius: { type: Number, default: 50 },
  },
}, { timestamps: true })

// Full-text search index
productSchema.index({ cropName: 'text', description: 'text', tags: 'text' })

// Compound indexes for common filter queries
productSchema.index({ category: 1, isAvailable: 1, isApproved: 1 })
productSchema.index({ district: 1, isAvailable: 1 })
productSchema.index({ farmer: 1 })
productSchema.index({ pricePerKg: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ isFeatured: 1, isAvailable: 1 })

export default mongoose.model('Product', productSchema)