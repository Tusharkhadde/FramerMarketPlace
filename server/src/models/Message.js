import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: false // Optional if it's a voice note
    },
    messageType: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text'
    },
    voiceUrl: {
      type: String // Cloudinary URL for voice notes
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model('Message', messageSchema)
