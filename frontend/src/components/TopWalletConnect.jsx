import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { setAuthToken } from '../services/authAPI'

const TopWalletConnect = () => {
  const { authenticated, user, login, logout } = usePrivy()
  const [error, setError] = useState(null)

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Handle authentication state changes
  useEffect(() => {
    if (authenticated && user?.accessToken) {
      // Set auth token for API calls
      setAuthToken(user.accessToken)
      setError(null) // Clear any previous errors
    } else {
      // Clear auth token
      setAuthToken(null)
    }
  }, [authenticated, user])

  const handlePrivyLogin = async () => {
    try {
      setError(null)
      console.log('🔍 Attempting Privy login...')
      console.log('🔍 Privy ready state:', { authenticated, user })
      
      const result = await login()
      console.log('✅ Login result:', result)
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Login failed: ' + (err.message || 'Unknown error'))
    }
  }

  // Show connect button if not authenticated
  if (!authenticated) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button className="btn btn-primary" onClick={handlePrivyLogin}>
          Connect Wallet
        </button>
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>
    )
  }

  if (authenticated && user?.wallet?.address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{formatAddress(user.wallet.address)}</span>
        <button className="btn btn-outline" onClick={logout}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={handlePrivyLogin}>
      Connect Wallet
    </button>
  )
}

export default TopWalletConnect
