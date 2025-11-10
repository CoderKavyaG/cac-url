require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const Url = require("./models/Url")
const mongodburl = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.MONGO_URI;

const authRoutes = require("./routes/auth");

// create express app and middlewares
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.post("/shorten", async (req,res) => {
    const { originalUrl } = req.body; 

    if(!originalUrl || typeof originalUrl !== "string" || !originalUrl.startsWith("http")){
        return res.status(400).json({error: 'Invalid url'});
    }

    const shortId = nanoid(6);
    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();

    const shortUrlFull = `${process.env.API_URL || 'http://localhost:3000'}/${shortId}`;
    res.json({ shortUrl: shortUrlFull});
});

app.get("/:shortId", async (req,res) => {

    const { shortId } = req.params;
    const theurl = await Url.findOne({ shortId });
    if(theurl){
        return res.redirect(theurl.originalUrl);}
    else{
        return res.status(404).send("Url not found");
    }
})

const PORT = process.env.PORT || 3000;
// Start server after attempting to connect to MongoDB so logs are clearer.

function startServer() {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

if (!mongodburl) {
    console.warn("No MongoDB connection string provided in environment variables. Starting server without DB connection. Shorten/save will fail until a DB is available.");
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
