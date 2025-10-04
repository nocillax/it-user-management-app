/**
 * API Utility Functions for Frontend
 * Important: This module handles all API communications with the backend
 */

import axios from "axios";

// Create axios instance with base configuration
// Note: This centralizes API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Add JWT token to requests automatically
 * Important: This interceptor adds authentication to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle authentication errors globally
 * Nota bene: This interceptor handles token expiry and blocked users
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on auth errors if this was an authenticated request (has Authorization header)
    // Don't redirect for login/register failures
    const hasAuthHeader = error.config?.headers?.Authorization;
    const isAuthRoute = error.config?.url?.includes("/auth/");

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      hasAuthHeader &&
      !isAuthRoute
    ) {
      // Only logout for actual auth failures, not permission errors
      const errorMessage = error.response?.data?.message || "";
      const isAuthFailure =
        error.response?.status === 401 || // Token expired/invalid
        errorMessage.includes("blocked") || // User blocked
        errorMessage.includes("no longer exists"); // User deleted

      if (isAuthFailure) {
        // Token expired or user blocked - logout user
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      // For permission errors (like "Active account required"), don't logout - just show the error
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API functions
 */
export const authAPI = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} API response
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    // Store token and user info in localStorage
    if (response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} API response
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} API response
   */
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};

/**
 * User Management API functions
 */
export const userAPI = {
  /**
   * Get all users with pagination and sorting
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  /**
   * Block selected users
   * @param {Array} userIds - Array of user IDs to block
   * @returns {Promise} API response
   */
  blockUsers: async (userIds) => {
    const response = await api.patch("/users/block", { userIds });
    return response.data;
  },

  /**
   * Unblock selected users
   * @param {Array} userIds - Array of user IDs to unblock
   * @returns {Promise} API response
   */
  unblockUsers: async (userIds) => {
    const response = await api.patch("/users/unblock", { userIds });
    return response.data;
  },

  /**
   * Delete selected users
   * @param {Array} userIds - Array of user IDs to delete
   * @returns {Promise} API response
   */
  deleteUsers: async (userIds) => {
    const response = await api.delete("/users/delete", { data: { userIds } });
    return response.data;
  },

  /**
   * Delete all unverified users
   * @returns {Promise} API response
   */
  deleteUnverified: async () => {
    const response = await api.delete("/users/delete-unverified");
    return response.data;
  },
};

/**
 * Utility functions for API handling
 */
export const apiUtils = {
  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user data
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Whether user has valid token
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = apiUtils.getCurrentUser();
    return !!(token && user);
  },

  /**
   * Handle API errors and return user-friendly messages
   * @param {Error} error - API error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage: (error) => {
    // Handle client-side validation errors (thrown with new Error())
    if (error.message && !error.response && !error.code) {
      return error.message;
    }

    // Handle API response errors
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status === 500) {
      return "Server error. Please try again later.";
    }

    // Handle actual network errors
    if (error.code === "NETWORK_ERROR" || (error.code && !error.response)) {
      return "Network error. Please check your connection.";
    }

    return "An unexpected error occurred.";
  },
};

export default api;
