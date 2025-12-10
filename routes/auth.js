const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticateToken, authenticateRefreshToken } = require("../middleware/auth");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  try {
    const query = {$or: [{ username }, { email }]}
    let user = await User.findOne(query);
    if (user) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
    });
    console.log(user);

    // Generate tokens
    const token_payload = {
      id: user._id,
      role: user.role,
    }
    const accessToken = generateAccessToken(token_payload);
    const refreshToken = generateRefreshToken(token_payload);

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    // console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "User or password is not matched" });
    }

    // If 2FA is enabled, verify the code
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(400).json({ 
          error: 'Two-factor authentication code required',
          requiresTwoFactor: true 
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 0,
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }

    // Generate tokens
    const token_payload = {
      id: user._id,
      role: user.role,
    }
    const accessToken = generateAccessToken(token_payload);
    const refreshToken = generateRefreshToken(token_payload);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.lastLoginAt = Date.now();
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        refreshToken: user.refreshToken,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    // Extract only necessary fields to avoid JWT metadata conflicts
    const token_payload = {
      id: req.user.id,
      role: req.user.role,
    };
    const newAccessToken = generateAccessToken(token_payload);
    console.log(newAccessToken);

    res.json({
      accessToken: newAccessToken,
      user: {
        id: req.user.id,
        email: req.user.email,
        twoFactorEnabled: req.user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: { refreshToken: null } },
      { new: true, runValidators: true }
    );
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
