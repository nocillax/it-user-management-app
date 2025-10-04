/**
 * IT User Management System - Utility Functions
 * Important: This module contains essential utility functions used throughout the application
 */

const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

/**
 * Generate a unique ID value using UUID v4 with additional entropy
 * Important: This function provides reliable unique identifiers for our system
 * @param {string} prefix - Optional prefix for the ID
 * @param {boolean} useHash - Whether to return a hash of the UUID (shorter ID)
 * @returns {string} Unique ID value
 */
const getUniqIdValue = (prefix = "", useHash = false) => {
  // Generate UUID v4
  const uuid = uuidv4();

  // Add extra entropy
  // Note: Adds additional randomness for enhanced uniqueness
  const timestamp = Date.now().toString();
  const randomValue = Math.random().toString(36).substring(2, 15);

  if (useHash) {
    // Create a shorter hash-based ID (useful for tokens, etc.)
    const hash = crypto
      .createHash("sha256")
      .update(uuid + timestamp + randomValue)
      .digest("hex")
      .substring(0, 20); // Shorter length for usability

    return prefix + hash;
  }

  // Return full UUID with optional prefix
  return prefix + uuid;
};

/**
 * Generate a random verification token with expiry
 * Nota bene: Used for email verification and password reset
 * @returns {Object} Token data with value and expiry
 */
const generateVerificationToken = () => {
  // Create random token
  const token = crypto.randomBytes(32).toString("hex");

  // Set expiry for 24 hours from now
  // Important: Tokens should have limited validity period
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    token,
    expiresAt,
  };
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Format error response for consistent API errors
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Formatted error object
 */
const formatErrorResponse = (message, status = 400) => {
  return {
    status: "error",
    message,
    code: status,
  };
};

/**
 * Format success response for consistent API responses
 * @param {string} message - Success message
 * @param {Object} data - Optional data to include in response
 * @returns {Object} Formatted success object
 */
const formatSuccessResponse = (message, data = {}) => {
  return {
    status: "success",
    message,
    data,
  };
};

module.exports = {
  getUniqIdValue,
  generateVerificationToken,
  isValidEmail,
  formatErrorResponse,
  formatSuccessResponse,
};
