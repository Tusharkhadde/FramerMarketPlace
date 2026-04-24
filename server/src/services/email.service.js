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
            <p>© 2026 Farmer Marketplace. All rights reserved.</p>
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
            <p>© 2026 Farmer Marketplace. All rights reserved.</p>
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
            <p>© 2026 Farmer Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newChatMessage: (data) => ({
    subject: `New Message from ${data.senderName} - Farmer Marketplace`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message Received</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }
          .header-icon { font-size: 32px; margin-bottom: 10px; display: block; }
          .header-title { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; margin-top: 0; color: #111827; }
          .message-context { color: #6b7280; font-size: 15px; margin-bottom: 25px; }
          .message-card { background: #f8fafc; border-left: 4px solid #22c55e; border-radius: 0 12px 12px 0; padding: 20px; margin: 25px 0; position: relative; }
          .message-card::before { content: '"'; font-size: 40px; color: #cbd5e1; position: absolute; top: 10px; left: 15px; font-family: serif; line-height: 1; }
          .message-text { color: #334155; font-size: 16px; font-style: italic; margin: 0; padding-left: 30px; line-height: 1.5; }
          .action-container { text-align: center; margin-top: 35px; }
          .button { display: inline-block; background: #22c55e; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background 0.3s ease; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2); }
          .button:hover { background: #16a34a; }
          .footer { text-align: center; padding: 25px; color: #9ca3af; font-size: 13px; background: #f9fafb; border-top: 1px solid #f3f4f6; }
          .footer p { margin: 5px 0; }
          .brand { font-weight: 600; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="header-icon">💬</span>
            <h2 class="header-title">New Message</h2>
          </div>
          <div class="content">
            <p class="greeting">Hi <strong>${data.recipientName}</strong>,</p>
            <p class="message-context"><strong>${data.senderName}</strong> sent you a direct message regarding your marketplace activity.</p>
            
            <div class="message-card">
              <p class="message-text">${data.messagePreview}</p>
            </div>
            
            <div class="action-container">
              <a href="${data.chatUrl}" class="button">View Conversation</a>
            </div>
          </div>
          <div class="footer">
            <p>You're receiving this notification because you have an unread message.</p>
            <p class="brand">© 2026 Farmer Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newCommunityDeal: (data) => ({
    subject: `🔥 New Community Deal: ${data.cropName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }
          .header-title { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 40px 30px; text-align: center; }
          .deal-box { background: #f8fafc; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; margin: 25px 0; }
          .price { font-size: 28px; font-weight: 900; color: #16a34a; }
          .button { display: inline-block; background: #22c55e; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .footer { text-align: center; padding: 25px; color: #9ca3af; font-size: 13px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="header-title">🤝 New Community Deal!</h2>
          </div>
          <div class="content">
            <p style="font-size: 18px; margin-top: 0;"><strong>${data.farmerName}</strong> just launched a new bulk deal!</p>
            
            <div class="deal-box">
              <h3 style="margin: 0 0 10px 0; font-size: 22px;">${data.cropName}</h3>
              <p style="margin: 0 0 5px 0; text-decoration: line-through; color: #6b7280;">Regular Price: ₹${data.regularPrice}/kg</p>
              <div class="price">Group Price: ₹${data.discountPrice}/kg</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #4b5563;">Goal: ${data.targetQuantity}kg</p>
            </div>
            
            <p style="margin-bottom: 25px; color: #4b5563;">Join forces with other buyers to unlock this wholesale discount. You won't be charged unless the goal is reached!</p>
            
            <a href="${data.dealUrl}" class="button">View & Join Deal</a>
          </div>
          <div class="footer">
            <p>You received this email because you are registered as a buyer.</p>
            <p>© 2026 Farmer Marketplace. All rights reserved.</p>
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