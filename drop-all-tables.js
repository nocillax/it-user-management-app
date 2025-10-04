// drop-all-tables.js
// Script to completely remove all tables, types, and functions from the database
const { Pool } = require("pg");

// Use the external database URL
const DATABASE_URL = 
  "postgresql://user_management_oood_user:PIRllnjte9QBSwVCi0Kser1KuUxCugYE@dpg-d3gbtf7fte5s73c0dobg-a.oregon-postgres.render.com:5432/user_management_oood";

async function dropEverything() {
  console.log("Connecting to database to drop all tables and types...");

  // Create a connection pool
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    console.log("Connected to database successfully!");

    // Step 1: Drop all tables with cascade
    console.log("Identifying all tables...");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    if (tables.length > 0) {
      console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
      
      // Drop each table with CASCADE to ensure all dependencies are removed
      for (const table of tables) {
        try {
          console.log(`Dropping table: ${table}...`);
          await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
          console.log(`✅ Table ${table} dropped`);
        } catch (err) {
          console.error(`Error dropping table ${table}:`, err.message);
        }
      }
    } else {
      console.log("No tables found in the database");
    }

    // Step 2: Drop all functions
    console.log("\nIdentifying all functions...");
    const functionsResult = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_schema = 'public';
    `);
    
    const functions = functionsResult.rows.map(row => row.routine_name);
    
    if (functions.length > 0) {
      console.log(`Found ${functions.length} functions: ${functions.join(', ')}`);
      
      // Drop each function
      for (const func of functions) {
        try {
          console.log(`Dropping function: ${func}...`);
          await client.query(`DROP FUNCTION IF EXISTS ${func} CASCADE;`);
          console.log(`✅ Function ${func} dropped`);
        } catch (err) {
          console.error(`Error dropping function ${func}:`, err.message);
        }
      }
    } else {
      console.log("No functions found in the database");
    }

    // Step 3: Drop all types (including enums)
    console.log("\nIdentifying all custom types...");
    const typesResult = await client.query(`
      SELECT t.typname AS type_name
      FROM pg_type t
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      AND t.typtype = 'e'; -- 'e' is for enum types
    `);
    
    const types = typesResult.rows.map(row => row.type_name);
    
    if (types.length > 0) {
      console.log(`Found ${types.length} custom types: ${types.join(', ')}`);
      
      // Drop each type
      for (const type of types) {
        try {
          console.log(`Dropping type: ${type}...`);
          await client.query(`DROP TYPE IF EXISTS ${type} CASCADE;`);
          console.log(`✅ Type ${type} dropped`);
        } catch (err) {
          console.error(`Error dropping type ${type}:`, err.message);
        }
      }
    } else {
      console.log("No custom types found in the database");
    }

    console.log("\n✅ Database schema has been completely cleared!");
    console.log("You can now run init-db.js to recreate the schema from scratch.");
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error clearing database:", error.message);
  }
}

// Ask for confirmation before running
console.log("⚠️  WARNING: This will PERMANENTLY DELETE ALL tables, functions, and types from your database!");
console.log("ALL DATA WILL BE LOST and cannot be recovered!");
console.log("Press Ctrl+C now to cancel if you want to keep your database schema.");
console.log("Proceeding in 10 seconds...");

setTimeout(() => {
  dropEverything().catch(err => {
    console.error("Unhandled error:", err);
  });
}, 10000);