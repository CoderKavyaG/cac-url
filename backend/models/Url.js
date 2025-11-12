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
    customAlias: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
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
    expiresAt: {
        type: Date,
        required: false,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        required: false,
        default: null,
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