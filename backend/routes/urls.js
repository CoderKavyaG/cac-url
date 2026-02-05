const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Url = require('../models/Url');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');
const { createError } = require('../utils/ApiError');
const { successResponse } = require('../utils/responseHandler');
const { isValidAlias, getUsernameFromEmail } = require('../utils/validators');

/**
 * @route   GET /urls
 * @desc    Get all URLs for authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findByPk(userId);
  if (!user) {
    throw createError.notFound('User not found');
  }

  const userName = getUsernameFromEmail(user.email);
  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  const urls = await Url.findAll({
    where: { userId, isDeleted: false },
    order: [['createdAt', 'DESC']],
  });

  const formattedUrls = urls.map(url => ({
    shortId: url.shortId,
    customAlias: url.customAlias || null,
    originalUrl: url.originalUrl,
    shortUrl: `${baseUrl}/${url.shortId}`,
    customShortUrl: url.customAlias ? `${baseUrl}/${userName}/${url.customAlias}` : null,
    userName,
    clicks: url.clicks,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    clickHistory: url.clickHistory || [],
  }));

  successResponse(res, { urls: formattedUrls }, 'URLs retrieved successfully');
}));

/**
 * @route   POST /urls/transfer
 * @desc    Transfer anonymous URLs to user account
 * @access  Private
 */
router.post('/transfer', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    throw createError.badRequest('No URLs to transfer');
  }

  const results = [];

  for (const urlData of urls) {
    try {
      const existingUrl = await Url.findOne({
        where: {
          [Op.or]: [
            { shortId: urlData.shortId },
            ...(urlData.customAlias ? [{ customAlias: urlData.customAlias }] : []),
          ],
        },
      });

      if (!existingUrl) {
        // Create new URL with userId
        await Url.create({
          originalUrl: urlData.originalUrl,
          shortId: urlData.shortId,
          customAlias: urlData.customAlias || null,
          userId,
          clicks: urlData.clicks || 0,
          clickHistory: urlData.clickHistory || [],
        });
        results.push({ shortId: urlData.shortId, status: 'transferred' });
      } else if (!existingUrl.userId) {
        // Claim anonymous URL
        existingUrl.userId = userId;
        await existingUrl.save();
        results.push({ shortId: urlData.shortId, status: 'claimed' });
      } else {
        results.push({ shortId: urlData.shortId, status: 'conflict' });
      }
    } catch (err) {
      results.push({ shortId: urlData.shortId, status: 'error', error: err.message });
    }
  }

  const successCount = results.filter(r => r.status === 'transferred' || r.status === 'claimed').length;
  successResponse(res, { results }, `${successCount} URL(s) transferred successfully`);
}));

/**
 * @route   DELETE /urls/:shortId
 * @desc    Soft delete a URL (recoverable for 30 days)
 * @access  Private
 */
router.delete('/:shortId', authMiddleware, asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  const userId = req.user.userId;

  const url = await Url.findOne({ where: { shortId, userId } });
  if (!url) {
    throw createError.notFound('URL not found or unauthorized');
  }

  // Soft delete
  url.isDeleted = true;
  url.deletedAt = new Date();
  url.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days recovery window
  await url.save();

  successResponse(res, null, 'URL deleted. It can be recovered within 30 days.');
}));

/**
 * @route   POST /urls/:shortId/recover
 * @desc    Recover a soft-deleted URL
 * @access  Private
 */
router.post('/:shortId/recover', authMiddleware, asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  const userId = req.user.userId;

  const url = await Url.findOne({ where: { shortId, userId, isDeleted: true } });
  if (!url) {
    throw createError.notFound('Deleted URL not found or already recovered');
  }

  // Check recovery window
  if (url.expiresAt && new Date() > url.expiresAt) {
    await Url.destroy({ where: { shortId, userId } });
    throw createError.badRequest('Recovery period has expired (30 days)');
  }

  // Recover
  url.isDeleted = false;
  url.deletedAt = null;
  url.expiresAt = null;
  await url.save();

  successResponse(res, { shortId }, 'URL recovered successfully');
}));

/**
 * @route   PUT /urls/:shortId/alias
 * @desc    Update custom alias for a URL
 * @access  Private
 */
router.put('/:shortId/alias', authMiddleware, asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  const { customAlias } = req.body;
  const userId = req.user.userId;

  if (!isValidAlias(customAlias)) {
    throw createError.badRequest('Alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores');
  }

  const url = await Url.findOne({ where: { shortId, userId } });
  if (!url) {
    throw createError.notFound('URL not found or unauthorized');
  }

  // Check if alias is taken by another user
  const existingAlias = await Url.findOne({
    where: {
      customAlias,
      userId: { [Op.ne]: userId },
    },
  });

  if (existingAlias) {
    throw createError.conflict('Alias is already taken');
  }

  url.customAlias = customAlias;
  await url.save();

  // Get username for custom URL
  const user = await User.findByPk(userId);
  const userName = getUsernameFromEmail(user.email);
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const fullCustomUrl = `${baseUrl}/${userName}/${customAlias}`;

  successResponse(res, { customAlias, fullCustomUrl, userName }, 'Alias updated successfully');
}));

/**
 * @route   GET /urls/:shortId/stats
 * @desc    Get detailed stats for a URL
 * @access  Private
 */
router.get('/:shortId/stats', authMiddleware, asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  const userId = req.user.userId;

  const url = await Url.findOne({ where: { shortId, userId } });
  if (!url) {
    throw createError.notFound('URL not found or unauthorized');
  }

  const clickHistory = url.clickHistory || [];
  
  // Aggregate click data
  const clicksByDay = {};
  const clicksByReferrer = {};
  const clicksByBrowser = {};

  clickHistory.forEach(click => {
    // By day
    const day = new Date(click.timestamp).toISOString().split('T')[0];
    clicksByDay[day] = (clicksByDay[day] || 0) + 1;

    // By referrer
    const referrer = click.referrer || 'Direct';
    clicksByReferrer[referrer] = (clicksByReferrer[referrer] || 0) + 1;

    // Simple browser detection from user agent
    const ua = (click.userAgent || '').toLowerCase();
    let browser = 'Other';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    clicksByBrowser[browser] = (clicksByBrowser[browser] || 0) + 1;
  });

  successResponse(res, {
    shortId: url.shortId,
    originalUrl: url.originalUrl,
    totalClicks: url.clicks,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    analytics: {
      clicksByDay,
      clicksByReferrer,
      clicksByBrowser,
      recentClicks: clickHistory.slice(-10).reverse(),
    },
  }, 'URL stats retrieved successfully');
}));

module.exports = router;
