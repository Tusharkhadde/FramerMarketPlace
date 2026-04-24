const fs = require('fs');
const file = 'server/src/services/email.service.js';
let content = fs.readFileSync(file, 'utf8');

const newTemplate = `
  newChatMessage: (data) => ({
    subject: \`New message from \${data.senderName}\`,
    html: \`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-preview { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; font-style: italic; color: #555; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message Received</h1>
          </div>
          <div class="content">
            <h2>Hi \${data.recipientName},</h2>
            <p>You have a new unread message from <strong>\${data.senderName}</strong>.</p>
            <div class="message-preview">
              "\${data.messagePreview}"
            </div>
            <a href="\${data.chatUrl}" class="button">Reply Now</a>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">You are receiving this email because you had no unread messages prior to this one. We only send one alert per new conversation burst.</p>
          </div>
          <div class="footer">
            <p>© 2024 Farmer Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    \`,
  }),
`;

content = content.replace(/orderConfirmation:([\s\S]*?)\},\n\}/, (match, p1) => {
  return `orderConfirmation:${p1}},${newTemplate}}`;
});

fs.writeFileSync(file, content);
