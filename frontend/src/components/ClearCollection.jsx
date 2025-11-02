import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

const ClearCollection = () => {
  const { authenticated, user } = usePrivy()
  const [isClearing, setIsClearing] = useState(false)
  const [cleared, setCleared] = useState(false)

  const clearCollection = async () => {
    if (!user?.wallet?.address) return

    setIsClearing(true)
    
    try {
      // Clear all localStorage data for this user
      const keysToRemove = [
        `hashmon_collection_${user.wallet.address}`,
        `adventure_energy_${user.wallet.address}`,
        `adventure_last_encounter_${user.wallet.address}`
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      console.log('🧹 Cleared all user data from localStorage')
      setCleared(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setCleared(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error clearing collection:', error)
    } finally {
      setIsClearing(false)
    }
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="card">
      <h3>Clear Collection & Reset Data</h3>
      <p className="text-sm text-gray-400 mb-4">
        This will clear all your HashMons, energy, and adventure data. 
        Use this if you're having issues with old data formats.
      </p>
      
      <button 
        className={`btn ${cleared ? 'btn-success' : 'btn-danger'}`}
        onClick={clearCollection}
        disabled={isClearing}
      >
        {isClearing ? 'Clearing...' : cleared ? '✅ Cleared!' : '🗑️ Clear All Data'}
      </button>
      
      {cleared && (
        <p className="text-green-400 text-sm mt-2">
          All data cleared! Refresh the page to start fresh.
        </p>
      )}
    </div>
  )
}

export default ClearCollection

