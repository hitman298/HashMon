const { ethers } = require('ethers');
const crypto = require('crypto');
const Web3StorageService = require('./Web3StorageService');

class BlockchainService {
  constructor() {
    try {
      // Initialize provider with error handling
      if (!process.env.PHAROS_RPC_URL) {
        console.warn('⚠️ PHAROS_RPC_URL not set, blockchain features will be limited');
        this.provider = null;
      } else {
        this.provider = new ethers.JsonRpcProvider(process.env.PHAROS_RPC_URL);
      }

      // Initialize wallet with error handling
      if (!process.env.BACKEND_PRIVATE_KEY) {
        console.warn('⚠️ BACKEND_PRIVATE_KEY not set, NFT minting will be disabled');
        this.wallet = null;
      } else {
        this.wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, this.provider);
        console.log('✅ Backend wallet initialized:', this.wallet.address);
      }

      this.contractAddress = process.env.HASHMON_CONTRACT_ADDRESS;
      this.contract = null;
      this.recentTransactions = [];
      
      if (this.contractAddress && this.wallet) {
        this.initializeContract();
      } else {
        console.warn('⚠️ Contract address or wallet not configured, NFT features disabled');
      }
    } catch (error) {
      console.error('❌ Blockchain service initialization error:', error);
      this.provider = null;
      this.wallet = null;
      this.contract = null;
    }
  }

  // Initialize contract connection
  initializeContract() {
    try {
      const contractABI = this.getContractABI();
      this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);
      console.log(`✅ Connected to HashMon contract at ${this.contractAddress}`);
    } catch (error) {
      console.error('❌ Failed to initialize contract:', error);
    }
  }

  // Get contract ABI (simplified version)
  getContractABI() {
    return [
      "function logBattle(address player, uint256 hashmonId, uint256 xp, uint256 result) external",
      "function updateHashMonStats(uint256 tokenId, uint256 newLevel, uint256 newXp, uint256 newHp, uint256 newAttack, uint256 newDefense, uint256 newSpeed) external",
      "function getBattleLogsCount() external view returns (uint256)",
      "function getRecentBattleLogs(uint256 count) external view returns (tuple(address player, uint256 hashmonId, uint256 xp, uint256 result, uint256 timestamp)[])",
      "function getHashMon(uint256 tokenId) external view returns (tuple(uint256 id, string name, uint256 level, uint256 xp, uint256 hp, uint256 attack, uint256 defense, uint256 speed, string type1, string type2, uint256 rarity, uint256 createdAt))",
      "function mintWithVoucher(tuple(address player, uint256 hashmonId, uint256 level, uint256 nonce, uint256 expiry, string metadataURI) voucher, tuple(uint256 id, string name, uint256 level, uint256 xp, uint256 hp, uint256 attack, uint256 defense, uint256 speed, string type1, string type2, uint256 rarity, uint256 createdAt) hashmon, bytes signature) external",
      "function totalSupply() external view returns (uint256)",
      "function tokenByIndex(uint256 index) external view returns (uint256)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
      "event BattleLogged(address indexed player, uint256 indexed hashmonId, uint256 battleId)",
      "event HashMonMinted(address indexed to, uint256 indexed tokenId, tuple(uint256 id, string name, uint256 level, uint256 xp, uint256 hp, uint256 attack, uint256 defense, uint256 speed, string type1, string type2, uint256 rarity, uint256 createdAt) hashmon)"
    ];
  }

  // Log battle result to blockchain
  async logBattle(playerAddress, hashmonId, xp, result) {
    try {
      if (!this.contract) {
        console.warn('⚠️ Contract not initialized, skipping blockchain logging');
        this.recordTransaction({
          type: 'battle',
          status: 'mock',
          player: playerAddress,
          hashmonId: String(hashmonId),
          xp: Number(xp || 0),
          result
        });
        return null;
      }

      const tx = await this.contract.logBattle(
        playerAddress,
        hashmonId,
        xp,
        result,
        {
          gasLimit: 100000 // Reasonable gas limit
        }
      );

      console.log(`📊 Battle logged to blockchain: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();

      this.recordTransaction({
        type: 'battle',
        status: 'on-chain',
        player: playerAddress,
        hashmonId: String(hashmonId),
        xp: Number(xp || 0),
        result,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      });
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Failed to log battle to blockchain:', error);

      this.recordTransaction({
        type: 'battle',
        status: 'error',
        player: playerAddress,
        hashmonId: String(hashmonId),
        xp: Number(xp || 0),
        result,
        error: error.message
      });

      // Don't throw error to avoid breaking the game flow
      return null;
    }
  }

  // Update HashMon stats on blockchain
  async updateHashMonStats(tokenId, newLevel, newXp, newHp, newAttack, newDefense, newSpeed) {
    try {
      if (!this.contract) {
        console.warn('⚠️ Contract not initialized, skipping stats update');
        return null;
      }

      const tx = await this.contract.updateHashMonStats(
        tokenId,
        newLevel,
        newXp,
        newHp,
        newAttack,
        newDefense,
        newSpeed,
        {
          gasLimit: 150000
        }
      );

      console.log(`📈 HashMon stats updated: ${tx.hash}`);
      
      const receipt = await tx.wait();

      this.recordTransaction({
        type: 'update-stats',
        status: 'on-chain',
        tokenId: String(tokenId),
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        data: {
          newLevel,
          newXp,
          newHp,
          newAttack,
          newDefense,
          newSpeed
        }
      });
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Failed to update HashMon stats:', error);

      this.recordTransaction({
        type: 'update-stats',
        status: 'error',
        tokenId: String(tokenId),
        data: {
          newLevel,
          newXp,
          newHp,
          newAttack,
          newDefense,
          newSpeed
        },
        error: error.message
      });
      return null;
    }
  }

  // Get battle logs count
  async getBattleLogsCount() {
    try {
      if (!this.contract) {
        return 0;
      }

      const count = await this.contract.getBattleLogsCount();
      return count.toString();

    } catch (error) {
      console.error('❌ Failed to get battle logs count:', error);
      return 0;
    }
  }

  // Get recent battle logs
  async getRecentBattleLogs(count = 10) {
    try {
      if (!this.contract) {
        return [];
      }

      const logs = await this.contract.getRecentBattleLogs(count);
      
      return logs.map(log => ({
        player: log.player,
        hashmonId: log.hashmonId.toString(),
        xp: log.xp.toString(),
        result: log.result.toString(),
        timestamp: log.timestamp.toString()
      }));

    } catch (error) {
      console.error('❌ Failed to get recent battle logs:', error);
      return [];
    }
  }

  // Get HashMon data from blockchain
  async getHashMonData(tokenId) {
    try {
      if (!this.contract) {
        return null;
      }

      const hashmonData = await this.contract.getHashMon(tokenId);
      
      return {
        id: hashmonData.id.toString(),
        name: hashmonData.name,
        level: hashmonData.level.toString(),
        xp: hashmonData.xp.toString(),
        hp: hashmonData.hp.toString(),
        attack: hashmonData.attack.toString(),
        defense: hashmonData.defense.toString(),
        speed: hashmonData.speed.toString(),
        type1: hashmonData.type1,
        type2: hashmonData.type2,
        rarity: hashmonData.rarity.toString(),
        createdAt: hashmonData.createdAt.toString()
      };

    } catch (error) {
      console.error('❌ Failed to get HashMon data:', error);
      return null;
    }
  }

  // Generate a unique nonce for minting
  generateNonce() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Convert rarity string to numeric value
  getRarityValue(rarity) {
    const rarityMap = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'epic': 4,
      'legendary': 5,
      'mythic': 6
    };
    return rarityMap[rarity.toLowerCase()] || 1;
  }

  // Create mint voucher for HashMon NFT
  async createMintVoucher(playerAddress, hashmonData) {
    try {
      console.log('🔧 Creating mint voucher for:', { playerAddress, hashmonData });
      
      // Check if blockchain service is configured
      if (!this.wallet) {
        console.warn('⚠️ Backend wallet not configured, returning mock voucher');
        return this.createMockVoucher(playerAddress, hashmonData);
      }

      if (!this.contract) {
        console.warn('⚠️ Contract not configured, returning mock voucher');
        return this.createMockVoucher(playerAddress, hashmonData);
      }

      // Generate unique nonce (numeric)
      const nonceValue = Date.now() + Math.floor(Math.random() * 1000000);
      
      // Convert hashmonId to a number (handle string IDs)
      let hashmonIdNumeric;
      if (typeof hashmonData.id === 'string') {
        // Convert string ID to numeric hash
        const hashBytes = ethers.toUtf8Bytes(hashmonData.id);
        const hash = ethers.keccak256(hashBytes);
        // Convert first 8 bytes of hash to number (safe for uint256)
        hashmonIdNumeric = BigInt(hash).toString();
        // Limit to reasonable size (max uint256 is ~78 digits)
        hashmonIdNumeric = hashmonIdNumeric.slice(0, 20);
      } else {
        hashmonIdNumeric = hashmonData.id ? BigInt(hashmonData.id).toString() : Date.now().toString();
      }
      
      // Upload metadata to IPFS via Storacha (formerly Web3.Storage)
      let metadataURI;
      
      // Try Storacha (FREE, reliable)
      if (Web3StorageService.isReady()) {
        try {
          console.log('📤 Uploading HashMon metadata to IPFS via Storacha...');
          const ipfsResult = await Web3StorageService.uploadHashMonMetadata(hashmonData);
          metadataURI = `ipfs://${ipfsResult.cid}`;
          console.log(`✅ Metadata uploaded to IPFS: ${metadataURI}`);
          console.log(`   Gateway URL: ${ipfsResult.url}`);
        } catch (ipfsError) {
          console.warn('⚠️ Storacha upload failed, using API endpoint fallback:', ipfsError.message);
          metadataURI = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/nft/metadata/0`;
        }
      } else {
        // Fallback: Use API endpoint for metadata
        // Note: We can't know the tokenId beforehand (it's assigned during minting)
        // So we use a pattern that the metadata endpoint can resolve
        // Format: /api/nft/metadata/{tokenId} - endpoint looks up by tokenId
        metadataURI = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/nft/metadata/0`;
        console.log('ℹ️ Storacha not configured, using API endpoint for metadata');
        console.log('   Setup Storacha: See STORACHA_SETUP.md');
      }
      const voucher = {
        player: playerAddress,
        hashmonId: hashmonIdNumeric,
        level: Number(hashmonData.level) || 1,
        nonce: nonceValue,
        expiry: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        metadataURI: metadataURI
      };

      // Create HashMon data for contract
      const contractHashmonData = {
        id: BigInt(voucher.hashmonId),
        name: hashmonData.name || 'Unknown HashMon',
        level: Number(hashmonData.level) || 1,
        xp: Number(hashmonData.experience || 0),
        hp: Number(hashmonData.stats?.hp || 50),
        attack: Number(hashmonData.stats?.attack || 50),
        defense: Number(hashmonData.stats?.defense || 50),
        speed: Number(hashmonData.stats?.speed || 50),
        type1: hashmonData.type || 'Normal',
        type2: hashmonData.rarity || 'common',
        rarity: this.getRarityValue(hashmonData.rarity),
        createdAt: Math.floor(Date.now() / 1000)
      };
      
      // For JSON serialization, convert BigInt id to string
      const contractHashmonDataSerializable = {
        ...contractHashmonData,
        id: contractHashmonData.id.toString()
      };

      // Sign the voucher
      // IMPORTANT: Contract uses abi.encodePacked, so we must match it exactly
      // Use solidityPacked to match abi.encodePacked behavior
      const packedData = ethers.solidityPacked(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'string'],
        [
          voucher.player, 
          BigInt(voucher.hashmonId), 
          BigInt(voucher.level), 
          BigInt(voucher.nonce), 
          BigInt(voucher.expiry), 
          voucher.metadataURI
        ]
      );
      const messageHash = ethers.keccak256(packedData);

      const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));

      console.log('✅ Mint voucher created successfully');
      this.recordTransaction({
        type: 'mint-voucher',
        status: 'ready',
        player: playerAddress,
        hashmonId: String(contractHashmonData.id),
        level: contractHashmonData.level,
        metadataURI: voucher.metadataURI,
        nonce: voucher.nonce
      });
      return {
        voucher,
        hashmonData: contractHashmonDataSerializable,
        signature,
        nonce: nonceValue.toString(),
        isMock: false
      };
    } catch (error) {
      console.error('❌ Create mint voucher error:', error);
      console.log('🔄 Falling back to mock voucher');
      return this.createMockVoucher(playerAddress, hashmonData);
    }
  }

  // Create mock voucher when blockchain is not configured
  createMockVoucher(playerAddress, hashmonData) {
    const nonce = this.generateNonce();
    const timestamp = Date.now();
    
    const mockVoucher = {
      voucher: {
        player: playerAddress,
        hashmonId: hashmonData.id || timestamp,
        level: hashmonData.level,
        nonce: `mock_${nonce}`,
        expiry: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        metadataURI: `mock://api.hashmon.com/metadata/${hashmonData.id}`
      },
      hashmonData: {
        id: hashmonData.id || timestamp,
        name: hashmonData.name,
        level: hashmonData.level,
        xp: hashmonData.experience || 0,
        hp: hashmonData.stats.hp,
        attack: hashmonData.stats.attack,
        defense: hashmonData.stats.defense,
        speed: hashmonData.stats.speed,
        type1: hashmonData.type,
        type2: hashmonData.rarity,
        rarity: this.getRarityValue(hashmonData.rarity),
        createdAt: Math.floor(Date.now() / 1000)
      },
      signature: `mock_signature_${nonce}`,
      nonce,
      isMock: true
    };

    this.recordTransaction({
      type: 'mint-voucher',
      status: 'mock',
      player: playerAddress,
      hashmonId: String(mockVoucher.hashmonData.id),
      level: mockVoucher.hashmonData.level,
      metadataURI: mockVoucher.voucher.metadataURI,
      nonce: mockVoucher.nonce
    });

    return mockVoucher;
  }

  // Get user's HashMon NFTs
  async getUserHashMons(userAddress) {
    try {
      if (!this.contract) {
        console.warn('⚠️ Contract not initialized, returning empty NFT list');
        return [];
      }

      // Get user's token balance
      const balance = await this.contract.balanceOf(userAddress);
      
      if (balance === 0) {
        return [];
      }

      // Get all tokens owned by user
      const userTokens = [];
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contract.tokenOfOwnerByIndex(userAddress, i);
          const hashmonData = await this.contract.getHashMon(tokenId);
          
          userTokens.push({
            tokenId: tokenId.toString(),
            id: hashmonData.id.toString(),
            name: hashmonData.name,
            level: hashmonData.level.toString(),
            xp: hashmonData.xp.toString(),
            hp: hashmonData.hp.toString(),
            attack: hashmonData.attack.toString(),
            defense: hashmonData.defense.toString(),
            speed: hashmonData.speed.toString(),
            stats: {
              hp: hashmonData.hp.toString(),
              attack: hashmonData.attack.toString(),
              defense: hashmonData.defense.toString(),
              speed: hashmonData.speed.toString()
            },
            type1: hashmonData.type1,
            type2: hashmonData.type2 || 'common',
            type: hashmonData.type1, // For backward compatibility
            rarity: hashmonData.type2 || 'common', // For backward compatibility
            rarityValue: hashmonData.rarity.toString(),
            createdAt: hashmonData.createdAt.toString()
          });
        } catch (error) {
          console.warn('⚠️ Failed to get token data for index:', i);
          continue;
        }
      }

      return userTokens;
    } catch (error) {
      console.error('❌ Get user HashMons error:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Verify HashMon ownership
  async verifyHashMonOwnership(userAddress, tokenId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const owner = await this.contract.ownerOf(tokenId);
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('❌ Verify ownership error:', error);
      return false;
    }
  }

  // Get user's NFT count
  async getUserNFTCount(userAddress) {
    try {
      if (!this.contract) {
        return 0;
      }

      const balance = await this.contract.balanceOf(userAddress);
      return parseInt(balance.toString());
    } catch (error) {
      console.error('❌ Get user NFT count error:', error);
      return 0;
    }
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      // Use feeData instead of getGasPrice for newer ethers versions
      let gasPrice = "1000000000"; // Default gas price
      try {
        const feeData = await this.provider.getFeeData();
        gasPrice = feeData.gasPrice?.toString() || "1000000000";
      } catch (feeError) {
        console.warn('Could not get fee data, using default gas price');
      }
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber: blockNumber.toString(),
        gasPrice: gasPrice,
        rpcUrl: process.env.PHAROS_RPC_URL
      };

    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      // Return default network info if connection fails
      return {
        chainId: "688688",
        name: "Pharos Testnet",
        blockNumber: "0",
        gasPrice: "1000000000",
        rpcUrl: process.env.PHAROS_RPC_URL || "https://testnet.dplabs-internal.com"
      };
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);

    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error);
      return '0';
    }
  }

  // Estimate gas for transaction
  async estimateGas(methodName, ...args) {
    try {
      if (!this.contract) {
        return null;
      }

      const gasEstimate = await this.contract[methodName].estimateGas(...args);
      return gasEstimate.toString();

    } catch (error) {
      console.error(`❌ Failed to estimate gas for ${methodName}:`, error);
      return null;
    }
  }

  // Get transaction history for address
  async getTransactionHistory(address, limit = 50) {
    const normalizedAddress = address ? address.toLowerCase() : null;
    const history = this.recentTransactions || [];

    const filtered = normalizedAddress
      ? history.filter((entry) =>
          (entry.player && entry.player.toLowerCase() === normalizedAddress) ||
          (entry.to && entry.to.toLowerCase() === normalizedAddress)
        )
      : history;

    return filtered.slice(0, limit);
  }

  // Monitor contract events
  async startEventMonitoring() {
    try {
      if (!this.contract) {
        console.warn('⚠️ Contract not initialized, cannot monitor events');
        return;
      }

      // Monitor BattleLogged events
      this.contract.on('BattleLogged', (player, hashmonId, battleId, event) => {
        console.log(`🎮 Battle logged event:`, {
          player,
          hashmonId: hashmonId.toString(),
          battleId: battleId.toString(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });

      // Monitor HashMonMinted events
      this.contract.on('HashMonMinted', (to, tokenId, hashmon, event) => {
        console.log(`🎁 HashMon minted event:`, {
          to,
          tokenId: tokenId.toString(),
          hashmon: {
            name: hashmon.name,
            level: hashmon.level.toString(),
            rarity: hashmon.rarity.toString()
          },
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });

      console.log('👂 Started monitoring contract events');

    } catch (error) {
      console.error('❌ Failed to start event monitoring:', error);
    }
  }

  // Stop event monitoring
  stopEventMonitoring() {
    try {
      if (this.contract) {
        this.contract.removeAllListeners();
        console.log('🔇 Stopped monitoring contract events');
      }
    } catch (error) {
      console.error('❌ Failed to stop event monitoring:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const networkInfo = await this.getNetworkInfo();
      const balance = await this.getWalletBalance();
      const battleLogsCount = await this.getBattleLogsCount();

      return {
        status: 'healthy',
        network: networkInfo,
        walletBalance: balance,
        battleLogsCount: battleLogsCount,
        contractAddress: this.contractAddress,
        walletAddress: this.wallet.address
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        contractAddress: this.contractAddress,
        walletAddress: this.wallet?.address || 'unknown'
      };
    }
  }

  recordTransaction(entry) {
    try {
      const transaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
        timestamp: new Date().toISOString(),
        ...entry
      };

      this.recentTransactions.unshift(transaction);
      this.recentTransactions = this.recentTransactions.slice(0, 200);
    } catch (error) {
      console.warn('⚠️ Failed to record transaction:', error.message);
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
