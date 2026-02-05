const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { successResponse } = require('../utils/responseHandler');

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
    database: 'Unknown',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
  };

  try {
    await sequelize.authenticate();
    healthCheck.database = 'Connected';
    successResponse(res, healthCheck, 'Service is healthy');
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.database = 'Disconnected';
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      data: healthCheck,
    });
  }
});

/**
 * @route   GET /health/db
 * @desc    Database connectivity check
 * @access  Public
 */
router.get('/db', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT NOW() as time');
    successResponse(res, {
      connected: true,
      serverTime: results[0].time,
    }, 'Database is connected');
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
    });
  }
});

module.exports = router;
