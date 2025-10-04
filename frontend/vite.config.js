import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd());

  // Log environment info during build
  console.log("BUILD MODE:", mode);
  console.log("API URL:", env.VITE_API_URL);

  return {
    plugins: [react()],
    define: {
      __API_URL__: JSON.stringify(
        env.VITE_API_URL || "https://it-user-management-app.onrender.com/api/v1"
      ),
    },
  };
});
