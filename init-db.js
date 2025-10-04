// init-db.js
// Script to initialize the database schema
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Use the same external database URL as in test-connections.js
const DATABASE_URL =
  "postgresql://user_management_oood_user:PIRllnjte9QBSwVCi0Kser1KuUxCugYE@dpg-d3gbtf7fte5s73c0dobg-a.oregon-postgres.render.com:5432/user_management_oood";

async function initializeDatabase() {
  console.log("Initializing database schema...");

  // Create a connection pool
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    console.log("Connected to database successfully!");

    console.log("Applying database schema...");

    // Create statements individually to handle errors properly
    try {
      // Create enum type for user status
      await client.query(`
        CREATE TYPE user_status AS ENUM ('unverified', 'active', 'blocked');
      `);
      console.log("✓ Created user_status enum type");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("ℹ️ user_status enum type already exists");
      } else {
        console.error("Error creating user_status enum:", err.message);
      }
    }

    try {
      // Create users table
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          status user_status DEFAULT 'unverified' NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE,
          CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
        );
      `);
      console.log("✓ Created users table");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("ℹ️ users table already exists");
      } else {
        console.error("Error creating users table:", err.message);
      }
    }

    // Create indexes
    const indexes = [
      {
        name: "idx_users_email",
        query: "CREATE INDEX idx_users_email ON users(email);",
      },
      {
        name: "idx_users_status",
        query: "CREATE INDEX idx_users_status ON users(status);",
      },
      {
        name: "idx_users_last_login",
        query:
          "CREATE INDEX idx_users_last_login ON users(last_login DESC NULLS LAST);",
      },
      {
        name: "idx_users_created_at",
        query: "CREATE INDEX idx_users_created_at ON users(created_at DESC);",
      },
    ];

    for (const index of indexes) {
      try {
        await client.query(index.query);
        console.log(`✓ Created index: ${index.name}`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`ℹ️ Index ${index.name} already exists`);
        } else {
          console.error(`Error creating index ${index.name}:`, err.message);
        }
      }
    }

    try {
      // Create function for updating last login
      await client.query(`
        CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
        RETURNS void AS $$
        BEGIN
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP 
          WHERE id = user_id;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log("✓ Created update_last_login function");
    } catch (err) {
      console.error("Error creating update_last_login function:", err.message);
    }

    try {
      // Insert sample admin user if doesn't exist
      await client.query(`
        INSERT INTO users (name, email, password_hash, status, last_login) 
        VALUES (
          'Administrator',
          'admin@example.com',
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          'active',
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log("✓ Sample admin user added (if it didn't exist)");
    } catch (err) {
      console.error("Error adding sample user:", err.message);
    }

    // Verify users table exists and check count
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    console.log(`✅ Number of users in database: ${userCount.rows[0].count}`);

    client.release();
    await pool.end();
    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
}

initializeDatabase().catch((err) => {
  console.error("Unhandled error:", err);
});
