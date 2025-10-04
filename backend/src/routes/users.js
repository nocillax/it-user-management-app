const express = require("express");
const { query } = require("../config/database");
const {
  authenticateToken,
  verifyUserForAction,
  requireActiveUser,
} = require("../middleware/auth");
const {
  formatErrorResponse,
  formatSuccessResponse,
} = require("../utils/helpers");

const router = express.Router();

router.use(authenticateToken);
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "last_login",
      sortOrder = "desc",
      status = "all",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

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

    let whereClause = "";
    let queryParams = [limitNum, offset];

    if (status !== "all") {
      const allowedStatuses = ["active", "unverified", "blocked"];
      if (allowedStatuses.includes(status)) {
        whereClause = "WHERE status = $3";
        queryParams.push(status);
      }
    }

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countParams = whereClause ? [queryParams[2]] : [];
    const countResult = await query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].total);

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
    res.status(500).json(formatErrorResponse("Failed to retrieve users"));
  }
});

router.patch(
  "/block",
  verifyUserForAction,
  requireActiveUser,
  async (req, res) => {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(formatErrorResponse("User IDs array required"));
      }

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
      res.status(500).json(formatErrorResponse("Failed to block users"));
    }
  }
);

router.patch(
  "/unblock",
  verifyUserForAction,
  requireActiveUser,
  async (req, res) => {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(formatErrorResponse("User IDs array required"));
      }

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
      res.status(500).json(formatErrorResponse("Failed to unblock users"));
    }
  }
);

router.delete(
  "/delete",
  verifyUserForAction,
  requireActiveUser,
  async (req, res) => {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(formatErrorResponse("User IDs array required"));
      }

      const usersToDelete = await query(
        "SELECT id, name, email FROM users WHERE id = ANY($1::uuid[])",
        [userIds]
      );

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
      res.status(500).json(formatErrorResponse("Failed to delete users"));
    }
  }
);

router.delete(
  "/delete-unverified",
  verifyUserForAction,
  requireActiveUser,
  async (req, res) => {
    try {
      const countResult = await query(
        "SELECT COUNT(*) as count FROM users WHERE status = 'unverified'"
      );

      const unverifiedCount = parseInt(countResult.rows[0].count);

      if (unverifiedCount === 0) {
        return res.json(formatSuccessResponse("No unverified users to delete"));
      }

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
      res
        .status(500)
        .json(formatErrorResponse("Failed to delete unverified users"));
    }
  }
);

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
    res
      .status(500)
      .json(formatErrorResponse("Failed to retrieve user statistics"));
  }
});

module.exports = router;
