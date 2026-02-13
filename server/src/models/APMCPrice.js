import mongoose from 'mongoose'

const apmcPriceSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
      index: true,
    },
    market: {
      type: String,
      required: true,
    },
    commodity: {
      type: String,
      required: true,
      index: true,
    },
    variety: String,
    grade: {
      type: String,
      enum: ['FAQ', 'A', 'B', 'C', 'Local'],
      default: 'FAQ',
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    modalPrice: {
      type: Number,
      required: true,
    },
    arrivalQuantity: {
      type: Number, // in quintals
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient queries
apmcPriceSchema.index({ district: 1, commodity: 1, date: -1 })
apmcPriceSchema.index({ commodity: 1, date: -1 })

const APMCPrice = mongoose.model('APMCPrice', apmcPriceSchema)

export default APMCPrice