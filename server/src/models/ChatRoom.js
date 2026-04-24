import mongoose from 'mongoose'

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: true }
)

// Ensure uniqueness of a chat room between two exact participants for a specific product
// Or generally between two participants if product is not tied to every chat
// For a marketplace, separating chats by product is often helpful.
// If product is null, it's a general chat.
chatRoomSchema.index({ participants: 1, product: 1 })

export default mongoose.model('ChatRoom', chatRoomSchema)
