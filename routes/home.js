const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");
const sequelize = require("../config/pg");

router.get("/", async (req, res) => {
  console.log("Health Check");
  try {
    res.status(200).json({ message: "Server is running" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DB Connection Test
router.get("/db-test", async (req, res) => {
  try {
    const dbTest = await sequelize.authenticate();
    console.log("DB Test Connection:", dbTest);
    if (dbTest) {
      return res.send("DB connection successful");
    }
    const result = await sequelize.query("SELECT 1+1 AS result");
    res.status(200).json({ message: "DB connection successful", result });
  } catch (error) {
    console.error("DB Test Error:", error);
    res.status(500).json({ error: "DB connection error" });
  }
});

// Get current user
router.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id, {password: 0, twoFactorSecret: 0, refreshToken: 0, __v: 0}
    );
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
