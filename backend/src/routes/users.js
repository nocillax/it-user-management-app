/**
 * User Management Routes
 * Important: Handles user listing, blocking, unblocking, and deletion
 */

const express = require("express");
const { query } = require("../config/database");
const { authenticateToken, requireActiveUser } = require("../middleware/auth");
const {
  formatErrorResponse,
  formatSuccessResponse,
} = require("../utils/helpers");

const router = express.Router();

// Apply authentication to all user routes
// Important: All routes require valid JWT token
router.use(authenticateToken);

/**
 * GET /users - List all users with pagination and sorting
 * Note: Returns user list with sorting by last_login (most recent first)
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "last_login",
      sortOrder = "desc",
      status = "all",
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    // Validate sort parameters
    const allowedSortFields = [
      "name",
      "email",
      "last_login",
      "created_at",
      "status",
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "last_login";
    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Build WHERE clause for status filtering
    let whereClause = "";
    let queryParams = [limitNum, offset];

    if (status !== "all") {
      const allowedStatuses = ["active", "unverified", "blocked"];
      if (allowedStatuses.includes(status)) {
        whereClause = "WHERE status = $3";
        queryParams.push(status);
      }
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countParams = whereClause ? [queryParams[2]] : [];
    const countResult = await query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].total);

    // Get users with pagination and sorting
    // Important: Handle NULL last_login values properly in sorting
    const usersQuery = `
            SELECT 
                id, 
                name, 
                email, 
                status, 
                created_at,
                last_login
            FROM users 
            ${whereClause}
            ORDER BY 
                ${
                  sortField === "last_login"
                    ? "last_login DESC NULLS LAST"
                    : `${sortField} ${order}`
                }
            LIMIT $1 OFFSET $2
        `;

    const usersResult = await query(usersQuery, queryParams);
    const users = usersResult.rows;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json(
      formatSuccessResponse("Users retrieved successfully", {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage,
          hasPrevPage,
          limit: limitNum,
        },
        sorting: {
          sortBy: sortField,
          sortOrder: order,
        },
      })
    );
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json(formatErrorResponse("Failed to retrieve users"));
  }
});

/**
 * PATCH /users/block - Block selected users
 * Important: Prevents blocked users from logging in
 */
router.patch("/block", requireActiveUser, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json(formatErrorResponse("User IDs array required"));
    }

    // Prevent self-blocking
    if (userIds.includes(req.user.id)) {
      return res
        .status(400)
        .json(formatErrorResponse("Cannot block your own account"));
    }

    // Update users to blocked status
    // Note: Only update users that are currently active or unverified
    const result = await query(
      `UPDATE users 
             SET status = 'blocked'::user_status 
             WHERE id = ANY($1::uuid[]) 
             AND status IN ('active', 'unverified')
             RETURNING id, name, email, status`,
      [userIds]
    );

    const blockedUsers = result.rows;

    if (blockedUsers.length === 0) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "No users were blocked (users may already be blocked or not exist)"
          )
        );
    }

    res.json(
      formatSuccessResponse(
        `Successfully blocked ${blockedUsers.length} user(s)`,
        { blockedUsers }
      )
    );
  } catch (error) {
    console.error("Block users error:", error);
    res.status(500).json(formatErrorResponse("Failed to block users"));
  }
});

/**
 * PATCH /users/unblock - Unblock selected users
 * Nota bene: Sets blocked users back to active status
 */
router.patch("/unblock", requireActiveUser, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json(formatErrorResponse("User IDs array required"));
    }

    // Update users to active status
    // Important: Only update users that are currently blocked
    const result = await query(
      `UPDATE users 
             SET status = 'active'::user_status 
             WHERE id = ANY($1::uuid[]) 
             AND status = 'blocked'
             RETURNING id, name, email, status`,
      [userIds]
    );

    const unblockedUsers = result.rows;

    if (unblockedUsers.length === 0) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "No users were unblocked (users may not be blocked or not exist)"
          )
        );
    }

    res.json(
      formatSuccessResponse(
        `Successfully unblocked ${unblockedUsers.length} user(s)`,
        { unblockedUsers }
      )
    );
  } catch (error) {
    console.error("Unblock users error:", error);
    res.status(500).json(formatErrorResponse("Failed to unblock users"));
  }
});

/**
 * DELETE /users/delete - Delete selected users (hard delete)
 * Important: Permanently removes users from database
 */
router.delete("/delete", requireActiveUser, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json(formatErrorResponse("User IDs array required"));
    }

    // Prevent self-deletion
    if (userIds.includes(req.user.id)) {
      return res
        .status(400)
        .json(formatErrorResponse("Cannot delete your own account"));
    }

    // Get user info before deletion for response
    const usersToDelete = await query(
      "SELECT id, name, email FROM users WHERE id = ANY($1::uuid[])",
      [userIds]
    );

    // Delete users from database
    const result = await query(
      "DELETE FROM users WHERE id = ANY($1::uuid[]) RETURNING id",
      [userIds]
    );

    const deletedCount = result.rows.length;

    if (deletedCount === 0) {
      return res
        .status(400)
        .json(
          formatErrorResponse("No users were deleted (users may not exist)")
        );
    }

    res.json(
      formatSuccessResponse(`Successfully deleted ${deletedCount} user(s)`, {
        deletedCount,
        deletedUsers: usersToDelete.rows,
      })
    );
  } catch (error) {
    console.error("Delete users error:", error);
    res.status(500).json(formatErrorResponse("Failed to delete users"));
  }
});

/**
 * DELETE /users/delete-unverified - Delete all unverified users
 * Note: Cleanup function to remove users who never verified their email
 */
router.delete("/delete-unverified", requireActiveUser, async (req, res) => {
  try {
    // Get count of unverified users before deletion
    const countResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'unverified'"
    );

    const unverifiedCount = parseInt(countResult.rows[0].count);

    if (unverifiedCount === 0) {
      return res.json(formatSuccessResponse("No unverified users to delete"));
    }

    // Delete all unverified users
    const result = await query(
      "DELETE FROM users WHERE status = 'unverified' RETURNING id"
    );

    const deletedCount = result.rows.length;

    res.json(
      formatSuccessResponse(
        `Successfully deleted ${deletedCount} unverified user(s)`
      )
    );
  } catch (error) {
    console.error("Delete unverified users error:", error);
    res
      .status(500)
      .json(formatErrorResponse("Failed to delete unverified users"));
  }
});

/**
 * GET /users/stats - Get user statistics
 * Important: Provides overview of user counts by status
 */
router.get("/stats", async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM users 
            GROUP BY status
        `);

    const stats = {
      total: 0,
      active: 0,
      unverified: 0,
      blocked: 0,
    };

    result.rows.forEach((row) => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    res.json(formatSuccessResponse("User statistics retrieved", { stats }));
  } catch (error) {
    console.error("Get stats error:", error);
    res
      .status(500)
      .json(formatErrorResponse("Failed to retrieve user statistics"));
  }
});

module.exports = router;
