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
export const emailTemplates = {
  welcome: (data) => {
    const isFarmer = data.userType === 'farmer';
    const subject = isFarmer ? 'Welcome to Farmer Marketplace - Farmer Registration 🌾' : 'Welcome to Farmer Marketplace! 🛒';
    
    const content = isFarmer ? `
      <h2>Dear ${data.name},</h2>
      <p>Thank you for registering with Farmer Marketplace.</p>
      <p>Your farmer account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>List your produce for buyers</li>
        <li>Manage product availability</li>
        <li>Receive buyer inquiries directly</li>
        <li>Grow your customer network</li>
      </ul>
      <p>We’re excited to support your business.</p>
      <p>If you need help setting up your listings, feel free to contact us.</p>
    ` : `
      <h2>Dear ${data.name},</h2>
      <p>Thank you for signing up for Farmer Marketplace.</p>
      <p>Your account has been successfully created, and you can now start exploring fresh produce directly from trusted farmers.</p>
      <p>With your buyer account, you can:</p>
      <ul>
        <li>Browse available products</li>
        <li>Contact farmers directly</li>
        <li>Compare listings and prices</li>
        <li>Manage your orders efficiently</li>
      </ul>
      <p>We’re excited to have you with us.</p>
      <p>If you need any assistance, feel free to reply to this email.</p>
    `;

    return {
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px; }
            .content h2 { color: #16a34a; margin-top: 0; }
            .content ul { padding-left: 20px; }
            .content li { margin-bottom: 10px; }
            .button { display: inline-block; background: #22c55e; color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2); }
            .footer { background: #f9fafb; text-align: center; padding: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #edf2f7; }
            .footer p { margin: 5px 0; }
            .website-link { color: #22c55e; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isFarmer ? '👨‍🌾 Farmer Marketplace' : '🛒 Farmer Marketplace'}</h1>
            </div>
            <div class="content">
              ${content}
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/login" class="button">Access Your Account</a>
              </div>
              <p>Best regards,<br/><strong>The Farmer Marketplace Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Farmer Marketplace. All rights reserved.</p>
              <p><a href="${process.env.CLIENT_URL}" class="website-link">www.farmermarketplace.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

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
    subject: `✅ Order Confirmed! - #${data.orderNumber} 🛒`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 40px; }
          .order-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
          .item:last-child { border-bottom: none; }
          .total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 20px; font-weight: 800; color: #16a34a; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
          .info-box { background: #ffffff; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 5px; }
          .info-value { font-size: 15px; color: #1e293b; font-weight: 500; }
          .button { display: inline-block; background: #22c55e; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; width: 100%; text-align: center; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2); }
          .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p style="opacity: 0.9; margin-top: 5px;">Order #${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0; color: #1e293b;">Thank you for your order, ${data.buyerName}!</h2>
            <p style="color: #64748b;">We've received your order and the farmers have been notified. You'll receive another update once your produce is on its way.</p>
            
            <div class="order-card">
              <h3 style="margin-top: 0; font-size: 16px; color: #475569;">Order Summary</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span style="color: #1e293b; font-weight: 500;">${item.name} <small style="color: #64748b;">x ${item.quantity}kg</small></span>
                  <span style="color: #1e293b; font-weight: 600;">₹${item.subtotal}</span>
                </div>
              `).join('')}
              <div class="total-row">
                <span>Total Amount</span>
                <span>₹${data.total}</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">📍 Delivery Address</div>
                <div class="info-value">${data.deliveryAddress}</div>
              </div>
              <div class="info-box">
                <div class="info-label">🚚 Estimated Delivery</div>
                <div class="info-value">${data.estimatedDelivery}</div>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" class="button">Track Your Order</a>
            
            <p style="text-align: center; font-size: 14px; color: #94a3b8; margin-top: 20px;">Questions? Reply to this email or visit our Help Center.</p>
          </div>
          <div class="footer">
            <p>© 2026 Farmer Marketplace. Growing together.</p>
            <p>Maharashtra, India</p>
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

  newOrderFarmer: (data) => ({
    subject: `🌾 New Order Received! - #${data.orderNumber} 💰`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f0fdf4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 40px; }
          .order-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
          .item:last-child { border-bottom: none; }
          .earning-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 20px; font-weight: 800; color: #16a34a; }
          .buyer-card { background: #ffffff; border: 1px solid #dcfce7; border-left: 5px solid #22c55e; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .info-row { margin-bottom: 10px; display: flex; align-items: center; }
          .info-label { font-size: 13px; color: #64748b; width: 100px; font-weight: 600; }
          .info-value { font-size: 15px; color: #1e293b; font-weight: 500; }
          .button { display: inline-block; background: #16a34a; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; width: 100%; text-align: center; }
          .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 New Order Received!</h1>
            <p style="opacity: 0.9; margin-top: 5px;">Order #${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0; color: #1e293b;">Great news, ${data.farmerName}!</h2>
            <p style="color: #64748b;">A buyer has placed an order for your fresh produce. Please review the details below and prepare for fulfillment.</p>
            
            <div class="order-card">
              <h3 style="margin-top: 0; font-size: 16px; color: #475569;">Items Ordered</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span style="color: #1e293b; font-weight: 500;">${item.name} <small style="color: #64748b;">x ${item.quantity}kg</small></span>
                  <span style="color: #1e293b; font-weight: 600;">₹${item.subtotal}</span>
                </div>
              `).join('')}
              <div class="earning-row">
                <span>Your Earning</span>
                <span>₹${data.items.reduce((sum, item) => sum + item.subtotal, 0)}</span>
              </div>
            </div>

            <div class="buyer-card">
              <h3 style="margin-top: 0; font-size: 16px; color: #166534; margin-bottom: 15px;">👤 Buyer Information</h3>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${data.buyerName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${data.buyerEmail}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${data.buyerPhone || 'Not provided'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Address:</div>
                <div class="info-value">${data.deliveryAddress}</div>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL}/farmer/orders" class="button">Go to Dashboard</a>
            
            <p style="text-align: center; font-size: 14px; color: #94a3b8; margin-top: 20px;">Prompt fulfillment leads to better ratings!</p>
          </div>
          <div class="footer">
            <p>© 2026 Farmer Marketplace. Empowering our growers.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderStatusUpdate: (data) => ({
    subject: `📦 Order Status Update - #${data.orderNumber} ⚡`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 40px; }
          .status-container { text-align: center; margin: 30px 0; }
          .status-label { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
          .status-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 12px 24px; border-radius: 50px; font-weight: 800; font-size: 20px; margin-top: 10px; border: 2px solid #bfdbfe; }
          .note-card { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
          .button { display: inline-block; background: #3b82f6; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; width: 100%; text-align: center; }
          .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
            <p style="opacity: 0.9; margin-top: 5px;">Order #${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0; color: #1e293b;">Hello ${data.buyerName},</h2>
            <p style="color: #64748b;">There's an update on your order. The status has been changed to:</p>
            
            <div class="status-container">
              <div class="status-label">Current Status</div>
              <div class="status-badge">${data.status}</div>
            </div>

            ${data.note ? `
              <div class="note-card">
                <div style="font-weight: 700; color: #92400e; margin-bottom: 5px; font-size: 13px;">📝 Message from Farmer:</div>
                <div style="color: #b45309; font-style: italic; font-size: 15px;">"${data.note}"</div>
              </div>
            ` : ''}

            <p style="color: #64748b;">You can view the full details and history of your order in your dashboard.</p>
            
            <a href="${process.env.CLIENT_URL}/orders" class="button">View Order History</a>
          </div>
          <div class="footer">
            <p>© 2026 Farmer Marketplace. Keeping you informed.</p>
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