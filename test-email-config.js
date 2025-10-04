// test-email-config.js
// Script to test email service configuration and send test emails
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Try to load environment variables from .env file if it exists
dotenv.config();

// Set up sample environment variables for testing if not already set
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '587';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com'; // Replace with your test email
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password'; // Replace with your app password
process.env.EMAIL_FROM = process.env.EMAIL_FROM || '"NX IT-UMS" <your-email@gmail.com>'; // Replace with your email
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app'; // Replace with your frontend URL
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';

// After setting defaults, import the email service
const { testEmailConfig, sendVerificationEmail } = require('./backend/src/utils/emailService');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 1. Test if the email configuration is valid
async function testEmailSetup() {
  console.log("Testing email configuration...");
  console.log("\n⚠️ NOTE: This script uses environment variables OR default values for testing.");
  console.log("If you want to use your own values, edit this file or set actual environment variables.\n");
  
  try {
    // Check required environment variables
    console.log("Checking environment variables:");
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'FRONTEND_URL'];
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar} is set`);
        // Show masked value for security
        if (envVar === 'EMAIL_PASS') {
          console.log(`   Value: ${'*'.repeat(8)}`);
        } else {
          console.log(`   Value: ${value}`);
        }
      } else {
        console.log(`❌ ${envVar} is NOT set`);
      }
    }
    
    // Test email configuration
    console.log("\nTesting email server connection:");
    const configValid = await testEmailConfig();
    
    if (configValid) {
      const sendTest = await prompt("\nWould you like to send a test verification email? (y/n): ");
      
      if (sendTest.toLowerCase() === 'y') {
        const testEmail = await prompt("Enter recipient email address: ");
        
        // Generate a fake user ID
        const fakeUserId = uuidv4();
        
        // Generate verification token
        const verificationToken = jwt.sign(
          { userId: fakeUserId, email: testEmail, type: "verification" },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        
        console.log("\nSending test verification email...");
        
        try {
          await sendVerificationEmail(testEmail, "Test User", verificationToken);
          
          console.log("\n✅ Test email sent successfully!");
          console.log(`Verification URL: ${process.env.FRONTEND_URL}/verify/${verificationToken}`);
        } catch (emailError) {
          console.error("\n❌ Failed to send test email:", emailError.message);
        }
      }
    }
    
  } catch (error) {
    console.error("Error testing email configuration:", error);
  } finally {
    rl.close();
  }
}

// Instructions for Render.com setup
console.log(`
==================================================
EMAIL CONFIGURATION GUIDE FOR RENDER.COM
==================================================

To enable email verification in your application, you need to add these
environment variables to your Render.com service:

1. EMAIL_HOST = smtp.gmail.com        (or your SMTP server)
2. EMAIL_PORT = 587                   (or your SMTP port)
3. EMAIL_USER = your-email@gmail.com  (your email address)
4. EMAIL_PASS = your-app-password     (your email app password)
5. EMAIL_FROM = "App Name" <your-email@gmail.com>
6. FRONTEND_URL = https://your-frontend-app.vercel.app

For Gmail, you need to:
- Enable 2-Step Verification
- Create an App Password: Google Account → Security → App Passwords
- Use that App Password as EMAIL_PASS

==================================================
`);

testEmailSetup();