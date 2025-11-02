const express = require('express');
const router = express.Router();
const BlockchainService = require('../services/BlockchainService');

// Network info endpoint
router.get('/network-info', async (req, res) => {
  try {
    const networkInfo = await BlockchainService.getNetworkInfo();
    res.json(networkInfo);
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({ error: 'Failed to get network info' });
  }
});

module.exports = router;
