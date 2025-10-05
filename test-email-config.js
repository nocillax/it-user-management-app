// test-email-config.js
// Script to test Brevo email service configuration and send test emails
const dotenv = require("dotenv");
const path = require("path");
const readline = require("readline");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Try to load environment variables from .env file if it exists
dotenv.config();

// Set up sample environment variables for testing if not already set
process.env.BREVO_API_KEY = process.env.BREVO_API_KEY || "your-brevo-api-key"; // Replace with your Brevo API key
process.env.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "NX IT-UMS";
process.env.EMAIL_FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS || "your-email@example.com"; // Replace with your sender email
process.env.FRONTEND_URL =
  process.env.FRONTEND_URL || "https://your-frontend-app.vercel.app"; // Replace with your frontend URL
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-jwt-tokens";

// After setting defaults, import the email service
const {
  testEmailConfig,
  sendVerificationEmail,
} = require("./backend/src/utils/emailService");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
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
  console.log(
    "\n⚠️ NOTE: This script uses environment variables OR default values for testing."
  );
  console.log(
    "If you want to use your own values, edit this file or set actual environment variables.\n"
  );

  try {
    // Check required environment variables
    console.log("Checking environment variables:");
    const requiredEnvVars = [
      "BREVO_API_KEY",
      "EMAIL_FROM_NAME",
      "EMAIL_FROM_ADDRESS",
      "FRONTEND_URL",
    ];

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar} is set`);
        // Show masked value for security
        if (envVar === "EMAIL_PASS") {
          console.log(`   Value: ${"*".repeat(8)}`);
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
      const sendTest = await prompt(
        "\nWould you like to send a test verification email? (y/n): "
      );

      if (sendTest.toLowerCase() === "y") {
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
          await sendVerificationEmail(
            testEmail,
            "Test User",
            verificationToken
          );

          console.log("\n✅ Test email sent successfully!");
          console.log(
            `Verification URL: ${process.env.FRONTEND_URL}/verify/${verificationToken}`
          );
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

1. BREVO_API_KEY = your-brevo-api-key  (from Brevo dashboard)
2. EMAIL_FROM_NAME = "Your App Name"    (display name for emails)
3. EMAIL_FROM_ADDRESS = email@yourdomain.com  (sender email)
4. FRONTEND_URL = https://your-frontend-app.vercel.app

For Brevo (Sendinblue), you need to:
- Create a Brevo account at https://www.brevo.com/
- Generate an API key from Settings → API Keys
- Use that API key as BREVO_API_KEY

==================================================
`);

testEmailSetup();
