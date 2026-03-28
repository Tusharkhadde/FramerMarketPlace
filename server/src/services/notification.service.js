import Notification from '../models/Notification.js'
import smsService from './sms.service.js'

class NotificationService {
  constructor() {
    this.io = null
  }

  /**
   * Initialize socket.io instance
   * @param {object} io - Socket.io instance
   */
  init(io) {
    this.io = io
  }

  /**
   * Create and send a notification
   */
  async createNotification({
    recipient,
    sender,
    type,
    title,
    content,
    link,
    metadata,
    sendSMS = false,
    phone = null
  }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        content,
        link,
        metadata,
      })

      // Send via Socket.io if initialized
      if (this.io) {
        this.io.to(recipient.toString()).emit('new-notification', {
          notification,
          unreadCount: await Notification.countDocuments({ recipient, isRead: false })
        })
      }

      // Send SMS if requested
      if (sendSMS && phone) {
        await smsService.sendSMS(phone, `${title}: ${content}`)
      }

      return notification
    } catch (error) {
      console.error('❌ [NOTIFICATION SERVICE] Error creating notification:', error.message)
      throw error
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(userId, limit = 20, skip = 0) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender', 'fullName avatar')
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false })
  }

  /**
   * Mark as read
   */
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    )
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    )
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId })
  }
}

export default new NotificationService()
