const express = require('express');
const Joi = require('joi');
const router = express.Router();

const PlayerService = require('../services/PlayerService');
// const { authenticatePrivy, optionalAuth } = require('../middleware/auth');

// Validation schemas
const playerAddressSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

const starterHashmonSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  starterType: Joi.string().valid('fire', 'water', 'grass').default('fire')
});

const unlockAchievementSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  achievementType: Joi.string().min(3).max(64).required(),
  achievementData: Joi.object().default({})
});

// Get current user's stats (authenticated) - temporarily disabled
router.get('/stats/me', async (req, res) => {
  try {
    // For now, return a mock response
    res.json({
      playerAddress: 'mock-address',
      battlesWon: 0,
      battlesLost: 0,
      hashMonsOwned: 0,
      experiencePoints: 0
    });
  } catch (error) {
    console.error('Get authenticated user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get player stats by address (public)
router.get('/stats/:playerAddress', async (req, res) => {
  try {
    console.log('Getting player stats for:', req.params.playerAddress);
    
    const { error, value } = playerAddressSchema.validate({
      playerAddress: req.params.playerAddress
    });

    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({
        error: 'Invalid player address',
        details: error.details[0].message
      });
    }

    console.log('Calling PlayerService.getPlayerStats...');
    const playerStats = await PlayerService.getPlayerStats(value.playerAddress);
    console.log('Player stats retrieved successfully');
    res.json(playerStats);

  } catch (error) {
    console.error('Get player stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to get player stats' });
  }
});

// Get player's HashMons
router.get('/hashmons/:playerAddress', async (req, res) => {
  try {
    const { error, value } = playerAddressSchema.validate({
      playerAddress: req.params.playerAddress
    });

    if (error) {
      return res.status(400).json({
        error: 'Invalid player address',
        details: error.details[0].message
      });
    }

    const hashmons = await PlayerService.getPlayerHashmons(value.playerAddress);
    res.json({ hashmons });

  } catch (error) {
    console.error('Get player hashmons error:', error);
    res.status(500).json({ error: 'Failed to get player HashMons' });
  }
});

// Get player battle history
router.get('/battles/:playerAddress', async (req, res) => {
  try {
    const { error, value } = playerAddressSchema.validate({
      playerAddress: req.params.playerAddress
    });

    if (error) {
      return res.status(400).json({
        error: 'Invalid player address',
        details: error.details[0].message
      });
    }

    const { limit = 20, offset = 0 } = req.query;
    const battles = await PlayerService.getBattleHistory(
      value.playerAddress,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ battles });

  } catch (error) {
    console.error('Get player battles error:', error);
    res.status(500).json({ error: 'Failed to get player battles' });
  }
});

// Create starter HashMon
router.post('/starter', async (req, res) => {
  try {
    const { error, value } = starterHashmonSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.details[0].message
      });
    }

    const { playerAddress, starterType } = value;
    const starterHashmon = await PlayerService.createStarterHashmon(playerAddress, starterType);

    res.json({
      message: 'Starter HashMon created successfully',
      hashmon: starterHashmon
    });

  } catch (error) {
    console.error('Create starter hashmon error:', error);
    res.status(500).json({ error: 'Failed to create starter HashMon' });
  }
});

// Get player achievements
router.get('/achievements/:playerAddress', async (req, res) => {
  try {
    const { error, value } = playerAddressSchema.validate({
      playerAddress: req.params.playerAddress
    });

    if (error) {
      return res.status(400).json({
        error: 'Invalid player address',
        details: error.details[0].message
      });
    }

    const achievements = await PlayerService.getPlayerAchievements(value.playerAddress);
    res.json({ achievements });

  } catch (error) {
    console.error('Get player achievements error:', error);
    res.status(500).json({ error: 'Failed to get player achievements' });
  }
});

// Unlock / add achievement
router.post('/achievements', async (req, res) => {
  try {
    const { error, value } = unlockAchievementSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        error: 'Invalid achievement payload',
        details: error.details.map(detail => detail.message)
      });
    }

    const { playerAddress, achievementType, achievementData } = value;

    const achievement = await PlayerService.addAchievement(
      playerAddress,
      achievementType,
      achievementData || {}
    );

    res.status(201).json({
      message: 'Achievement recorded',
      achievement
    });

  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

module.exports = router;

