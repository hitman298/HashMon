import axios from 'axios'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Log API configuration for debugging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  env: import.meta.env.MODE
})

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url
    })
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred'
      throw new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      throw new Error(`Network error. Cannot reach backend at ${apiUrl}. Please check your connection and backend URL.`)
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// Game API
export const gameAPI = {
  // Health check
  async healthCheck() {
    return api.get('/health').then(response => response.data)
  },

  // Network info
  async getNetworkInfo() {
    return api.get('/blockchain/network').then(response => response.data)
  },

  // Player endpoints
  async getPlayerStats(playerAddress) {
    return api.get(`/player/stats/${playerAddress}`).then(response => response.data)
  },

  async getPlayerHashmons(playerAddress) {
    return api.get(`/player/hashmons/${playerAddress}`).then(response => response.data)
  },

  async getPlayerBattleHistory(playerAddress, limit = 20, offset = 0) {
    return api.get(`/player/battles/${playerAddress}`, {
      params: { limit, offset }
    }).then(response => response.data)
  },

  async createStarterHashmon(playerAddress, starterType = 'fire') {
    return api.post('/player/starter', {
      playerAddress,
      starterType
    }).then(response => response.data)
  },

  // Battle endpoints
  async startBattle(playerAddress, hashmonId, difficulty = 5) {
    return api.post('/battle/start', {
      playerAddress,
      hashmonId,
      difficulty
    }).then(response => response.data)
  },

  async executeBattleMove(battleId, playerMove, aiMove) {
    return api.post('/battle/execute', {
      battleId,
      playerMove,
      aiMove
    }).then(response => response.data)
  },

  async getBattleStatus(battleId) {
    return api.get(`/battle/status/${battleId}`).then(response => response.data)
  },

  async getBattleHistory(playerAddress, limit = 20, offset = 0) {
    return api.get(`/battle/history/${playerAddress}`, {
      params: { limit, offset }
    }).then(response => response.data)
  },

  // HashMon endpoints
  async getHashmonData(tokenId) {
    return api.get(`/hashmon/${tokenId}`).then(response => response.data)
  },

  async updateHashmonStats(tokenId, stats) {
    return api.put(`/hashmon/${tokenId}/stats`, stats).then(response => response.data)
  },

  // Leaderboard
  async getLeaderboard(type = 'wins', limit = 100) {
    return api.get('/battle/leaderboard', {
      params: { type, limit }
    }).then(response => response.data)
  },

  // Blockchain endpoints
  async getBlockchainStats() {
    return api.get('/blockchain/stats').then(response => response.data)
  },

  async getRecentTransactions(limit = 10, address) {
    return api.get('/blockchain/transactions', {
      params: { limit, address }
    }).then(response => response.data)
  },

  async getBattleLogs(limit = 10) {
    return api.get('/blockchain/battle-logs', {
      params: { limit }
    }).then(response => response.data)
  },

  // NFT endpoints
  async mintHashmonNFT(playerAddress, hashmonData) {
    return api.post('/nft/mint-voucher', {
      playerAddress,
      hashmonData
    }).then(response => response.data)
  },

  async getNFTMetadata(tokenId) {
    return api.get(`/nft/metadata/${tokenId}`).then(response => response.data)
  },

  // Achievements
  async getPlayerAchievements(playerAddress) {
    return api.get(`/player/achievements/${playerAddress}`).then(response => response.data)
  },

  async unlockAchievement(playerAddress, achievementType, achievementData) {
    return api.post('/player/achievements', {
      playerAddress,
      achievementType,
      achievementData
    }).then(response => response.data)
  }
}

// Blockchain service for direct contract interaction
export const blockchainAPI = {
  // Contract addresses (will be set after deployment)
  HASHMON_CONTRACT_ADDRESS: import.meta.env.VITE_HASHMON_CONTRACT_ADDRESS,
  
  // Contract ABI (simplified)
  HASHMON_ABI: [
    "function mintWithVoucher((address,uint256,uint256,uint256,uint256,string),(uint256,string,uint256,uint256,uint256,uint256,uint256,string,string,uint256,uint256),bytes) external",
    "function logBattle(address,uint256,uint256,uint256) external",
    "function updateHashMonStats(uint256,uint256,uint256,uint256,uint256,uint256,uint256) external",
    "function getHashMon(uint256) external view returns (tuple(uint256,string,uint256,uint256,uint256,uint256,uint256,string,string,uint256,uint256))",
    "function getBattleLogsCount() external view returns (uint256)",
    "function getRecentBattleLogs(uint256) external view returns (tuple(address,uint256,uint256,uint256,uint256)[])",
    "function ownerOf(uint256) external view returns (address)",
    "function tokenURI(uint256) external view returns (string)",
    "event HashMonMinted(address indexed,uint256 indexed,tuple)",
    "event BattleLogged(address indexed,uint256 indexed,uint256)",
    "event VoucherUsed(address indexed,uint256 indexed,uint256)"
  ],

  // Network configurations
  NETWORKS: {
    testnet: {
      chainId: 688688,
      name: 'Pharos Testnet',
      rpcUrl: 'https://testnet.dplabs-internal.com',
      explorerUrl: 'https://testnet.pharosscan.xyz'
    },
    atlantic: {
      chainId: 688689,
      name: 'Pharos Atlantic Testnet',
      rpcUrl: 'https://atlantic.dplabs-internal.com',
      explorerUrl: 'https://pharos-atlantic-testnet.socialscan.io'
    }
  }
}

// Utility functions
export const utils = {
  // Format address
  formatAddress: (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },

  // Format balance
  formatBalance: (balance, decimals = 4) => {
    const num = parseFloat(balance)
    if (num < 0.001) {
      return num.toExponential(2)
    }
    return num.toFixed(decimals)
  },

  // Get explorer URL
  getExplorerUrl: (hash, network = 'testnet') => {
    const networkConfig = blockchainAPI.NETWORKS[network]
    if (!networkConfig) return ''
    return `${networkConfig.explorerUrl}/tx/${hash}`
  },

  // Get token explorer URL
  getTokenExplorerUrl: (tokenId, network = 'testnet') => {
    const networkConfig = blockchainAPI.NETWORKS[network]
    if (!networkConfig) return ''
    return `${networkConfig.explorerUrl}/token/${blockchainAPI.HASHMON_CONTRACT_ADDRESS}/${tokenId}`
  },

  // Generate random ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Validate address
  isValidAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  },

  // Sleep utility
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // Retry function
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxAttempts - 1) throw error
        await utils.sleep(delay * Math.pow(2, i)) // Exponential backoff
      }
    }
  }
}

export default api

