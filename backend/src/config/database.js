const { Pool } = require("pg");
require("dotenv").config();

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
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "user_management",
        password: process.env.DB_PASSWORD || "password",
        port: process.env.DB_PORT || 5432,
      }
);

pool.max = 20;
pool.idleTimeoutMillis = 30000;
pool.connectionTimeoutMillis = 2000;

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
