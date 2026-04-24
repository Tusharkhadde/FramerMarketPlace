import ChatRoom from '../models/ChatRoom.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { sendResponse } from '../utils/apiResponse.js'
import { sendEmail } from '../services/email.service.js'

// @desc    Get or create a chat room with a specific user
// @route   POST /api/chat/rooms
// @access  Private
export const getOrCreateRoom = asyncHandler(async (req, res, next) => {
  const { recipientId, productId } = req.body

  if (!recipientId) {
    return next(new ApiError('Recipient ID is required', 400))
  }

  // Find existing room
  let room = await ChatRoom.findOne({
    participants: { $all: [req.user.id, recipientId] }
  }).populate('participants', 'fullName avatar userType')

  // Create new room if doesn't exist
  if (!room) {
    room = await ChatRoom.create({
      participants: [req.user.id, recipientId],
      product: productId || null
    })
    room = await room.populate('participants', 'fullName avatar userType')
  }

  sendResponse(res, 200, { room }, 'Chat room fetched successfully')
})

// @desc    Get all chat rooms for the logged in user
// @route   GET /api/chat/rooms
// @access  Private
export const getUserRooms = asyncHandler(async (req, res, next) => {
  const rooms = await ChatRoom.find({ participants: req.user.id })
    .populate('participants', 'fullName avatar userType')
    .populate('lastMessage')
    .populate('product', 'cropName images')
    .sort({ updatedAt: -1 })

  sendResponse(res, 200, { rooms }, 'Chat rooms fetched successfully')
})

// @desc    Get messages for a specific room
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params

  const room = await ChatRoom.findById(roomId)
  if (!room || !room.participants.includes(req.user.id)) {
    return next(new ApiError('Chat room not found or unauthorized', 404))
  }

  const messages = await Message.find({ chatRoom: roomId })
    .populate('sender', 'fullName avatar')
    .sort({ createdAt: 1 })

  // Mark unread messages as read
  await Message.updateMany(
    { chatRoom: roomId, sender: { $ne: req.user.id }, isRead: false },
    { $set: { isRead: true } }
  )

  sendResponse(res, 200, { messages }, 'Messages fetched successfully')
})

// @desc    Send a message
// @route   POST /api/chat/rooms/:roomId/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params
  const { content, messageType, voiceUrl } = req.body

  const room = await ChatRoom.findById(roomId)
  if (!room || !room.participants.includes(req.user.id)) {
    return next(new ApiError('Chat room not found or unauthorized', 404))
  }

  const message = await Message.create({
    chatRoom: roomId,
    sender: req.user.id,
    content,
    messageType: messageType || 'text',
    voiceUrl
  })

  // Update last message in room
  room.lastMessage = message._id
  await room.save()

  await message.populate('sender', 'fullName avatar')

  // Find the recipient
  const recipientId = room.participants.find(p => p.toString() !== req.user.id)
  
  // EMAIL NOTIFICATION LOGIC
  // Check if this is the *first* unread message from this sender in a while
  // To prevent spam, we only send an email if there were 0 unread messages BEFORE this one.
  const previousUnreadCount = await Message.countDocuments({
    chatRoom: roomId,
    sender: req.user.id,
    isRead: false,
    _id: { $ne: message._id } // exclude the one we just created
  })

  if (previousUnreadCount === 0) {
    const recipient = await User.findById(recipientId)
    const sender = await User.findById(req.user.id)
    
    if (recipient) {
      // Fire email notification asynchronously
      sendEmail({
        email: recipient.email,
        template: 'newChatMessage',
        data: {
          recipientName: recipient.fullName,
          senderName: sender.fullName,
          messagePreview: messageType === 'voice' ? '🎤 Voice Note' : content.substring(0, 50) + '...',
          chatUrl: `${process.env.CLIENT_URL}/messages`
        }
      }).catch(err => console.error('Failed to send chat email notification', err))
    }
  }

  sendResponse(res, 201, { message }, 'Message sent successfully')
})
