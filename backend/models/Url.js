const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    originalUrl : { type:String, required: true },
    shortId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Url", UrlSchema);