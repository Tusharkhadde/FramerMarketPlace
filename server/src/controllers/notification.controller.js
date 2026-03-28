import notificationService from '../services/notification.service.js'

/**
 * Get user's notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user._id)
    const unreadCount = await notificationService.getUnreadCount(req.user._id)
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id)
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id)
    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id)
    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
