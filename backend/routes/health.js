const express = require('express');
const router = express.Router();

// Health check endpoint for keep-alive pings
router.get('/', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    ping: 'pong'
  };

  // Log the ping (optional - remove in production if too verbose)
  console.log(`Health check pinged at ${healthData.timestamp}`);

  res.status(200).json(healthData);
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
