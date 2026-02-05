const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Url = require('../models/Url');
const User = require('../models/User');
const { asyncHandler } = require('../utils/errorHandler');
const { getUsernameFromEmail } = require('../utils/validators');

/**
 * Record click analytics
 */
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Record click analytics
 */
const recordClick = async (url, req) => {
  url.clicks += 1;

  const clickHistory = Array.isArray(url.clickHistory) ? [...url.clickHistory] : [];
  const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
  const userAgentString = req.headers['user-agent'] || 'Unknown';

  // Parse User Agent
  const parser = new UAParser(userAgentString);
  const uaResult = parser.getResult();

  // Parse IP for Geo-location
  // Handle proxied requests (x-forwarded-for can be a comma-separated list)
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Localhost (::1 or 127.0.0.1) won't return geo data
  const geo = geoip.lookup(ip) || {};

  clickHistory.push({
    timestamp: new Date().toISOString(),
    ipAddress: ip || 'Unknown',
    referrer,
    userAgent: userAgentString,
    browser: uaResult.browser.name || 'Unknown',
    os: uaResult.os.name || 'Unknown',
    device: uaResult.device.type || 'Desktop', // 'console', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded'
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown',
    region: geo.region || 'Unknown'
  });

  // Keep history manageable (last 1000 clicks)
  if (clickHistory.length > 1000) {
    clickHistory.shift();
  }

  url.clickHistory = clickHistory;
  url.changed('clickHistory', true);

  await url.save();
  console.log(`✓ Click recorded for ${url.shortId}: ${geo.country || 'Unknown'} | ${uaResult.os.name || 'Unknown'}`);
};

/**
 * @route   GET /:userName/:customAlias
 * @desc    Redirect personalized custom URL (e.g., /johndoe/my-link)
 * @access  Public
 */
const isBot = (userAgent) => {
  const bots = [
    'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'slackbot', 'telegrambot',
    'discordbot', 'pinterest', 'googlebot', 'bingbot'
  ];
  const lowerUA = (userAgent || '').toLowerCase();
  return bots.some(bot => lowerUA.includes(bot));
};

const serveMetaPage = (res, url) => {
  const { originalUrl, seoTitle, seoDescription, seoImage } = url;

  // Basic title/desc fallback
  const title = seoTitle || 'Shared Link';
  const description = seoDescription || 'Check out this link!';
  const image = seoImage || ''; // Empty string if no image

  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="${originalUrl}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      ${image ? `<meta property="og:image" content="${image}">` : ''}

      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${originalUrl}">
      <meta property="twitter:title" content="${title}">
      <meta property="twitter:description" content="${description}">
      ${image ? `<meta property="twitter:image" content="${image}">` : ''}

      <title>${title}</title>
      
      <!-- Immediate redirect for non-bots who might see this -->
      <meta http-equiv="refresh" content="0;url=${originalUrl}">
      <script>window.location.replace("${originalUrl}");</script>
    </head>
    <body>
      <p>Redirecting to <a href="${originalUrl}">${originalUrl}</a>...</p>
    </body>
    </html>
  `);
};


/**
 * @route   GET /:userName/:customAlias
 * @desc    Redirect personalized custom URL (e.g., /johndoe/my-link)
 * @access  Public
 */
router.get('/:userName/:customAlias', asyncHandler(async (req, res) => {
  const { userName, customAlias } = req.params;

  // Find user by username (email prefix)
  const user = await User.findOne({
    where: { email: { [Op.like]: `${userName}@%` } },
  });

  if (!user) {
    return res.status(404).send(get404Page());
  }

  const url = await Url.findOne({
    where: {
      customAlias,
      userId: user.id,
      isDeleted: false,
    },
  });

  if (!url) {
    return res.status(404).send(get404Page());
  }

  // Check Expiration
  if (url.expiresAt && new Date() > url.expiresAt) {
    return res.status(410).send(get404Page('This link has expired.'));
  }

  // Handle Metadata/Bot request
  const userAgent = req.headers['user-agent'] || '';
  if (isBot(userAgent) && (url.seoTitle || url.seoDescription || url.seoImage)) {
    // Determine if we should record click for bots: usually NO, to avoid skewing stats.
    // We will NOT record click for bots viewing metadata.
    return serveMetaPage(res, url);
  }

  // Record click and redirect
  await recordClick(url, req);
  return res.redirect(url.originalUrl);
}));

/**
 * @route   GET /:shortId
 * @desc    Redirect short URL or custom alias
 * @access  Public
 */
router.get('/:shortId', asyncHandler(async (req, res) => {
  const { shortId } = req.params;

  // Skip API routes
  if (['api', 'auth', 'shorten', 'urls', 'health'].includes(shortId)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = await Url.findOne({
    where: {
      [Op.or]: [{ shortId }, { customAlias: shortId }],
      isDeleted: false,
    },
  });

  if (!url) {
    return res.status(404).send(get404Page());
  }

  // Check Expiration
  if (url.expiresAt && new Date() > url.expiresAt) {
    return res.status(410).send(get404Page('This link has expired.'));
  }

  // Handle Metadata/Bot request
  const userAgent = req.headers['user-agent'] || '';
  if (isBot(userAgent) && (url.seoTitle || url.seoDescription || url.seoImage)) {
    return serveMetaPage(res, url);
  }

  // Record click and redirect
  await recordClick(url, req);
  return res.redirect(url.originalUrl);
}));

// Helper for consistent 404 pages
function get404Page(message = "This link doesn't exist or has expired.") {
  return `
    <html>
      <head><title>Link Not Found</title></head>
      <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white;">
        <div style="text-align: center;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
          <p style="color: #888;">${message}</p>
          <a href="${process.env.FRONTEND_URL || '/'}" style="color: #4ade80; text-decoration: none;">← Go Home</a>
        </div>
      </body>
    </html>
  `;
}

module.exports = router;
