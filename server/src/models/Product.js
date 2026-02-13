import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
      trim: true,
      maxlength: [100, 'Crop name cannot be more than 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
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
      required: [true, 'Please select quality grade'],
      enum: ['A', 'B', 'C'],
    },
    harvestDate: {
      type: Date,
      required: [true, 'Please add harvest date'],
    },
    expiryDate: Date,
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
      },
    ],
    district: {
      type: String,
      required: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    certifications: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Can be set to false if admin approval required
    },
    views: {
      type: Number,
      default: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    tags: [String],
    minimumOrder: {
      type: Number,
      default: 1,
    },
    deliveryOptions: {
      pickup: {
        type: Boolean,
        default: true,
      },
      delivery: {
        type: Boolean,
        default: true,
      },
      deliveryRadius: {
        type: Number, // in km
        default: 50,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes for search and filtering
productSchema.index({ cropName: 'text', description: 'text' })
productSchema.index({ farmer: 1 })
productSchema.index({ category: 1 })
productSchema.index({ district: 1 })
productSchema.index({ pricePerKg: 1 })
productSchema.index({ qualityGrade: 1 })
productSchema.index({ isAvailable: 1 })
productSchema.index({ createdAt: -1 })

// Virtual for checking if product is fresh (harvested within 7 days)
productSchema.virtual('isFresh').get(function () {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return this.harvestDate >= sevenDaysAgo
})

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.quantityAvailable === 0) return 'out_of_stock'
  if (this.quantityAvailable < 10) return 'low_stock'
  return 'in_stock'
})

const Product = mongoose.model('Product', productSchema)

export default Product