const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");

router.get("/", async (req, res) => {
  console.log("Health Check", res);
  try {
    res.status(200).json({ message: "Server is running" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
