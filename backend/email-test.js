// backend/email-test.js
// Script to test email service configuration in the backend context
require('dotenv').config(); // Load environment variables from .env file if present
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { testEmailConfig, sendVerificationEmail } = require('./src/utils/emailService');

// Print current environment settings (masked for sensitive data)
function printEnvSettings() {
  console.log("\nCurrent environment settings:");
  const envVars = [
    'EMAIL_HOST', 
    'EMAIL_PORT', 
    'EMAIL_USER', 
    'EMAIL_PASS', 
    'EMAIL_FROM', 
    'FRONTEND_URL',
    'JWT_SECRET'
  ];
  
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${
        envVar === 'EMAIL_PASS' || envVar === 'JWT_SECRET' 
          ? '********' 
          : process.env[envVar]
      }`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
    }
  }
}

// Send a test verification email
async function sendTestEmail(email) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set. Cannot generate verification token.");
      return false;
    }

    // Generate a fake user ID for testing
    const fakeUserId = uuidv4();
    
    // Generate a test verification token
    const verificationToken = jwt.sign(
      { userId: fakeUserId, email: email, type: "verification" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log(`\nSending test verification email to ${email}...`);
    await sendVerificationEmail(email, "Test User", verificationToken);
    
    console.log("✅ Test email sent successfully!");
    console.log(`Verification URL would be: ${process.env.FRONTEND_URL}/verify/${verificationToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending test email:", error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log("========== EMAIL SERVICE TEST ==========");
  console.log("Testing email configuration in the backend context...");
  
  // Print current environment settings
  printEnvSettings();
  
  // Test email server connection
  console.log("\nTesting connection to email server...");
  const configValid = await testEmailConfig();
  
  if (configValid) {
    console.log("✅ Email server connection successful!");
    
    // Prompt for test email address
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nEnter an email address to send a test verification email: ', async (email) => {
      await sendTestEmail(email);
      readline.close();
    });
  } else {
    console.log("❌ Email server connection failed!");
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});