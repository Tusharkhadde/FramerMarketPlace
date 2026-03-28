/**
 * Mock SMS Service for development.
 * In production, replace with a real provider like Twilio, Vonage, or a local gateway.
 */
class SMSService {
  /**
   * Send an SMS message
   * @param {string} phone - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<boolean>}
   */
  async sendSMS(phone, message) {
    try {
      console.log('--------------------------------------------------')
      console.log('📩 [SMS SERVICE - MOCK] Sending SMS...')
      console.log(`📱 To: ${phone}`)
      console.log(`💬 Message: ${message}`)
      console.log('✅ SMS Sent Successfully (Mock)')
      console.log('--------------------------------------------------')
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (error) {
      console.error('❌ [SMS SERVICE] Failed to send SMS:', error.message)
      return false
    }
  }

  /**
   * Send Order Confirmation SMS
   */
  async sendOrderConfirmation(phone, orderNumber, total) {
    const message = `Order Confirmed! Your order #${orderNumber} for ₹${total} has been placed. We'll notify you when it's shipped. - FarmMarket`
    return this.sendSMS(phone, message)
  }

  /**
   * Send Order Status Update SMS
   */
  async sendOrderStatusUpdate(phone, orderNumber, status) {
    const message = `Order Update: Your order #${orderNumber} status has been updated to ${status}. Track it on FarmMarket.`
    return this.sendSMS(phone, message)
  }
}

export default new SMSService()
