import React from 'react'
import { usePrivy } from '@privy-io/react-auth'

const WalletConnect = () => {
  const { ready, authenticated, user, login, logout } = usePrivy()

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!ready) {
    return (
      <div className="card" style={{ maxWidth: '300px', margin: '0 auto' }}>
        <h3>Wallet Loading</h3>
        <p>Initializing wallet connection...</p>
      </div>
    )
  }

  if (authenticated && user?.wallet?.address) {
    return (
      <div className="card" style={{ maxWidth: '300px', margin: '0 auto' }}>
        <h3>Wallet Connected</h3>
        <p>Address: {formatAddress(user.wallet.address)}</p>
        <p>Network: Pharos Testnet</p>
        <button className="btn btn-danger" onClick={logout}>
          Disconnect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: '300px', margin: '0 auto' }}>
      <h3>Connect Wallet</h3>
      <p>Connect your wallet to start playing HashMon!</p>
      <button 
        className="btn btn-primary" 
        onClick={login}
      >
        Connect Wallet
      </button>
    </div>
  )
}

export default WalletConnect
