import express from 'express'
import { 
  getOrCreateRoom, 
  getUserRooms, 
  getMessages, 
  sendMessage 
} from '../controllers/chat.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(protect)

router.post('/rooms', getOrCreateRoom)
router.get('/rooms', getUserRooms)
router.get('/rooms/:roomId/messages', getMessages)
router.post('/rooms/:roomId/messages', sendMessage)

export default router
