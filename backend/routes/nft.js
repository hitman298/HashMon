const express = require('express');
const Joi = require('joi');
const router = express.Router();

const BlockchainService = require('../services/BlockchainService');

// Validation schemas
const mintNFTRequestSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  hashmonData: Joi.object({
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    name: Joi.string().required(),
    level: Joi.number().integer().min(1).required(),
    experience: Joi.number().integer().min(0).required(),
    stats: Joi.object({
      hp: Joi.number().integer().min(1).required(),
      attack: Joi.number().integer().min(1).required(),
      defense: Joi.number().integer().min(1).required(),
      speed: Joi.number().integer().min(1).required()
    }).required(),
    type: Joi.string().required(),
    rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic').required(),
    isShiny: Joi.boolean().optional(),
    caughtAt: Joi.number().integer().optional(),
    experienceToNext: Joi.number().integer().min(0).optional(),
    maxStats: Joi.object({
      hp: Joi.number().integer().min(1).optional(),
      attack: Joi.number().integer().min(1).optional(),
      defense: Joi.number().integer().min(1).optional(),
      speed: Joi.number().integer().min(1).optional()
    }).optional(),
    moves: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      power: Joi.number().integer().min(0).required(),
      accuracy: Joi.number().integer().min(0).max(100).required()
    })).optional()
  }).required()
});

