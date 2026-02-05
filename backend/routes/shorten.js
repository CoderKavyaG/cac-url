const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const Url = require('../models/Url');
const { asyncHandler } = require('../utils/errorHandler');
const { createError } = require('../utils/ApiError');
const { successResponse, createdResponse } = require('../utils/responseHandler');
const { isValidUrl, isValidAlias } = require('../utils/validators');

/**
 * @route   POST /shorten
 * @desc    Create a shortened URL
 * @access  Public (with optional auth for linking to user)
 */
router.post('/', asyncHandler(async (req, res) => {
  const { originalUrl, customAlias } = req.body;

  // Validate URL
  if (!originalUrl || !isValidUrl(originalUrl)) {
    throw createError.badRequest('Please provide a valid URL (must start with http:// or https://)');
  }

  // Extract userId from JWT if user is logged in
  let userId = null;
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      // Token invalid - continue as anonymous
    }
  }

  // Validate and check custom alias if provided
  let aliasToUse = null;
  if (customAlias) {
    if (!isValidAlias(customAlias)) {
      throw createError.badRequest('Alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores');
    }

    const existingAlias = await Url.findOne({ where: { customAlias } });
    if (existingAlias) {
      throw createError.conflict('Custom alias is already taken');
    }

    aliasToUse = customAlias;
  }

  // Generate short ID and create URL
  const shortId = nanoid(6);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const { seoTitle, seoDescription, seoImage } = req.body;

  const newUrl = await Url.create({
    originalUrl,
    shortId,
    customAlias: aliasToUse,
    userId: userId || null,
    expiresAt,
    clicks: 0,
    clickHistory: [],
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    seoImage: seoImage || null,
  });

  // Build the short URL (Use Frontend URL for clean, short links)
  let baseUrl = process.env.FRONTEND_URL || process.env.API_URL || 'http://localhost:3000';

  // Ensure protocol and remove trailing slash
  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/$/, '');

  const shortUrlPath = aliasToUse || shortId;
  const shortUrl = `${baseUrl}/${shortUrlPath}`;

  createdResponse(res, {
    shortUrl,
    shortId: newUrl.shortId,
    customAlias: aliasToUse,
    originalUrl: newUrl.originalUrl,
    expiresAt: newUrl.expiresAt,
    isAuthenticated: !!userId,
  }, 'URL shortened successfully');
}));

module.exports = router;
