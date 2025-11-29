require('dotenv').config();
const sequelize = require('./config/database');
const Url = require('./models/Url');

async function populateClickHistory() {
    try {
        console.log('Starting to populate clickHistory...');
        
        // Get all URLs
        const urls = await Url.findAll();
        
        let updated = 0;
        
        for (const url of urls) {
            // If clickHistory is null or undefined, set it to empty array
            if (!url.clickHistory) {
                url.clickHistory = [];
                await url.save();
                updated++;
                console.log(`✓ Updated ${url.shortId}`);
            }
        }
        
        console.log(`\n✓ Completed! Updated ${updated} URLs with empty clickHistory arrays`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

populateClickHistory();
