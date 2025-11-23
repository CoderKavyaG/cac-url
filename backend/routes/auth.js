const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY) || 600; // 10 minutes
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS) || 5;

// Generate random OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Clean up expired OTPs for this email
    await Otp.destroy({
      where: {
        email: email.toLowerCase(),
      },
    });

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);

    // Save OTP to database
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent) {
      await Otp.destroy({
        where: {
          email: email.toLowerCase(),
        },
      });

      return res.status(500).json({
        error: "Failed to send OTP. Please try again.",
      });
    }

    res.json({
      message: "OTP sent to your email",
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error("Error in send-otp:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "OTP not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.destroy({
        where: {
          email: email.toLowerCase(),
        },
      });

      return res.status(400).json({
        error: "OTP expired. Please request a new OTP.",
      });
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.destroy({
        where: {
          email: email.toLowerCase(),
        },
      });

      return res.status(400).json({
        error: "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await Otp.increment("attempts", {
        where: {
          email: email.toLowerCase(),
        },
      });

      const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);

      return res.status(400).json({
        error: "Invalid OTP",
        remainingAttempts,
      });
    }

    // OTP verified, find or create user
    let user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
      });
    }

    // Mark OTP as verified
    await Otp.update(
      { verified: true },
      {
        where: {
          email: email.toLowerCase(),
        },
      }
    );

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
      message: "OTP verified successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });

    // Clean up OTP after verification
    setTimeout(async () => {
      await Otp.destroy({
        where: {
          email: email.toLowerCase(),
        },
      });
    }, 5000);
  } catch (err) {
    console.error("Error in verify-otp:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;
