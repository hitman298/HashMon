const { ethers } = require('ethers');

class VoucherService {
  constructor() {
    try {
      if (!process.env.BACKEND_PRIVATE_KEY) {
        console.warn('⚠️ BACKEND_PRIVATE_KEY not set, voucher signing will be disabled');
        this.wallet = null;
      } else {
        this.wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY);
      }
      this.voucherExpiryHours = parseInt(process.env.VOUCHER_EXPIRY_HOURS) || 24;
    } catch (error) {
      console.error('❌ VoucherService initialization error:', error);
      this.wallet = null;
      this.voucherExpiryHours = 24;
    }
  }

  // Generate mint voucher for HashMon NFT
  async generateMintVoucher(playerAddress, hashmonId, level) {
    try {
      const nonce = Date.now() + Math.floor(Math.random() * 1000);
      const expiry = Math.floor(Date.now() / 1000) + (this.voucherExpiryHours * 3600);
      
      // Generate metadata URI (in production, upload to IPFS)
      const metadataURI = await this.generateMetadataURI(hashmonId, level);
      
      const voucher = {
        player: playerAddress,
        hashmonId: hashmonId,
        level: level,
        nonce: nonce,
        expiry: expiry,
        metadataURI: metadataURI
      };

      // Sign the voucher
      const signature = await this.signVoucher(voucher);
      
      return {
        voucher: voucher,
        signature: signature
      };
      
    } catch (error) {
      console.error('Voucher generation error:', error);
      throw new Error('Failed to generate mint voucher');
    }
  }

  // Sign voucher with backend private key
  async signVoucher(voucher) {
    try {
      if (!this.wallet) {
        throw new Error('Backend wallet not configured');
      }
      
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

      // Sign the message
      const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));
      
      return signature;
      
    } catch (error) {
      console.error('Voucher signing error:', error);
      throw new Error('Failed to sign voucher');
    }
  }

  // Generate metadata URI for HashMon NFT
  async generateMetadataURI(hashmonId, level) {
    // In production, this would upload to IPFS
    // For now, return a placeholder URI
    const metadata = {
      name: `HashMon #${hashmonId}`,
      description: `A powerful HashMon at level ${level}`,
      image: `https://hashmon-game.com/images/hashmon/${hashmonId}.png`,
      attributes: [
        {
          trait_type: "Level",
          value: level
        },
        {
          trait_type: "Rarity",
          value: this.calculateRarity(level)
        },
        {
          trait_type: "Generation",
          value: "Genesis"
        }
      ],
      external_url: `https://hashmon-game.com/hashmon/${hashmonId}`,
      animation_url: `https://hashmon-game.com/animations/hashmon/${hashmonId}.mp4`
    };

    // In production, upload to IPFS and return IPFS URI
    // For now, return a data URI
    const metadataJson = JSON.stringify(metadata, null, 2);
    const base64Metadata = Buffer.from(metadataJson).toString('base64');
    
    return `data:application/json;base64,${base64Metadata}`;
  }

  // Calculate rarity based on level
  calculateRarity(level) {
    if (level >= 80) return 'Legendary';
    if (level >= 60) return 'Epic';
    if (level >= 40) return 'Rare';
    if (level >= 20) return 'Uncommon';
    return 'Common';
  }

  // Verify voucher signature (for testing)
  async verifyVoucher(voucher, signature) {
    try {
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

      const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      return recoveredAddress.toLowerCase() === this.wallet.address.toLowerCase();
      
    } catch (error) {
      console.error('Voucher verification error:', error);
      return false;
    }
  }

  // Get backend wallet address
  getWalletAddress() {
    return this.wallet.address;
  }

  // Generate battle completion voucher
  async generateBattleVoucher(playerAddress, hashmonId, battleResult) {
    try {
      const voucher = {
        player: playerAddress,
        hashmonId: hashmonId,
        battleResult: battleResult,
        timestamp: Date.now(),
        nonce: Date.now() + Math.floor(Math.random() * 1000)
      };

      const signature = await this.signBattleVoucher(voucher);
      
      return {
        voucher: voucher,
        signature: signature
      };
      
    } catch (error) {
      console.error('Battle voucher generation error:', error);
      throw new Error('Failed to generate battle voucher');
    }
  }

  // Sign battle voucher
  async signBattleVoucher(voucher) {
    try {
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'uint256', 'string', 'uint256', 'uint256'],
          [
            voucher.player,
            voucher.hashmonId,
            voucher.battleResult,
            voucher.timestamp,
            voucher.nonce
          ]
        )
      );

      const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));
      return signature;
      
    } catch (error) {
      console.error('Battle voucher signing error:', error);
      throw new Error('Failed to sign battle voucher');
    }
  }

  // Create achievement voucher
  async generateAchievementVoucher(playerAddress, achievementType, achievementData) {
    try {
      const voucher = {
        player: playerAddress,
        achievementType: achievementType,
        achievementData: achievementData,
        timestamp: Date.now(),
        nonce: Date.now() + Math.floor(Math.random() * 1000),
        expiry: Math.floor(Date.now() / 1000) + (this.voucherExpiryHours * 3600)
      };

      const signature = await this.signAchievementVoucher(voucher);
      
      return {
        voucher: voucher,
        signature: signature
      };
      
    } catch (error) {
      console.error('Achievement voucher generation error:', error);
      throw new Error('Failed to generate achievement voucher');
    }
  }

  // Sign achievement voucher
  async signAchievementVoucher(voucher) {
    try {
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'string', 'string', 'uint256', 'uint256', 'uint256'],
          [
            voucher.player,
            voucher.achievementType,
            voucher.achievementData,
            voucher.timestamp,
            voucher.nonce,
            voucher.expiry
          ]
        )
      );

      const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));
      return signature;
      
    } catch (error) {
      console.error('Achievement voucher signing error:', error);
      throw new Error('Failed to sign achievement voucher');
    }
  }
}

// Singleton instance
const voucherService = new VoucherService();

module.exports = voucherService;

