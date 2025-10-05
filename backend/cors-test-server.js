#!/usr/bin/env node

/**
 * CORS Test Script
 *
 * This script starts the backend server with custom CORS settings to simulate
 * production configuration without needing to deploy.
 *
 * Usage: node cors-test-server.js [frontend-url]
 */

const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Override FRONTEND_URL with command line argument if provided
const frontendUrl = process.argv[2] || "https://nocillax-it-ums.vercel.app";
process.env.FRONTEND_URL = frontendUrl;

console.log("🔧 Starting backend with custom CORS configuration:");
console.log(`🌐 Frontend URL set to: ${process.env.FRONTEND_URL}`);

// Import the server
const serverPath = path.join(__dirname, "src", "server.js");
require(serverPath);
