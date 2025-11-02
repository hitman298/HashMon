const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

const BattleEngine = require('../services/BattleEngine');
const VoucherService = require('../services/VoucherService');
const BlockchainService = require('../services/BlockchainService');
const PlayerService = require('../services/PlayerService');

// Validation schemas
const hashmonIdSchema = Joi.alternatives().try(
  Joi.number().integer().min(1),
  Joi.string().min(1).max(128)
);

const battleRequestSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  hashmonId: hashmonIdSchema.required(),
  difficulty: Joi.number().integer().min(1).max(10).default(5),
  betAmount: Joi.number().min(0).default(0)
});

const battleResultSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  hashmonId: Joi.number().integer().min(1).required(),
  result: Joi.string().valid('victory', 'defeat', 'draw').required(),
  xpGained: Joi.number().integer().min(0).required(),
  levelUp: Joi.boolean().default(false),
  newLevel: Joi.number().integer().min(1).optional()
});

// Initialize a new battle
router.post('/start', async (req, res) => {
  try {
    const { error, value } = battleRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.details[0].message 
      });
    }

    const { playerAddress, hashmonId, difficulty, betAmount } = value;
    const normalizedHashmonId = typeof hashmonId === 'number'
      ? hashmonId.toString()
      : hashmonId;

    // Get player's HashMon data with better error handling
    let playerHashmon;
    try {
      playerHashmon = await PlayerService.getPlayerHashmon(playerAddress, normalizedHashmonId);
    } catch (error) {
      console.error('Error fetching player HashMon:', error);
      // Return a more descriptive error
      return res.status(500).json({ 
        error: 'Failed to start battle', 
        details: error.message || 'Unable to fetch HashMon data. Please try again or use local storage HashMons.'
      });
    }
    
    if (!playerHashmon) {
      return res.status(404).json({ 
        error: 'HashMon not found',
        details: `No HashMon found with ID: ${normalizedHashmonId} for player: ${playerAddress}`
      });
    }

    // Create battle session
    const battleSession = {
      id: uuidv4(),
      playerAddress,
      hashmonId: normalizedHashmonId,
      playerHashmon,
      difficulty,
      betAmount,
      startTime: new Date(),
      status: 'active'
    };

    // Generate AI opponent
    const aiOpponent = BattleEngine.generateAIOpponent(difficulty, playerHashmon.level);
    
    // Add AI opponent to battle session
    battleSession.aiOpponent = aiOpponent;
    
    // Store battle session (in production, use Redis or database)
    BattleEngine.storeBattleSession(battleSession.id, battleSession);

    res.json({
      battleId: battleSession.id,
      playerHashmon: playerHashmon,
      aiOpponent: aiOpponent,
      difficulty: difficulty
    });

  } catch (error) {
    console.error('Battle start error:', error);
    res.status(500).json({ error: 'Failed to start battle' });
  }
});

// Execute battle moves and get result
router.post('/execute', async (req, res) => {
  try {
    const { battleId, playerMove, aiMove } = req.body;

    if (!battleId || !playerMove) {
      return res.status(400).json({ error: 'Missing required battle data (battleId and playerMove are required)' });
    }

    // Get battle session
    const battleSession = BattleEngine.getBattleSession(battleId);
    if (!battleSession) {
      return res.status(404).json({ error: 'Battle session not found' });
    }

    if (battleSession.status !== 'active') {
      return res.status(400).json({ error: 'Battle session is not active' });
    }

    // Select AI move based on strategy if not provided
    let selectedAIMove = aiMove;
    if (!selectedAIMove && battleSession.aiOpponent) {
      selectedAIMove = BattleEngine.selectAIMove(
        battleSession.aiOpponent,
        battleSession.playerHashmon,
        battleSession.aiOpponent.strategy || 'balanced'
      );
    }

    // Execute battle
    const battleResult = BattleEngine.executeBattleMove(
      battleSession,
      playerMove,
      selectedAIMove
    );

    // Update battle session
    battleSession.lastResult = battleResult;
    battleSession.movesCount = (battleSession.movesCount || 0) + 1;

    // Check if battle is complete
    if (battleResult.battleComplete) {
      battleSession.status = 'completed';
      battleSession.endTime = new Date();
      battleSession.finalResult = battleResult;

      // Generate voucher if player won and eligible for NFT mint
      if (battleResult.result === 'victory' && battleResult.levelUp) {
        try {
          const voucher = await VoucherService.generateMintVoucher(
            battleSession.playerAddress,
            battleSession.hashmonId,
            battleResult.newLevel || battleSession.playerHashmon.level + 1
          );

          battleResult.mintVoucher = voucher;
        } catch (voucherError) {
          console.error('Voucher generation error:', voucherError);
          // Don't fail the battle for voucher errors
        }
      }

      // Log battle to blockchain for TPS demonstration
      try {
        const normalizedHashmonId = typeof battleSession.hashmonId === 'number'
          ? battleSession.hashmonId.toString()
          : battleSession.hashmonId;
        
        await BlockchainService.logBattle(
          battleSession.playerAddress,
          normalizedHashmonId,
          battleResult.xpGained,
          battleResult.result === 'victory' ? 1 : 0
        );
      } catch (blockchainError) {
        console.error('Blockchain logging error:', blockchainError);
        // Don't fail the battle for blockchain errors
      }

      // Update player stats
      try {
        await PlayerService.updatePlayerStats(
          battleSession.playerAddress,
          battleSession.hashmonId,
          battleResult
        );
      } catch (updateError) {
        console.error('Player stats update error:', updateError);
      }

      // Log detailed battle history
      try {
        const battleDuration = battleSession.endTime 
          ? battleSession.endTime.getTime() - battleSession.startTime.getTime()
          : Date.now() - battleSession.startTime.getTime();
        
        await PlayerService.logBattle(
          battleSession.playerAddress,
          battleSession.hashmonId,
          {
            ...battleResult,
            difficulty: battleSession.difficulty,
            battleDuration: battleDuration,
            movesCount: battleSession.movesCount || 0
          }
        );
      } catch (historyError) {
        console.error('Battle history logging error:', historyError);
        // Don't fail the battle for history errors
      }
    }

    res.json({
      battleId: battleId,
      result: battleResult,
      sessionStatus: battleSession.status
    });

  } catch (error) {
    console.error('Battle execution error:', error);
    res.status(500).json({ error: 'Failed to execute battle' });
  }
});

// Get battle status
router.get('/status/:battleId', (req, res) => {
  try {
    const { battleId } = req.params;
    const battleSession = BattleEngine.getBattleSession(battleId);

    if (!battleSession) {
      return res.status(404).json({ error: 'Battle session not found' });
    }

    res.json({
      battleId: battleId,
      status: battleSession.status,
      playerHashmon: battleSession.playerHashmon,
      movesCount: battleSession.movesCount || 0,
      startTime: battleSession.startTime,
      endTime: battleSession.endTime
    });

  } catch (error) {
    console.error('Battle status error:', error);
    res.status(500).json({ error: 'Failed to get battle status' });
  }
});

// Get battle history for a player
router.get('/history/:playerAddress', async (req, res) => {
  try {
    const { playerAddress } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      return res.status(400).json({ error: 'Invalid player address' });
    }

    const history = await PlayerService.getBattleHistory(
      playerAddress, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      playerAddress,
      battles: history,
      total: history.length
    });

  } catch (error) {
    console.error('Battle history error:', error);
    res.status(500).json({ error: 'Failed to get battle history' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'wins', limit = 100 } = req.query;

    const leaderboard = await PlayerService.getLeaderboard(type, parseInt(limit));

    res.json({
      type,
      leaderboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;

