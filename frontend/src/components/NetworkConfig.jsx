import React, { useState } from 'react'

const NetworkConfig = () => {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)

  // Pharos Testnet configuration
  const pharosTestnet = {
    chainId: '0xA9B1A', // 688688 in hex
    chainName: 'Pharos Testnet',
    nativeCurrency: {
      name: 'PHRS',
      symbol: 'PHRS',
      decimals: 18,
    },
    rpcUrls: ['https://testnet.dplabs-internal.com'],
    blockExplorerUrls: ['https://testnet.pharosscan.xyz'],
  }

  const addPharosNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet to add the network.')
      return
    }

    setIsAddingNetwork(true)

    try {
      // Check if the network is already added
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (chainId === pharosTestnet.chainId) {
        alert('Pharos Testnet is already added and selected!')
        setIsAddingNetwork(false)
        return
      }

      // Add the network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [pharosTestnet],
      })

      alert('Pharos Testnet added successfully!')
    } catch (error) {
      console.error('Failed to add network:', error)
      
      if (error.code === 4902) {
        // Network already exists, just switch to it
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: pharosTestnet.chainId }],
          })
          alert('Switched to Pharos Testnet!')
        } catch (switchError) {
          alert('Failed to switch to Pharos Testnet: ' + switchError.message)
        }
      } else {
        alert('Failed to add network: ' + error.message)
      }
    }

    setIsAddingNetwork(false)
  }

  const switchToPharos = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet.')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: pharosTestnet.chainId }],
      })
      alert('Switched to Pharos Testnet!')
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it first
        await addPharosNetwork()
      } else {
        alert('Failed to switch network: ' + error.message)
      }
    }
  }

  return (
    <div className="card" style={{ margin: '10px 0' }}>
      <h3>Pharos Testnet Configuration</h3>
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Chain ID:</strong> {pharosTestnet.chainId} (688688)</p>
        <p><strong>RPC URL:</strong> {pharosTestnet.rpcUrls[0]}</p>
        <p><strong>Currency:</strong> {pharosTestnet.nativeCurrency.symbol}</p>
        <p><strong>Explorer:</strong> {pharosTestnet.blockExplorerUrls[0]}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary" 
          onClick={addPharosNetwork}
          disabled={isAddingNetwork}
          style={{ minWidth: '120px' }}
        >
          {isAddingNetwork ? 'Adding...' : 'Add Network'}
        </button>
        
        <button 
          className="btn btn-outline" 
          onClick={switchToPharos}
          style={{ minWidth: '120px' }}
        >
          Switch to Pharos
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        <p>💡 <strong>Tip:</strong> Add Pharos Testnet to your wallet to interact with HashMon contracts directly!</p>
      </div>
    </div>
  )
}

export default NetworkConfig
