const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const {
  isValidEmail,
  formatErrorResponse,
  formatSuccessResponse,
} = require("../utils/helpers");
const {
  validateRequiredFields,
  createRateLimit,
} = require("../middleware/auth");
const { sendVerificationEmail } = require("../utils/emailService");

const router = express.Router();

const authRateLimit = createRateLimit(50, 1 * 60 * 1000);

router.post(
  "/register",
  authRateLimit,
  validateRequiredFields(["name", "email", "password"]),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate email format
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json(formatErrorResponse("Invalid email format"));
      }

      // Validate password is not empty
      if (!password || password.trim() === "") {
        return res
          .status(400)
          .json(formatErrorResponse("Password is required"));
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user into database
      try {
        const result = await query(
          `INSERT INTO users (name, email, password_hash, status) 
                     VALUES ($1, $2, $3, 'unverified') 
                     RETURNING id, name, email, status, created_at`,
          [name.trim(), email.toLowerCase().trim(), passwordHash]
        );

        const newUser = result.rows[0];

        // Generate verification token and send email
        const verificationToken = jwt.sign(
          { userId: newUser.id, email: newUser.email, type: "verification" },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Send verification email asynchronously - don't wait for completion
        sendVerificationEmail(
          newUser.email,
          newUser.name,
          verificationToken
        ).catch((error) => {
          console.error("Failed to send verification email:", error.message);
          // Log verification URL in case of email failure (only in development)
          if (process.env.NODE_ENV === "development") {
            console.log(`
              ====================================================================
              VERIFICATION URL (since email couldn't be sent): 
              ${process.env.FRONTEND_URL}/verify/${verificationToken}
              ====================================================================
            `);
          }
        });

        // For testing: Log verification link (remove in production)

        res.status(201).json(
          formatSuccessResponse(
            "User registered successfully. Please check your email for verification.",
            {
              user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                status: newUser.status,
              },
            }
          )
        );
      } catch (dbError) {
        if (dbError.code === "23505") {
          // PostgreSQL unique violation
          return res
            .status(409)
            .json(formatErrorResponse("Email already exists"));
        }
        throw dbError;
      }
    } catch (error) {
      res.status(500).json(formatErrorResponse("Registration failed"));
    }
  }
);

router.post(
  "/login",
  authRateLimit,
  validateRequiredFields(["email", "password"]),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const userResult = await query(
        "SELECT id, name, email, password_hash, status FROM users WHERE email = $1",
        [email.toLowerCase().trim()]
      );

      if (userResult.rows.length === 0) {
        return res
          .status(401)
          .json(formatErrorResponse("Invalid email or password"));
      }

      const user = userResult.rows[0];

      // Check if user is blocked
      if (user.status === "blocked") {
        return res
          .status(403)
          .json(formatErrorResponse("Account has been blocked"));
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return res
          .status(401)
          .json(formatErrorResponse("Invalid email or password"));
      }

      // Update last login timestamp
      await query(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
        [user.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          status: user.status,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json(
        formatSuccessResponse("Login successful", {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
          },
        })
      );
    } catch (error) {
      res.status(500).json(formatErrorResponse("Login failed"));
    }
  }
);

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Decode and verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json(formatErrorResponse("Invalid or expired verification token"));
    }

    // Check if it's a verification token
    if (decoded.type !== "verification") {
      return res.status(400).json(formatErrorResponse("Invalid token type"));
    }

    const userId = decoded.userId;

    // Update user status to active
    const result = await query(
      `UPDATE users 
             SET status = CASE 
                 WHEN status = 'unverified' THEN 'active'::user_status 
                 ELSE status 
             END 
             WHERE id = $1 
             RETURNING id, name, email, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(formatErrorResponse("User not found"));
    }

    const user = result.rows[0];

    if (user.status === "blocked") {
      return res.status(403).json(formatErrorResponse("Account is blocked"));
    }

    res.json(
      formatSuccessResponse("Email verified successfully", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse("Email verification failed"));
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json(formatErrorResponse("Refresh token required"));
    }

    // Verify old token (even if expired)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
    } catch (error) {
      return res.status(401).json(formatErrorResponse("Invalid token"));
    }

    // Check if user still exists and is not blocked
    const userResult = await query(
      "SELECT id, name, email, status FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json(formatErrorResponse("User not found"));
    }

    const user = userResult.rows[0];

    if (user.status === "blocked") {
      return res
        .status(403)
        .json(formatErrorResponse("Account has been blocked"));
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json(
      formatSuccessResponse("Token refreshed successfully", {
        token: newToken,
        user,
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse("Token refresh failed"));
  }
});

module.exports = router;
