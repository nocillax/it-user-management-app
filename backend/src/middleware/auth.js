/**
 * Authentication Middleware
 * Important: This file contains all authentication and authorization middleware
 */

const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { formatErrorResponse } = require("../utils/helpers");

/**
 * Verify JWT token and authenticate user
 * Important: This middleware checks if user has valid JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(formatErrorResponse("Access token required"));
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json(formatErrorResponse("Invalid or expired token"));
    }

    // Fetch user from database to ensure they still exist
    const userResult = await query(
      "SELECT id, name, email, status FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json(formatErrorResponse("User no longer exists"));
    }

    const user = userResult.rows[0];

    // Check if user is blocked
    // Important: Blocked users cannot access any protected routes
    if (user.status === "blocked") {
      return res
        .status(403)
        .json(formatErrorResponse("Account has been blocked"));
    }

    // Attach user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json(formatErrorResponse("Authentication failed"));
  }
};

/**
 * Check if user has admin privileges
 * Note: For now, all authenticated active users are admins
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireActiveUser = (req, res, next) => {
  if (req.user.status !== "active") {
    return res
      .status(403)
      .json(formatErrorResponse("Active account required for this action"));
  }
  next();
};

/**
 * Validate request data middleware factory
 * Important: Creates middleware to validate specific fields
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Middleware function
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].trim() === "") {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            `Missing required fields: ${missingFields.join(", ")}`
          )
        );
    }

    next();
  };
};

/**
 * Rate limiting middleware (simple implementation)
 * Nota bene: In production, use express-rate-limit or similar
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 */
const createRateLimit = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(clientId)) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = requests.get(clientId);

    if (now > clientData.resetTime) {
      // Reset the counter
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res
        .status(429)
        .json(formatErrorResponse("Too many requests, please try again later"));
    }

    clientData.count += 1;
    next();
  };
};

module.exports = {
  authenticateToken,
  requireActiveUser,
  validateRequiredFields,
  createRateLimit,
};
