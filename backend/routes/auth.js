const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Google OAuth - Initiate
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
}));

// Helper to ensure valid Frontend URL (handles missing https://)
const getFrontendUrl = () => {
  let url = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
};

// Google OAuth - Callback
router.get("/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${getFrontendUrl()}?error=auth_failed`
    })(req, res, next);
  },
  (req, res) => {
    const frontendUrl = getFrontendUrl();
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: req.user.id,
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      console.error("Error in Google callback:", err);
      res.redirect(`${frontendUrl}?error=server_error`);
    }
  }
);

// Get current user info
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Logout (just for frontend state clearing - JWT is stateless)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
