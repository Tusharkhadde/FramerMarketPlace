import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    farmerReply: {
      comment: String,
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
)

// One review per order per product
reviewSchema.index({ order: 1, product: 1 }, { unique: true })
reviewSchema.index({ product: 1 })
reviewSchema.index({ farmer: 1 })
reviewSchema.index({ rating: 1 })

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].ratingCount,
    })
  }
}

// Update product rating after save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.product)
})

// Update product rating after remove
reviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.product)
})

const Review = mongoose.model('Review', reviewSchema)

export default Review