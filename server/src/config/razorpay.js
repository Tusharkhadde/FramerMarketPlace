import Razorpay from 'razorpay'

const key_id = process.env.RAZORPAY_KEY_ID
const key_secret = process.env.RAZORPAY_KEY_SECRET

let razorpay

if (!key_id || !key_secret || key_id === 'your_razorpay_key_id') {
  console.warn('WARNING: Razorpay credentials are missing or invalid. Payment features will be disabled.')
  // Mock object to prevent crashes in other parts of the app
  razorpay = {
    orders: {
      create: () => Promise.reject(new Error('Razorpay not configured')),
    },
    payments: {
      fetch: () => Promise.reject(new Error('Razorpay not configured')),
      refund: () => Promise.reject(new Error('Razorpay not configured')),
    },
    validateWebhookSignature: () => false,
  }
} else {
  razorpay = new Razorpay({
    key_id,
    key_secret,
  })
}

export default razorpay