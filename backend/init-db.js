const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Read schema file
const schemaSQL = fs.readFileSync(
  path.join(__dirname, "database", "schema.sql"),
  "utf8"
);

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log("Connected to database. Initializing schema...");

    // Execute schema SQL
    await client.query(schemaSQL);

    console.log("Database schema initialized successfully!");
  } catch (error) {
    console.error("Error initializing database schema:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
