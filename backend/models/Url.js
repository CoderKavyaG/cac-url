const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: false,
        default: null,
    },
    email: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    clickHistory: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
            userAgent: String,
            ipAddress: String,
            referer: String,
        }
    ],
});

module.exports = mongoose.model("Url", UrlSchema);