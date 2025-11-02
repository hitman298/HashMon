const express = require('express');
const router = express.Router();

const BlockchainService = require('../services/BlockchainService');

// Get network information
router.get('/network', async (req, res) => {
  try {
    const networkInfo = await BlockchainService.getNetworkInfo();
    res.json(networkInfo);
  } catch (error) {
    console.error('Get network info error:', error);
    res.status(500).json({ error: 'Failed to get network information' });
  }
});

// Get blockchain statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      battleLogsCount: await BlockchainService.getBattleLogsCount(),
      walletBalance: await BlockchainService.getWalletBalance(),
      networkInfo: await BlockchainService.getNetworkInfo()
    };

    res.json(stats);
  } catch (error) {
    console.error('Get blockchain stats error:', error);
    res.status(500).json({ error: 'Failed to get blockchain statistics' });
  }
});

// Get recent battle logs
router.get('/battle-logs', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const battleLogs = await BlockchainService.getRecentBattleLogs(parseInt(limit));
    
    res.json({ battleLogs });
  } catch (error) {
    console.error('Get battle logs error:', error);
    res.status(500).json({ error: 'Failed to get battle logs' });
  }
});

// Get recent blockchain transactions (mock/demo)
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 10, address } = req.query;
    const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));

    const transactions = await BlockchainService.getTransactionHistory(address, parsedLimit);

    res.json({
      address: address || null,
      limit: parsedLimit,
      transactions
    });
  } catch (error) {
    console.error('Get blockchain transactions error:', error);
    res.status(500).json({ error: 'Failed to get recent transactions' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await BlockchainService.healthCheck();
    res.json(healthStatus);
  } catch (error) {
    console.error('Blockchain health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;

