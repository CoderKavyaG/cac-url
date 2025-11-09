const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const Url = require("./models/Url")
const mongodburl = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.MONGO_URI;

mongoose.connect(mongodburl).then(() => console.log("MongoDB Connected")).catch((err) => console.error("error kuch to bigdad diya tune"));

app.post("/shorten", async (req,res) => {
    const { originalUrl } = req.body; 

    if(!originalUrl.startsWith("http")){
        return res.status(400).json({error: 'Invalid url'});
    }

    const shortId = nanoid(6);
    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();

    res.json({ shortUrl: `http://localhost:3000/${shortId}`});
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
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
