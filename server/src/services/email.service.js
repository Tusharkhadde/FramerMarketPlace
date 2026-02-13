import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to Farmer Marketplace! 🌾',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Welcome to Farmer Marketplace!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name}! 👋</h2>
            <p>Thank you for joining Farmer Marketplace as a <strong>${data.userType}</strong>.</p>
            ${data.userType === 'farmer' ? `
              <p>You can now:</p>
              <ul>
                <li>List your agricultural products</li>
                <li>Connect directly with buyers</li>
                <li>Get AI-powered price predictions</li>
                <li>View real-time APMC prices</li>
              </ul>
            ` : `
              <p>You can now:</p>
              <ul>
                <li>Browse fresh products from local farmers</li>
                <li>Order directly from farms</li>
                <li>Get quality assured produce</li>
                <li>Support local agriculture</li>
              </ul>
            `}
            <a href="${process.env.CLIENT_URL}/login" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 Farmer Marketplace. All rights reserved.</p>
            <p>Maharashtra, India</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  resetPassword: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 10 minutes.
            </div>
            <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© 2024 Farmer Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #22c55e; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Order #${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${data.buyerName}!</h2>
            <div class="order-box">
              <h3>Order Summary</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}kg</span>
                  <span>₹${item.subtotal}</span>
                </div>
              `).join('')}
              <div class="item total">
                <span>Total</span>
                <span>₹${data.total}</span>
              </div>
            </div>
            <h3>Delivery Address</h3>
            <p>${data.deliveryAddress}</p>
            <h3>Estimated Delivery</h3>
            <p>${data.estimatedDelivery}</p>
            <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" class="button">Track Order</a>
          </div>
          <div class="footer">
            <p>© 2024 Farmer Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

// Send email function
export const sendEmail = async ({ email, subject, template, data }) => {
  try {
    const transporter = createTransporter()

    // Get template
    const emailContent = emailTemplates[template]
      ? emailTemplates[template](data)
      : { subject, html: data.html || data.message }

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: emailContent.subject || subject,
      html: emailContent.html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Email error:', error)
    throw error
  }
}

// Send bulk emails
export const sendBulkEmail = async (recipients, subject, template, commonData) => {
  const results = []
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        email: recipient.email,
        subject,
        template,
        data: { ...commonData, ...recipient },
      })
      results.push({ email: recipient.email, success: true, result })
    } catch (error) {
      results.push({ email: recipient.email, success: false, error: error.message })
    }
  }
  
  return results
}