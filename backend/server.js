require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/database");
const Url = require("./models/Url");
const User = require("./models/User");
const Otp = require("./models/Otp");
const authMiddleware = require("./middleware/auth");

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.post("/shorten", async (req, res) => {
    try {
        const { originalUrl, customAlias } = req.body; 

        if (!originalUrl || typeof originalUrl !== "string" || !originalUrl.startsWith("http")) {
            return res.status(400).json({ error: 'Invalid url' });
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

        // Validate custom alias if provided
        let aliasToUse = null;
        if (customAlias) {
            if (typeof customAlias !== "string" || customAlias.length === 0) {
                return res.status(400).json({ error: "Invalid custom alias format" });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
                return res.status(400).json({ error: "Alias can only contain letters, numbers, hyphens, and underscores" });
            }

            // Check if alias already exists
            const existingAlias = await Url.findOne({
                where: { customAlias }
            });

            if (existingAlias) {
                return res.status(400).json({ error: "Custom alias already taken" });
            }

            aliasToUse = customAlias;
        }

        const shortId = nanoid(6);
        const newUrl = await Url.create({
            originalUrl,
            shortId,
            customAlias: aliasToUse,
            userId: userId || null
        });

        // Return both shortId and customAlias if provided
        const shortUrlFull = aliasToUse 
            ? `${process.env.API_URL || 'http://localhost:3000'}/${aliasToUse}`
            : `${process.env.API_URL || 'http://localhost:3000'}/${shortId}`;

        res.json({ 
            shortUrl: shortUrlFull, 
            shortId: newUrl.shortId,
            customAlias: aliasToUse,
            userId: userId ? "logged-in" : "anonymous" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /urls/transfer - protected route to transfer anonymous URLs to user account
app.post("/urls/transfer", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { urls } = req.body;

        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: "No URLs to transfer" });
        }

        const transferredUrls = [];

        for (const urlData of urls) {
            try {
                // Check if URL already exists (by shortId or customAlias)
                const existingUrl = await Url.findOne({
                    where: {
                        [require('sequelize').Op.or]: [
                            { shortId: urlData.shortId },
                            { customAlias: urlData.customAlias }
                        ]
                    }
                });

                if (!existingUrl) {
                    // Create new URL with userId
                    const newUrl = await Url.create({
                        originalUrl: urlData.originalUrl,
                        shortId: urlData.shortId,
                        customAlias: urlData.customAlias || null,
                        userId: userId,
                        clicks: urlData.clicks || 0,
                        createdAt: new Date(urlData.createdAt),
                        clickHistory: urlData.clickHistory || []
                    });
                    
                    transferredUrls.push({
                        shortId: urlData.shortId,
                        status: "transferred"
                    });
                } else if (!existingUrl.userId) {
                    // URL exists but is anonymous, assign to user
                    existingUrl.userId = userId;
                    await existingUrl.save();
                    transferredUrls.push({
                        shortId: urlData.shortId,
                        status: "claimed"
                    });
                } else {
                    // URL already belongs to someone else
                    transferredUrls.push({
                        shortId: urlData.shortId,
                        status: "conflict"
                    });
                }
            } catch (err) {
                console.error(`Error transferring URL ${urlData.shortId}:`, err);
                transferredUrls.push({
                    shortId: urlData.shortId,
                    status: "error",
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            message: `${transferredUrls.filter(u => u.status === "transferred" || u.status === "claimed").length} URLs transferred`,
            results: transferredUrls
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/urls", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user info to extract username
        const user = await User.findByPk(userId);
        const userName = user.email.split("@")[0];

        // Get all URLs created by this user
        const urls = await Url.findAll({
            where: {
                userId,
                isDeleted: false
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            urls: urls.map(url => ({
                shortId: url.shortId,
                customAlias: url.customAlias || null,
                originalUrl: url.originalUrl,
                shortUrl: `${process.env.API_URL || 'http://localhost:3000'}/${url.shortId}`,
                customShortUrl: url.customAlias ? `${process.env.API_URL || 'http://localhost:3000'}/${userName}/${url.customAlias}` : null,
                userName: userName,
                clicks: url.clicks,
                createdAt: url.createdAt,
                isDeleted: url.isDeleted,
                deletedAt: url.deletedAt,
                expiresAt: url.expiresAt,
                clickHistory: url.clickHistory
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /urls/:shortId - protected route to delete a user's URL
app.delete("/urls/:shortId", authMiddleware, async (req, res) => {
    try {
        const { shortId } = req.params;
        const userId = req.user.userId;
        
        // Find and verify ownership
        const url = await Url.findOne({
            where: { shortId, userId }
        });

        if (!url) {
            return res.status(404).json({ error: "URL not found or unauthorized" });
        }

        // Soft delete - mark as deleted for 30 days recovery
        url.isDeleted = true;
        url.deletedAt = new Date();
        url.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        await url.save();

        res.json({ success: true, message: "URL deleted successfully. It can be recovered within 30 days." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /urls/:shortId/recover - protected route to recover a deleted URL
app.post("/urls/:shortId/recover", authMiddleware, async (req, res) => {
    try {
        const { shortId } = req.params;
        const userId = req.user.userId;

        // Find the deleted URL
        const url = await Url.findOne({
            where: { shortId, userId, isDeleted: true }
        });

        if (!url) {
            return res.status(404).json({ error: "Deleted URL not found or already recovered" });
        }

        // Check if recovery window is still open (30 days)
        const now = new Date();
        if (url.expiresAt && now > url.expiresAt) {
            // Permanently delete after 30 days
            await Url.destroy({ where: { shortId, userId } });
            return res.status(400).json({ error: "Recovery period has expired (30 days)" });
        }

        // Recover the URL
        url.isDeleted = false;
        url.deletedAt = null;
        url.expiresAt = null;
        await url.save();

        res.json({ success: true, message: "URL recovered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /urls/:shortId/alias - protected route to update custom alias
app.put("/urls/:shortId/alias", authMiddleware, async (req, res) => {
    try {
        const { shortId } = req.params;
        const { customAlias } = req.body;
        const userId = req.user.userId;

        if (!customAlias || typeof customAlias !== "string") {
            return res.status(400).json({ error: "Invalid alias" });
        }

        // Validate alias format
        if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
            return res.status(400).json({ error: "Alias can only contain letters, numbers, hyphens, and underscores" });
        }

        // Find and verify ownership
        const url = await Url.findOne({
            where: { shortId, userId }
        });

        if (!url) {
            return res.status(404).json({ error: "URL not found or unauthorized" });
        }

        // Check if alias already exists (for other users)
        const existingAlias = await Url.findOne({
            where: {
                customAlias,
                userId: {
                    [require('sequelize').Op.ne]: userId
                }
            }
        });

        if (existingAlias) {
            return res.status(400).json({ error: "Alias already taken" });
        }

        // Update the alias
        url.customAlias = customAlias;
        await url.save();

        // Get user email to extract username
        const user = await require("./models/User").findByPk(userId);
        const userName = user.email.split("@")[0];
        const fullCustomUrl = `${process.env.API_URL || 'http://localhost:3000'}/${userName}/${customAlias}`;

        res.json({ success: true, customAlias: customAlias, fullCustomUrl: fullCustomUrl, userName: userName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Handle both /shortId and /userName/customAlias formats
// Route 1: /userName/customAlias (personalized custom URL)
app.get("/:userName/:customAlias", async (req, res) => {
    try {
        const { userName, customAlias } = req.params;
        const { Op } = require('sequelize');

        // Format: /userName/customAlias
        const user = await User.findOne({
            where: { email: { [Op.like]: `${userName}@%` } }
        });

        let theurl = null;
        if (user) {
            theurl = await Url.findOne({
                where: {
                    customAlias: customAlias,
                    userId: user.id,
                    isDeleted: false
                }
            });
        }

        if (theurl) {
            // Increase click count
            theurl.clicks += 1;

            // Add to click history - Create a new array to avoid reference issues
            const clickHistory = Array.isArray(theurl.clickHistory) ? [...theurl.clickHistory] : [];
            const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
            clickHistory.push({
                timestamp: new Date().toISOString(),
                userAgent: req.headers["user-agent"] || "Unknown",
                ipAddress:
                    req.ip ||
                    req.headers["x-forwarded-for"] ||
                    req.connection.remoteAddress ||
                    "Unknown",
                referrer: referrer,
            });
            theurl.clickHistory = clickHistory;
            theurl.changed('clickHistory', true); // Mark field as changed for Sequelize

            // Save updates
            await theurl.save();
            console.log(`✓ Click recorded for ${theurl.shortId}: Total clicks = ${theurl.clicks}, History length = ${theurl.clickHistory.length}`);

            // Redirect to original URL
            return res.redirect(theurl.originalUrl);
            return res.redirect(theurl.originalUrl);
        } else {
            return res.status(404).send("URL not found or has been deleted");
        }
    } catch (err) {
        console.error("Error during redirection:", err);
        return res.status(500).send("Server error");
    }
});

// Route 2: /shortId (anonymous or short ID redirect)
app.get("/:shortId", async (req, res) => {
    try {
        const { shortId } = req.params;
        const { Op } = require('sequelize');

        // Check both shortId and customAlias (for non-personalized URLs)
        const theurl = await Url.findOne({
            where: {
                [Op.or]: [
                    { shortId },
                    { customAlias: shortId }
                ],
                isDeleted: false  // Only active URLs can be accessed
            }
        });

        if (theurl) {
            // Increase click count
            theurl.clicks += 1;

            // Add to click history - Create a new array to avoid reference issues
            const clickHistory = Array.isArray(theurl.clickHistory) ? [...theurl.clickHistory] : [];
            const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
            clickHistory.push({
                timestamp: new Date().toISOString(),
                userAgent: req.headers["user-agent"] || "Unknown",
                ipAddress:
                    req.ip ||
                    req.headers["x-forwarded-for"] ||
                    req.connection.remoteAddress ||
                    "Unknown",
                referrer: referrer,
            });
            theurl.clickHistory = clickHistory;
            theurl.changed('clickHistory', true); // Mark field as changed for Sequelize

            // Save updates
            await theurl.save();
            console.log(`✓ Click recorded for ${theurl.shortId}: Total clicks = ${theurl.clicks}, History length = ${theurl.clickHistory.length}`);

            // Redirect to original URL
            return res.redirect(theurl.originalUrl);
        } else {
            return res.status(404).send("URL not found or has been deleted");
        }
    } catch (err) {
        console.error("Error during redirection:", err);
        return res.status(500).send("Server error");
    }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Sync database and create tables if they don't exist
        await sequelize.sync({ alter: false });
        console.log("✓ Database synchronized successfully");
        
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ PostgreSQL database connected: ${process.env.DB_NAME}`);
        });
    } catch (err) {
        console.error("✗ Database connection error:", err);
        console.error("Make sure PostgreSQL is running and the database exists.");
        process.exit(1);
    }
}

startServer();
