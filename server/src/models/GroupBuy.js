import mongoose from 'mongoose';

const groupBuySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetQuantity: {
    type: Number,
    required: true,
    min: [1, 'Target quantity must be at least 1']
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'reached', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: {
      type: Number,
      required: true
    },
    paid: {
      type: Boolean,
      default: false
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  minParticipantQuantity: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
groupBuySchema.virtual('progress').get(function() {
  return Math.min(100, (this.currentQuantity / this.targetQuantity) * 100);
});

// Check if expired
groupBuySchema.methods.checkExpiry = function() {
  if (this.status === 'active' && new Date() > this.expiryDate) {
    this.status = 'expired';
    return true;
  }
  return false;
};

const GroupBuy = mongoose.model('GroupBuy', groupBuySchema);

export default GroupBuy;
