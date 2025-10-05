/**
 * Test script for the Brevo email service integration
 *
 * This script helps test whether the email service is working correctly.
 *
 * Usage:
 * 1. Make sure your .env file is configured correctly
 * 2. Run: node test-email-service.js [recipient_email]
 */

require("dotenv").config();
const {
  sendVerificationEmail,
  testEmailConfig,
} = require("./src/utils/emailService");

// Get recipient email from command line args or use a default test email
const testEmail = process.argv[2] || "test@example.com";
const testName = "Test User";
const testToken = "test-verification-token-" + Date.now();

async function runTest() {
  console.log("🧪 TESTING BREVO EMAIL SERVICE CONFIGURATION");
  console.log("====================================");

  // Display current configuration
  console.log("📋 CURRENT CONFIGURATION:");
  console.log(
    "Brevo API Key:",
    process.env.BREVO_API_KEY ? "✓ Set" : "❌ Missing"
  );
  console.log("From Name:", process.env.EMAIL_FROM_NAME || "❌ Missing");
  console.log("From Email:", process.env.EMAIL_FROM_ADDRESS || "❌ Missing");

  console.log("Frontend URL:", process.env.FRONTEND_URL || "❌ Missing");
  console.log("====================================");

  try {
    // Test if configuration is valid
    console.log("🔍 Testing email configuration...");
    const configValid = await testEmailConfig();

    if (configValid) {
      console.log("✅ Email configuration is valid");

      // Test sending an actual email
      console.log(`📧 Sending test email to ${testEmail}...`);
      await sendVerificationEmail(testEmail, testName, testToken);

      console.log("✅ Test email sent successfully!");
      console.log("====================================");
      console.log("Please check your inbox to verify the email was received.");
      console.log(
        "If using the default test email, check the console output for the verification URL."
      );
    } else {
      console.error("❌ Email configuration is invalid");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Full error:", error);
  }
}

runTest();
