require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const Url = require("./models/Url")
const mongodburl = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.MONGO_URI;

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.post("/shorten", async (req,res) => {
    try {
        const { originalUrl } = req.body; 

        if(!originalUrl || typeof originalUrl !== "string" || !originalUrl.startsWith("http")){
            return res.status(400).json({error: 'Invalid url'});
        }

        // Get userId from JWT if user is logged in
        const token = req.headers.authorization?.split(" ")[1];
        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "Kavyasecretkey12323");
                userId = decoded.userId;
            } catch (err) {
                // If token is invalid, just treat as anonymous
            }
        }

        const shortId = nanoid(6);
        const newUrl = new Url({ 
            originalUrl, 
            shortId,
            userId
        });
        await newUrl.save();

        const shortUrlFull = `${process.env.API_URL || 'http://localhost:3000'}/${shortId}`;
        res.json({ shortUrl: shortUrlFull, userId: userId ? "logged-in" : "anonymous" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const theurl = await Url.findOne({ shortId });

    if (theurl) {
      // Increase click count
      theurl.clicks += 1;

      // Add to click history (keep multiple entries)
      theurl.clickHistory.push({
        timestamp: new Date(),
        userAgent: req.headers["user-agent"] || "Unknown",
        ipAddress:
          req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          "Unknown",
      });

      // Save updates
      await theurl.save();

      // Redirect to original URL
      return res.redirect(theurl.originalUrl);
    } else {
      return res.status(404).send("URL not found");
    }
  } catch (err) {
    console.error("Error during redirection:", err);
    return res.status(500).send("Server error");
  }
});

// GET /urls - protected route to get user's shortened URLs with stats
app.get("/urls", async (req, res) => {
    try {
        // Verify JWT token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "Kavyasecretkey12323");
            userId = decoded.userId;
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Get all URLs created by this user
        const urls = await Url.find({ userId }).sort({ createdAt: -1 });

        res.json({
            urls: urls.map(url => ({
                shortId: url.shortId,
                originalUrl: url.originalUrl,
                shortUrl: `${process.env.API_URL || 'http://localhost:3000'}/${url.shortId}`,
                clicks: url.clicks,
                createdAt: url.createdAt,
                clickHistory: url.clickHistory
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;
// Start server after attempting to connect to MongoDB so logs are clearer.

function startServer() {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

if (!mongodburl) {
    console.warn("No MongoDB connection string provided in environment variables");
    startServer();
} else {
    mongoose
        .connect(mongodburl)
        .then(() => {
            console.log("MongoDB Connected");
            startServer();
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            console.warn("Proceeding to start server on port", PORT, "but DB features may not work until a valid MongoDB URL is provided.");
            startServer();
        });
}
