import api from './api';
import authAPI from './authAPI';

const NFT_BASE_URL = '/nft';

export const nftService = {
  // Create mint voucher for a caught HashMon
  async createMintVoucher(playerAddress, hashmonData) {
    try {
      console.log('🔧 NFT Service: Creating mint voucher for:', { playerAddress, hashmonData });
      console.log('🔧 NFT Service: API instance:', api);
      console.log('🔧 NFT Service: NFT_BASE_URL:', NFT_BASE_URL);
      
      const requestData = {
        playerAddress,
        hashmonData
      };
      console.log('🔧 NFT Service: Request data:', requestData);
      
      const response = await authAPI.post(`${NFT_BASE_URL}/mint-voucher`, requestData);
      
      console.log('🔧 NFT Service: Raw response:', response);
      console.log('✅ Mint voucher created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create mint voucher error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error request:', error.request);
      throw error;
    }
  },

  // Get user's HashMon NFTs
  async getUserNFTs(playerAddress) {
    try {
      console.log('Getting NFTs for player:', playerAddress);
      
      const response = await authAPI.get(`${NFT_BASE_URL}/user/${playerAddress}`);
      
      console.log('✅ User NFTs retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get user NFTs error:', error);
      throw error;
    }
  },

  // Get user's NFT count
  async getUserNFTCount(playerAddress) {
    try {
      console.log('Getting NFT count for player:', playerAddress);
      
      const response = await authAPI.get(`${NFT_BASE_URL}/count/${playerAddress}`);
      
      console.log('✅ NFT count retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get NFT count error:', error);
      throw error;
    }
  },

  // Verify NFT ownership
  async verifyOwnership(playerAddress, tokenId) {
    try {
      console.log('Verifying ownership:', { playerAddress, tokenId });
      
      const response = await authAPI.get(`${NFT_BASE_URL}/verify/${playerAddress}/${tokenId}`);
      
      console.log('✅ Ownership verification:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Verify ownership error:', error);
      throw error;
    }
  },

  // Get NFT metadata
  async getNFTMetadata(tokenId) {
    try {
      console.log('Getting NFT metadata for token:', tokenId);
      
      const response = await authAPI.get(`${NFT_BASE_URL}/metadata/${tokenId}`);
      
      console.log('✅ NFT metadata retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get NFT metadata error:', error);
      throw error;
    }
  },

  // Get blockchain status
  async getBlockchainStatus() {
    try {
      console.log('Getting blockchain status');
      
      const response = await authAPI.get(`${NFT_BASE_URL}/status`);
      
      console.log('✅ Blockchain status retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get blockchain status error:', error);
      throw error;
    }
  }
};

export default nftService;
