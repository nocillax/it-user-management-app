// test-connections.js
// A simple script to test connections to your deployed services
const axios = require("axios");
const { Pool } = require("pg");

// Configuration with actual URLs
const RENDER_API_URL = "https://it-user-management-app.onrender.com";
// Use the external database URL for connecting from outside Render's network
// Format should be: postgresql://username:password@external-host.render.com:5432/database_name
const DATABASE_URL =
  "postgresql://user_management_oood_user:PIRllnjte9QBSwVCi0Kser1KuUxCugYE@dpg-d3gbtf7fte5s73c0dobg-a.oregon-postgres.render.com:5432/user_management_oood";

async function testBackendConnection() {
  console.log("\n========== TESTING BACKEND CONNECTION ==========");
  try {
    // Test root endpoint
    console.log(`Testing root endpoint: ${RENDER_API_URL}`);
    const rootResponse = await axios.get(RENDER_API_URL);
    console.log("Root endpoint response:", rootResponse.data);

    // Test health endpoint
    console.log(`\nTesting health endpoint: ${RENDER_API_URL}/health`);
    const healthResponse = await axios.get(`${RENDER_API_URL}/health`);
    console.log("Health endpoint response:", healthResponse.data);

    console.log("\n✅ Backend connection tests passed!");
    return true;
  } catch (error) {
    console.error("\n❌ Backend connection error:");
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "No response received. Backend might be down or unreachable."
      );
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }
    return false;
  }
}

async function testDatabaseConnection() {
  console.log("\n========== TESTING DATABASE CONNECTION ==========");

  if (!DATABASE_URL) {
    console.error(
      "❌ DATABASE_URL is not defined. Set it in your environment or in this script."
    );
    return false;
  }

  try {
    console.log("Connecting to database...");
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    console.log("✅ Connected to database successfully!");

    // Test a simple query
    const result = await client.query("SELECT current_database() as db_name");
    console.log(`Database name: ${result.rows[0].db_name}`);

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✅ Users table exists");
      const userCount = await client.query("SELECT COUNT(*) FROM users");
      console.log(`Number of users: ${userCount.rows[0].count}`);
    } else {
      console.error("❌ Users table does not exist!");
    }

    client.release();
    await pool.end();

    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return false;
  }
}

// Run both tests
async function runTests() {
  const backendResult = await testBackendConnection();
  console.log("\n-------------------------------------------");
  const dbResult = await testDatabaseConnection();

  console.log("\n========== TEST SUMMARY ==========");
  console.log(
    `Backend connection: ${backendResult ? "✅ Success" : "❌ Failed"}`
  );
  console.log(`Database connection: ${dbResult ? "✅ Success" : "❌ Failed"}`);

  if (!backendResult || !dbResult) {
    console.log("\nTroubleshooting tips:");
    if (!backendResult) {
      console.log("- Make sure your backend is deployed and running on Render");
      console.log("- Check if the URL is correct");
      console.log("- Check Render logs for any errors");
    }
    if (!dbResult) {
      console.log("- Make sure your DATABASE_URL is correct");
      console.log("- Check if your database is running on Render");
      console.log(
        "- Ensure your IP address is allowed to connect to the database"
      );
    }
  }
}

runTests().catch((err) => {
  console.error("Unexpected error:", err);
});
