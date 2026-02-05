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
const recordClick = async (url, req) => {
  url.clicks += 1;

  const clickHistory = Array.isArray(url.clickHistory) ? [...url.clickHistory] : [];
  const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
  
  clickHistory.push({
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown',
    referrer,
  });

  url.clickHistory = clickHistory;
  url.changed('clickHistory', true);
  
  await url.save();
  console.log(`✓ Click recorded for ${url.shortId}: Total clicks = ${url.clicks}`);
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
    return res.status(404).send(`
      <html>
        <head><title>404 - Link Not Found</title></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white;">
          <div style="text-align: center;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
            <p style="color: #888;">This link doesn't exist or has expired.</p>
            <a href="${process.env.FRONTEND_URL || '/'}" style="color: #4ade80; text-decoration: none;">← Go Home</a>
          </div>
        </body>
      </html>
    `);
  }

  const url = await Url.findOne({
    where: {
      customAlias,
      userId: user.id,
      isDeleted: false,
    },
  });

  if (!url) {
    return res.status(404).send(`
      <html>
        <head><title>404 - Link Not Found</title></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white;">
          <div style="text-align: center;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
            <p style="color: #888;">This link doesn't exist or has expired.</p>
            <a href="${process.env.FRONTEND_URL || '/'}" style="color: #4ade80; text-decoration: none;">← Go Home</a>
          </div>
        </body>
      </html>
    `);
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
    return res.status(404).send(`
      <html>
        <head><title>404 - Link Not Found</title></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white;">
          <div style="text-align: center;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
            <p style="color: #888;">This link doesn't exist or has expired.</p>
            <a href="${process.env.FRONTEND_URL || '/'}" style="color: #4ade80; text-decoration: none;">← Go Home</a>
          </div>
        </body>
      </html>
    `);
  }

  // Record click and redirect
  await recordClick(url, req);
  return res.redirect(url.originalUrl);
}));

module.exports = router;
