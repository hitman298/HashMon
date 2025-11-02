import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// Get current user's stats (authenticated)
export const getMyStats = async () => {
  try {
    const response = await apiClient.get('/player/stats/me')
    return response.data
  } catch (error) {
    console.error('Failed to get user stats:', error)
    throw error
  }
}

// Get player stats by address (public)
export const getPlayerStats = async (address) => {
  try {
    const response = await apiClient.get(`/player/stats/${address}`)
    return response.data
  } catch (error) {
    console.error('Failed to get player stats:', error)
    throw error
  }
}

// Create starter HashMon (authenticated)
export const createStarterHashmon = async (starterType = 'fire') => {
  try {
    const response = await apiClient.post('/player/starter', {
      starterType
    })
    return response.data
  } catch (error) {
    console.error('Failed to create starter HashMon:', error)
    throw error
  }
}

export default apiClient
