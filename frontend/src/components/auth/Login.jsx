/**
 * Login Component
 * Important: Handles user authentication with clean, professional design
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { authAPI, apiUtils } from "../../utils/api";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when user starts typing
    if (message.type === "error") {
      setMessage({ type: "", text: "" });
    }
  };

  /**
   * Handle form submission
   * Important: Validates input and authenticates user
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    console.log("handleSubmit called", {
      email: formData.email,
      password: formData.password,
    });

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoading) {
      console.log("Already loading, returning");
      return; // Prevent double submission
    }

    console.log("Setting loading to true");
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        console.log("Validation failed - empty fields");
        setMessage({
          type: "error",
          text: "Please fill in all fields",
        });
        setIsLoading(false);
        return;
      }

      console.log("Attempting login with API");
      // Attempt login
      const response = await authAPI.login(formData.email, formData.password);

      setMessage({
        type: "success",
        text: "Login successful! Redirecting...",
      });

      // Notify parent component of successful login
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      console.log("Setting error message:", apiUtils.getErrorMessage(error));
      setMessage({
        type: "error",
        text: apiUtils.getErrorMessage(error),
      });
    } finally {
      console.log("Setting loading to false in finally");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              THE APP
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Start your journey
            </h2>
            <p className="text-gray-600 text-sm">Sign In to The App</p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            className="space-y-4"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="test@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            {/* Error/Success Message */}
            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </div>
            <div className="text-sm">
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Geometric Background */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundImage: `
              polygon(0 0, 100% 0, 100% 100%, 0 100%),
              polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)
            `,
            backgroundSize: "100% 100%, 50px 50px",
            backgroundRepeat: "no-repeat, repeat",
          }}
        >
          {/* Geometric overlay pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%),
                linear-gradient(150deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%)
              `,
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
