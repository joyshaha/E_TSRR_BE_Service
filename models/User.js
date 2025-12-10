const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => {
        // Simple regex for email validation
        return /.+@.+\..+/.test(value);
      },
      message: "Please enter a valid email address.",
    },
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "admin" },
  
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema, "user");
