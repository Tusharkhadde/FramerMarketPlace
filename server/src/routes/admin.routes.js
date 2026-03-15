import express from 'express'

const router = express.Router()

// Admin dashboard stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin stats endpoint'
    }
  })
})

export default router
