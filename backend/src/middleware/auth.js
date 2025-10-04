const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { formatErrorResponse } = require("../utils/helpers");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json(formatErrorResponse("Access token required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json(formatErrorResponse("Invalid or expired token"));
    }

    req.tokenUser = decoded;
    next();
  } catch (error) {
    // Authentication failed
    res.status(500).json(formatErrorResponse("Authentication failed"));
  }
};

const verifyUserForAction = async (req, res, next) => {
  try {
    const userResult = await query(
      "SELECT id, name, email, status FROM users WHERE id = $1",
      [req.tokenUser.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json(formatErrorResponse("User no longer exists"));
    }

    const user = userResult.rows[0];

    if (user.status === "blocked") {
      return res
        .status(403)
        .json(formatErrorResponse("Account has been blocked"));
    }

    req.user = user;
    next();
  } catch (error) {
    // User verification failed
    res.status(500).json(formatErrorResponse("User verification failed"));
  }
};

const requireActiveUser = (req, res, next) => {
  if (req.user.status !== "active") {
    return res
      .status(403)
      .json(formatErrorResponse("Active account required for this action"));
  }
  next();
};

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

const createRateLimit = (maxRequests = 100, timeWindowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(clientId)) {
      requests.set(clientId, { count: 1, resetTime: now + timeWindowMs });
      return next();
    }

    const clientData = requests.get(clientId);

    if (now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + timeWindowMs });
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
  verifyUserForAction,
  requireActiveUser,
  validateRequiredFields,
  createRateLimit,
};
