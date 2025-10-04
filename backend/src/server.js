const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./config/database");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://nocillax-it-ums.vercel.app",
    ],
    credentials: true,
  })
);

// Import route handlers
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

// Middleware for request logging
app.use((req, res, next) => {
  next();
});

// Basic health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Environment variables check route (for debugging)
app.get("/check-env", (req, res) => {
  res.json({
    env_vars_set: {
      EMAIL_HOST: process.env.EMAIL_HOST ? 'Set' : 'Not set',
      EMAIL_PORT: process.env.EMAIL_PORT ? 'Set' : 'Not set',
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',  // It's safe to show this one
    }
  });
});

// Root route - welcome page
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "IT User Management API is running",
    documentation: "/api/v1",
    healthCheck: "/health",
    envCheck: "/check-env",
  });
});

// Mount API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Server not started.");
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = () => {
  console.log("🛑 Shutting down server...");
  process.exit(0);
};

// Listen for termination signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server
startServer();

module.exports = app; // Export for testing
