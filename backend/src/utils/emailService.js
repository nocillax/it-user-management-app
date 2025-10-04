const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Create nodemailer transporter
 * Nota bene: Using Gmail SMTP for simplicity - configure with app-specific password
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app-specific password for Gmail
    },
    // Add connection timeout settings - increase timeouts for Render
    connectionTimeout: 60000, // 60 seconds (default is 10 seconds)
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Add proxy handling in case Render requires it
    proxy: process.env.EMAIL_PROXY || null,
  });
};

/**
 * Send email verification email
 * Important: This function sends verification emails to new users
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 * @returns {Promise} Email sending result
 */
const sendVerificationEmail = async (email, name, token) => {
  // Maximum number of retry attempts
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError = null;

  // Retry loop for handling temporary connection issues
  while (retryCount <= MAX_RETRIES) {
    try {
      if (retryCount > 0) {
        console.log(
          `Retry attempt ${retryCount} for sending email to ${email}...`
        );
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
      }

      console.log(`Creating email transporter (attempt ${retryCount + 1})...`);
      const transporter = createTransporter();

      // Test transporter connection before sending
      console.log(`Verifying SMTP connection...`);
      await transporter.verify();
      console.log(`SMTP connection verified successfully!`);

      // Verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
      console.log(`Verification URL will be: ${verificationUrl}`);

      // Email template
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - NX IT-UMS</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">NX IT-UMS</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to our platform!</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1e293b; margin-bottom: 20px;">Verify Your Email Address</h2>
                    
                    <p>Hello <strong>${name}</strong>,</p>
                    
                    <p>Thank you for registering with NX IT-UMS! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
                    <p style="background: #f1f5f9; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px;">
                        ${verificationUrl}
                    </p>
                    
                    <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                    
                    <p>If you didn't create an account with us, you can safely ignore this email.</p>
                    
                    <p>Best regards,<br>The NX IT-UMS Team</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;

      // Text version for email clients that don't support HTML
      const textContent = `
        Welcome to NX IT-UMS!

        Hi ${name},

        Thank you for registering with NX IT-UMS! To complete your registration and activate your account, please verify your email address by visiting this link:        ${verificationUrl}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with us, you can safely ignore this email.
        
        Best regards,
        The NX IT-UMS Team
        `;

      // Send email
      const mailOptions = {
        from:
          process.env.EMAIL_FROM || `"NX IT-UMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email Address - NX IT-UMS",
        text: textContent,
        html: htmlContent,
        // Add priority and importance headers
        priority: "high",
        importance: "high",
        // Add delivery settings to help with timeouts
        dsn: {
          id: `verification-${Date.now()}`,
          return: "headers",
          notify: ["failure", "delay"],
          recipient: process.env.EMAIL_USER,
        },
      };

      console.log(`Sending verification email to ${email}...`);
      const result = await transporter.sendMail(mailOptions);
      console.log(
        `✅ Verification email sent to ${email}: ${result.messageId}`
      );
      return result;
    } catch (error) {
      lastError = error;
      console.error(
        `❌ Error sending verification email (attempt ${retryCount + 1}):`,
        error
      );

      // Only retry on connection-related errors
      if (
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ECONNRESET" ||
        error.code === "ESOCKET"
      ) {
        retryCount++;
      } else {
        // Don't retry for auth errors or other non-connection issues
        break;
      }
    }
  }

  // If we get here, all retry attempts failed
  console.error(
    `❌ Failed to send verification email after ${MAX_RETRIES + 1} attempts`
  );

  // Special handling for Render deployment - let's try a fallback approach
  if (process.env.NODE_ENV === "production") {
    console.log(
      "Attempting alternative approach for production environment..."
    );
    // In a real scenario, you might want to queue the email for later delivery
    // or use a third-party service like SendGrid, Mailgun, etc.

    // For now, let's just log the verification URL so it's visible in the logs
    console.log(`
      ====================================================================
      VERIFICATION URL (since email couldn't be sent): 
      ${process.env.FRONTEND_URL}/verify/${token}
      ====================================================================
    `);
  }

  throw lastError;
};

/**
 * Send password reset email (for future implementation)
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Reset token
 * @returns {Promise} Email sending result
 */
const sendPasswordResetEmail = async (email, name, token) => {
  // Implementation for password reset emails
  // Note: This is prepared for future password reset functionality
  console.log(
    `Password reset email would be sent to ${email} with token ${token}`
  );
};

/**
 * Test email configuration
 * Important: Use this function to verify email setup is working
 * @returns {Promise<boolean>} Whether email configuration is valid
 */
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfig,
};
