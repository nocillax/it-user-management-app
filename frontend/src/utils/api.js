import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasAuthHeader = error.config?.headers?.Authorization;
    const isAuthRoute = error.config?.url?.includes("/auth/");

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      hasAuthHeader &&
      !isAuthRoute
    ) {
      const errorMessage = error.response?.data?.message || "";
      const isAuthFailure =
        error.response?.status === 401 ||
        errorMessage.includes("blocked") ||
        errorMessage.includes("no longer exists");

      if (isAuthFailure) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    if (response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};

export const userAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  blockUsers: async (userIds) => {
    const response = await api.patch("/users/block", { userIds });
    return response.data;
  },

  unblockUsers: async (userIds) => {
    const response = await api.patch("/users/unblock", { userIds });
    return response.data;
  },

  deleteUsers: async (userIds) => {
    const response = await api.delete("/users/delete", { data: { userIds } });
    return response.data;
  },

  deleteUnverified: async () => {
    const response = await api.delete("/users/delete-unverified");
    return response.data;
  },
};

export const apiUtils = {
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      // Failed to parse user data
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = apiUtils.getCurrentUser();
    return !!(token && user);
  },

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
