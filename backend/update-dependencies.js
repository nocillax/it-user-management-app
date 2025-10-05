/**
 * Script to update package-lock.json after removing nodemailer
 *
 * This script will:
 * 1. Delete node_modules
 * 2. Delete package-lock.json
 * 3. Reinstall all dependencies
 *
 * Run this after the code changes to ensure package-lock.json is updated correctly
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define paths
const nodeModulesPath = path.join(__dirname, "node_modules");
const packageLockPath = path.join(__dirname, "package-lock.json");

// Helper function to run commands
function runCommand(command) {
  console.log(`\n📌 Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", cwd: __dirname });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    return false;
  }
}

// Main function
async function updateDependencies() {
  console.log("🔄 Updating dependencies after removing nodemailer...");

  // Step 1: Delete node_modules if it exists
  if (fs.existsSync(nodeModulesPath)) {
    console.log("🗑️ Deleting node_modules directory...");
    try {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log("✅ node_modules deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete node_modules:", error);
      return;
    }
  }

  // Step 2: Delete package-lock.json if it exists
  if (fs.existsSync(packageLockPath)) {
    console.log("🗑️ Deleting package-lock.json...");
    try {
      fs.unlinkSync(packageLockPath);
      console.log("✅ package-lock.json deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete package-lock.json:", error);
      return;
    }
  }

  // Step 3: Reinstall dependencies
  console.log("📦 Reinstalling dependencies...");
  if (!runCommand("npm install")) {
    console.error("❌ Failed to reinstall dependencies");
    return;
  }

  console.log("\n✅ Dependencies updated successfully!");
  console.log(
    "\nYou can now commit your changes with the updated package-lock.json file."
  );
}

updateDependencies().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
