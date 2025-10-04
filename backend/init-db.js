const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

console.log("==========================================");
console.log("DATABASE INITIALIZATION");
console.log("==========================================");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL defined:", !!process.env.DATABASE_URL);
console.log("==========================================");

// Read schema file
const schemaPath = path.join(__dirname, "database", "schema.sql");
console.log("Schema path:", schemaPath);
console.log("Schema exists:", fs.existsSync(schemaPath));

const schemaSQL = fs.readFileSync(schemaPath, "utf8");

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function initializeDatabase() {
  let client;
  
  try {
    console.log("Attempting to connect to database...");
    console.log("Database URL:", process.env.DATABASE_URL ? "Defined" : "Not defined");
    
    client = await pool.connect();
    console.log("Successfully connected to database");
    
    // First check if the enum type exists
    const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_status'
      );
    `);
    
    if (!enumCheck.rows[0].exists) {
      console.log("Creating user_status enum type...");
      await client.query(`CREATE TYPE user_status AS ENUM ('unverified', 'active', 'blocked');`);
      console.log("Created user_status enum type");
    } else {
      console.log("user_status enum already exists");
    }
    
    // Then check if the users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log("Users table doesn't exist. Creating schema...");
      // Execute schema SQL but skip the enum creation if it exists
      const sqlWithoutEnum = schemaSQL.replace(/CREATE TYPE.*?;/s, '');
      await client.query(sqlWithoutEnum);
      console.log("Database schema initialized successfully!");
    } else {
      console.log("Users table already exists. Schema already initialized.");
    }
    
    // Verify the table was created
    const verifyTable = await client.query(`SELECT COUNT(*) FROM users;`);
    console.log(`Users table has ${verifyTable.rows[0].count} rows.`);
    
    return true;
  } catch (error) {
    console.error("Error initializing database schema:", error);
    console.error("Error details:", error.message);
    if (error.code) console.error("Error code:", error.code);
    if (error.position) console.error("Error position in SQL:", error.position);
    return false;
  } finally {
    if (client) client.release();
    try {
      await pool.end();
    } catch (endError) {
      console.error("Error ending pool:", endError.message);
    }
  }
}

// Run initialization
initializeDatabase()
  .then(success => {
    console.log("Database initialization completed:", success ? "Successfully" : "With errors");
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error("Fatal error during initialization:", err);
    process.exit(1);
  });
