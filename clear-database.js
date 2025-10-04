// clear-database.js
// Script to remove all content from the database without dropping tables
const { Pool } = require("pg");

// Use the external database URL
const DATABASE_URL = 
  "postgresql://user_management_oood_user:PIRllnjte9QBSwVCi0Kser1KuUxCugYE@dpg-d3gbtf7fte5s73c0dobg-a.oregon-postgres.render.com:5432/user_management_oood";

async function clearDatabase() {
  console.log("Connecting to database to clear content...");

  // Create a connection pool
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    console.log("Connected to database successfully!");

    // Get all tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Clear each table
    for (const table of tables) {
      try {
        console.log(`Clearing table: ${table}...`);
        await client.query(`DELETE FROM ${table};`);
        console.log(`✅ Table ${table} cleared`);
      } catch (err) {
        console.error(`Error clearing table ${table}:`, err.message);
      }
    }
    
    // Check if user table exists and has been cleared
    if (tables.includes('users')) {
      const userCount = await client.query("SELECT COUNT(*) FROM users");
      console.log(`Users remaining in database: ${userCount.rows[0].count}`);
    }

    console.log("Database content cleared!");
    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error clearing database:", error.message);
  }
}

// Ask for confirmation before running
console.log("⚠️  WARNING: This will PERMANENTLY DELETE all data from your database!");
console.log("Press Ctrl+C now to cancel if you want to keep your data.");
console.log("Proceeding in 5 seconds...");

setTimeout(() => {
  clearDatabase().catch(err => {
    console.error("Unhandled error:", err);
  });
}, 5000);