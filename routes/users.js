const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// Get all users (Admin only)
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, { __v: 0, twoFactorSecret: 0, twoFactorEnabled: 0, refreshToken: 0, createdAt: 0 }).select(
      "-password"
    );
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID (Admin or self)
router.get("/:id", auth(["admin", "user"]), async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await User.findById(req.params.id, { __v: 0, refreshToken: 0 }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Post user (Admin only)
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // create user
    const user = await new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    }).save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user (Admin or self)
router.put("/:id", auth(["admin", "user"]), async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.password)
      updates.password = await bcrypt.hash(req.body.password, 10);
    if (req.user.role === "admin" && req.body.role)
      updates.role = req.body.role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete user (Admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
