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
        type:String,
        required: false,
    },
    email: {
        type:String,
        required: false,
    },
    createdAt: Date,
    clicks:{
        type: Number,
        default:0,
    },
    clickHistory:{
        timestamp: Date,
        userAgent: String,
        ipAddress: String,
        referer: String,
    },
});

module.exports = mongoose.model("Url", UrlSchema);