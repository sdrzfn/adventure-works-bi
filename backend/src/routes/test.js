import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT NOW() AS server_time"
    );

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      data: rows
    });

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

export default router;