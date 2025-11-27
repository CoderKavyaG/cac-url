const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "Kavyasecretkey12323";

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password: password,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;
