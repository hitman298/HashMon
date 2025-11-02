const express = require('express');
const Joi = require('joi');
const router = express.Router();

const BlockchainService = require('../services/BlockchainService');

// Validation schemas
const tokenIdSchema = Joi.object({
  tokenId: Joi.number().integer().min(1).required()
});

const updateStatsSchema = Joi.object({
  newLevel: Joi.number().integer().min(1).required(),
  newXp: Joi.number().integer().min(0).required(),
  newHp: Joi.number().integer().min(1).required(),
  newAttack: Joi.number().integer().min(1).required(),
  newDefense: Joi.number().integer().min(1).required(),
  newSpeed: Joi.number().integer().min(1).required()
});

// Get HashMon data from blockchain
router.get('/:tokenId', async (req, res) => {
  try {
    const { error, value } = tokenIdSchema.validate({
      tokenId: req.params.tokenId
    });

    if (error) {
      return res.status(400).json({
        error: 'Invalid token ID',
        details: error.details[0].message
      });
    }

    const hashmonData = await BlockchainService.getHashMonData(value.tokenId);

    if (!hashmonData) {
      return res.status(404).json({ error: 'HashMon not found' });
    }

    res.json(hashmonData);

  } catch (error) {
    console.error('Get hashmon data error:', error);
    res.status(500).json({ error: 'Failed to get HashMon data' });
  }
});

// Update HashMon stats
router.put('/:tokenId/stats', async (req, res) => {
  try {
    const { error: tokenError, value: tokenValue } = tokenIdSchema.validate({
      tokenId: req.params.tokenId
    });

    if (tokenError) {
      return res.status(400).json({
        error: 'Invalid token ID',
        details: tokenError.details[0].message
      });
    }

    const { error: statsError, value: statsValue } = updateStatsSchema.validate(req.body);

    if (statsError) {
      return res.status(400).json({
        error: 'Invalid stats data',
        details: statsError.details[0].message
      });
    }

    const result = await BlockchainService.updateHashMonStats(
      tokenValue.tokenId,
      statsValue.newLevel,
      statsValue.newXp,
      statsValue.newHp,
      statsValue.newAttack,
      statsValue.newDefense,
      statsValue.newSpeed
    );

    if (result) {
      res.json({
        message: 'HashMon stats updated successfully',
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      });
    } else {
      res.status(500).json({ error: 'Failed to update HashMon stats' });
    }

  } catch (error) {
    console.error('Update hashmon stats error:', error);
    res.status(500).json({ error: 'Failed to update HashMon stats' });
  }
});

module.exports = router;

