const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Setup 2FA
router.post('/setup-2fa', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Two-factor authentication already enabled' });
    }
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `E_TSRR App - ${user.email}`,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret to database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: { twoFactorSecret: secret.base32 } },
      { new: true, runValidators: true }
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app',
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const user = await User.findById(req.user.id);
    console.log(user);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA setup not initiated' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 0,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    // Save secret to database
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { twoFactorEnabled: true } },
      { new: true, runValidators: true }
    );
    
    res.json({
      message: '2FA enabled successfully',
      twoFactorEnabled: true,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, async (req, res) => {
  try {
    const { password, code } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user.twoFactorEnabled) {
      return res.status(404).json({ error: '2FA is not enabled' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If 2FA is enabled, require code
    if (user.twoFactorEnabled && !code) {
      return res.status(400).json({ error: '2FA code is required' });
    }

    if (user.twoFactorEnabled) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 0,
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    // Disable 2FA
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { twoFactorEnabled: false, twoFactorSecret: null } },
      { new: true, runValidators: true }
    );
    console.log(updatedUser);

    res.json({
      message: '2FA disabled successfully',
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;