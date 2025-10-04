/**
 * Database Configuration and Connection Setup
 * Important: This file handles all PostgreSQL database connections
 */

const { Pool } = require("pg");
require("dotenv").config();

/**
 * Database connection pool configuration
 * Nota bene: Using connection pool for better performance and connection management
 */
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "user_management",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,

  // Pool configuration for production
  // Important: These settings optimize database performance
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
});

/**
 * Test database connection
 * Note: This function verifies that database is accessible
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

/**
 * Execute database queries with error handling
 * Important: This is our primary query interface
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log query performance in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 Query executed in ${duration}ms:`,
        text.substring(0, 50) + "..."
      );
    }

    return result;
  } catch (error) {
    console.error("❌ Database query error:", error.message);
    console.error("Query:", text);
    console.error("Params:", params);
    throw error;
  }
};

/**
 * Get a client from the pool for transaction handling
 * Nota bene: Use this for operations that require multiple queries in a transaction
 * @returns {Object} Database client
 */
const getClient = async () => {
  return await pool.connect();
};

/**
 * Graceful shutdown of database connections
 * Important: Call this when shutting down the application
 */
const closePool = async () => {
  await pool.end();
  console.log("🔌 Database pool closed");
};

module.exports = {
  query,
  getClient,
  testConnection,
  closePool,
  pool,
};
