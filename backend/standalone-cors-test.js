#!/usr/bin/env node

/**
 * Standalone CORS Test Server
 * This minimal Express server focuses only on CORS testing
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 9000;

// Set up a permissive CORS policy for testing
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "CORS test successful!",
    request: {
      origin: req.headers.origin || "No origin header",
      headers: req.headers,
    },
  });
});

app.post("/test", express.json(), (req, res) => {
  res.json({
    success: true,
    message: "POST test successful!",
    body: req.body,
    headers: {
      origin: req.headers.origin,
      "content-type": req.headers["content-type"],
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🔧 Standalone CORS test server running at http://localhost:${PORT}`
  );
  console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔑 This server allows ALL origins for testing purposes`);
});
