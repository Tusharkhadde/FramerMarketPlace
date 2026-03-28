import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// All notification routes are protected
router.use(protect)

router.get('/', getNotifications)
router.patch('/mark-all-read', markAllAsRead)
router.patch('/:id/read', markAsRead)
router.delete('/:id', deleteNotification)

export default router
