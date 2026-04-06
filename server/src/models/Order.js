import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productSnapshot: {
    cropName: String,
    pricePerKg: Number,
    qualityGrade: String,
    image: String,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  pricePerKg: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    deliveryAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: String,
      city: String,
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        default: 'Maharashtra',
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    deliverySchedule: {
      date: Date,
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
      },
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      deliveryCharges: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      couponCode: String,
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    estimatedDelivery: Date,
    actualDelivery: Date,
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ['buyer', 'farmer', 'admin'],
    },
    notes: String,
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
orderSchema.index({ buyer: 1 })
orderSchema.index({ 'items.farmer': 1 })
orderSchema.index({ orderStatus: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ createdAt: -1 })

// Generate order number before validation
orderSchema.pre('validate', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.orderNumber = `FM${year}${month}${random}`
  }
  next()
})

// Add status to history when status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
    })
  }
  next()
})

const Order = mongoose.model('Order', orderSchema)

export default Order