const getUserNFTsRequestSchema = Joi.object({
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

// Create mint voucher for NFT
router.post('/mint-voucher', async (req, res) => {
  try {
    console.log('Creating mint voucher for:', req.body);
    
    const { error, value } = mintNFTRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { playerAddress, hashmonData } = value;

    // Create mint voucher using blockchain service
    const mintData = await BlockchainService.createMintVoucher(playerAddress, hashmonData);
    
    console.log('✅ Mint voucher created successfully');
    
    // Return response with mock flag
    res.json({
      success: true,
      voucher: mintData.voucher,
      hashmonData: mintData.hashmonData,
      signature: mintData.signature,
      nonce: mintData.nonce,
      isMock: mintData.isMock || false,
      message: mintData.isMock 
        ? 'Demo mint voucher created (blockchain not configured)' 
        : 'Mint voucher created successfully. Use this data to mint your NFT.'
    });

  } catch (error) {
    console.error('❌ Create mint voucher error:', error);
    res.status(500).json({ 
      error: 'Failed to create mint voucher',
      details: error.message 
    });
  }
});

// Get user's HashMon NFTs
router.get('/user/:playerAddress', async (req, res) => {
  try {
    console.log('Getting NFTs for player:', req.params.playerAddress);
    
    const { error, value } = getUserNFTsRequestSchema.validate({
      playerAddress: req.params.playerAddress
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { playerAddress } = value;

    // Get user's NFTs from blockchain
    const userNFTs = await BlockchainService.getUserHashMons(playerAddress);
    
    console.log(`✅ Retrieved ${userNFTs.length} NFTs for player`);
    res.json({
      success: true,
      playerAddress,
      nftCount: userNFTs.length,
      nfts: userNFTs
    });

  } catch (error) {
    console.error('❌ Get user NFTs error:', error);
    res.status(500).json({ 
      error: 'Failed to get user NFTs',
      details: error.message 
    });
  }
});

// Get user's NFT count
router.get('/count/:playerAddress', async (req, res) => {
  try {
    console.log('Getting NFT count for player:', req.params.playerAddress);
    
    const { error, value } = getUserNFTsRequestSchema.validate({
      playerAddress: req.params.playerAddress
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { playerAddress } = value;

    // Get user's NFT count from blockchain
    const nftCount = await BlockchainService.getUserNFTCount(playerAddress);
    
    console.log(`✅ Player has ${nftCount} NFTs`);
    res.json({
      success: true,
      playerAddress,
      nftCount
    });

  } catch (error) {
    console.error('❌ Get NFT count error:', error);
    res.status(500).json({ 
      error: 'Failed to get NFT count',
      details: error.message 
    });
  }
});

// Verify NFT ownership
router.get('/verify/:playerAddress/:tokenId', async (req, res) => {
  try {
    console.log('Verifying ownership for:', req.params);
    
    const { playerAddress, tokenId } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      return res.status(400).json({ error: 'Invalid player address format' });
    }
    
    if (!/^\d+$/.test(tokenId)) {
      return res.status(400).json({ error: 'Invalid token ID format' });
    }

    // Verify ownership on blockchain
    const isOwner = await BlockchainService.verifyHashMonOwnership(playerAddress, tokenId);
    
    console.log(`✅ Ownership verification result: ${isOwner}`);
    res.json({
      success: true,
      playerAddress,
      tokenId,
      isOwner
    });

  } catch (error) {
    console.error('❌ Verify ownership error:', error);
    res.status(500).json({ 
      error: 'Failed to verify ownership',
      details: error.message 
    });
  }
});

// Get NFT metadata (ERC-721 standard format)
// Supports both /metadata/token/{tokenId} and /metadata/{tokenId}
router.get('/metadata/token/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    return await handleMetadataRequest(req, res, tokenId);
  } catch (error) {
    console.error('❌ Get metadata error:', error);
    res.status(500).json({ 
      error: 'Failed to get NFT metadata',
      details: error.message 
    });
  }
});

router.get('/metadata/:tokenId', async (req, res) => {
  try {
    let { tokenId } = req.params;
    
    // If tokenId is numeric, treat as tokenId
    if (/^\d+$/.test(tokenId)) {
      return await handleMetadataRequest(req, res, tokenId);
    }
    
    // Otherwise, try to find tokenId by hashmonId (for backward compatibility)
    // This is a fallback - should primarily use tokenId
    return res.status(400).json({ 
      error: 'Invalid token ID format. Use /metadata/token/{tokenId} with numeric tokenId' 
    });
  } catch (error) {
    console.error('❌ Get metadata error:', error);
    res.status(500).json({ 
      error: 'Failed to get NFT metadata',
      details: error.message 
    });
  }
});

// Helper function to handle metadata request
async function handleMetadataRequest(req, res, tokenId) {
  console.log('Getting metadata for token:', tokenId);
  
  if (!/^\d+$/.test(tokenId)) {
    return res.status(400).json({ error: 'Invalid token ID format' });
  }

  // Get NFT data from blockchain using tokenId
  // The contract stores hashmonData[tokenId], so we query by tokenId
  const hashmonData = await BlockchainService.getHashMonData(tokenId);
  
  if (!hashmonData) {
    console.error('❌ HashMon data not found for tokenId:', tokenId);
    return res.status(404).json({ error: 'NFT not found for tokenId: ' + tokenId });
  }
  
  console.log('✅ Retrieved hashmonData:', hashmonData);
    
  // Format as ERC-721 metadata standard
  const metadata = {
    name: `#${String(tokenId).padStart(3, '0')} ${hashmonData.name}`,
    description: `A powerful ${hashmonData.type1} type HashMon at level ${hashmonData.level}. ${hashmonData.name} is a ${getRarityName(hashmonData.rarity)} creature with impressive stats.`,
    image: `https://hashmon-game.com/images/hashmon/${tokenId}.png`,
    external_url: `https://hashmon-game.com/nft/${tokenId}`,
    attributes: [
      {
        trait_type: "Token ID",
        value: tokenId,
        display_type: "number"
      },
      {
        trait_type: "Level",
        value: Number(hashmonData.level),
        display_type: "number"
      },
      {
        trait_type: "XP",
        value: Number(hashmonData.xp),
        display_type: "number"
      },
      {
        trait_type: "Type",
        value: hashmonData.type1
      },
      {
        trait_type: "Secondary Type",
        value: hashmonData.type2 || "None"
      },
      {
        trait_type: "Rarity",
        value: getRarityName(hashmonData.rarity)
      },
      {
        trait_type: "HP",
        value: Number(hashmonData.hp),
        display_type: "number"
      },
      {
        trait_type: "Attack",
        value: Number(hashmonData.attack),
        display_type: "number"
      },
      {
        trait_type: "Defense",
        value: Number(hashmonData.defense),
        display_type: "number"
      },
      {
        trait_type: "Speed",
        value: Number(hashmonData.speed),
        display_type: "number"
      },
      {
        trait_type: "Created At",
        value: Number(hashmonData.createdAt),
        display_type: "date"
      }
    ],
    properties: {
      hashmonId: hashmonData.id.toString(),
      name: hashmonData.name,
      level: Number(hashmonData.level),
      xp: Number(hashmonData.xp),
      stats: {
        hp: Number(hashmonData.hp),
        attack: Number(hashmonData.attack),
        defense: Number(hashmonData.defense),
        speed: Number(hashmonData.speed)
      },
      type1: hashmonData.type1,
      type2: hashmonData.type2 || "",
      rarity: Number(hashmonData.rarity),
      createdAt: Number(hashmonData.createdAt)
    }
  };
  
  console.log('✅ NFT metadata retrieved for token:', tokenId);
  
  // Set proper content type for ERC-721 metadata
  res.setHeader('Content-Type', 'application/json');
  res.json(metadata);
}

// Helper function to convert rarity number to name
function getRarityName(rarity) {
  const rarityMap = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
    6: 'Mythic'
  };
  return rarityMap[Number(rarity)] || 'Common';
}

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    console.log('Getting blockchain status');
    
    const healthCheck = await BlockchainService.healthCheck();
    
    res.json({
      success: true,
      blockchain: healthCheck
    });

  } catch (error) {
    console.error('❌ Get blockchain status error:', error);
    res.status(500).json({ 
      error: 'Failed to get blockchain status',
      details: error.message 
    });
  }
});

module.exports = router;
