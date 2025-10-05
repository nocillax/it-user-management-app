const { Pool } = require("pg");
require("dotenv").config();

// Configure PostgreSQL connection pool
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
      }
);

// Optimize pool settings to keep connections alive and responsive
pool.max = 20; // Maximum pool size
pool.idleTimeoutMillis = 60000; // Longer idle timeout (1 minute)
pool.connectionTimeoutMillis = 5000; // Longer connection timeout (5 seconds)

// Track pool errors to improve diagnostics
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Keep at least one connection warm to reduce cold start times
let warmConnection = null;
const keepConnectionWarm = async () => {
  try {
    // Release existing connection if it exists
    if (warmConnection) {
      warmConnection.release();
    }
    // Get a new connection
    warmConnection = await pool.connect();
    console.log("Keeping database connection warm");
  } catch (error) {
    console.error("Failed to keep connection warm:", error);
  }
};

// Initialize warm connection
keepConnectionWarm();

// Setup periodic ping to keep connection alive (every 5 minutes)
setInterval(keepConnectionWarm, 5 * 60 * 1000);

const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    return false;
  }
};

const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    return result;
  } catch (error) {
    throw error;
  }
};

const getClient = async () => {
  return await pool.connect();
};

const closePool = async () => {
  await pool.end();
};

module.exports = {
  query,
  getClient,
  testConnection,
  closePool,
  pool,
};
