import dotenv from 'dotenv'
dotenv.config()

import app from './src/app.js'
import connectDB from './src/config/db.js'

import { Server } from 'socket.io'
import notificationService from './src/services/notification.service.js'

const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB().then(() => {
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  })

  // Socket.io initialization
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    },
  })

  // Initialize notification service with socket instance
  notificationService.init(io)

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id)

    // Join a room based on user ID for private notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString())
        console.log(`👤 User ${userId} joined room`)
      }
    })

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected')
    })
  })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`)
  server.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`)
  process.exit(1)
})