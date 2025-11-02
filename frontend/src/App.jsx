import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import WalletConnect from './components/WalletConnect'
import TopWalletConnect from './components/TopWalletConnect'
import Collection from './pages/Collection'
import Adventure from './pages/Adventure'
import Battle from './pages/Battle'
import Profile from './pages/Profile'
import PharosLogo from './components/PharosLogo'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(null)
  
  // Use Privy hook - MUST be called unconditionally (React rules)
  const privyState = usePrivy()
  const authenticated = privyState?.authenticated || false
  const user = privyState?.user || null
  
  useEffect(() => {
    setMounted(true)
    
    // Remove loading screens
    const loadingScreens = document.querySelectorAll('.loading-screen, #loading-screen')
    loadingScreens.forEach(el => el.remove())
    
    // Force visibility
    const root = document.getElementById('root')
    if (root) {
      root.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; min-height: 100vh;'
    }
    document.body.style.cssText = 'opacity: 1 !important; visibility: visible !important; background: #1a1a2e !important;'
    
    console.log('✅ HashMon App loaded successfully')
  }, [])
  
  const isWalletConnected = authenticated || (user?.wallet?.address)

  if (!mounted) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h1>Loading HashMon...</h1>
          <p>Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000', minHeight: '100vh', opacity: 1, visibility: 'visible', display: 'block' }}>
      {/* Header */}
      <div className="container" style={{ opacity: 1, visibility: 'visible' }}>
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <PharosLogo size="md" animated={true} />
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>HashMon</h1>
                <span className="text-xs px-2 py-1 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/50 font-bold">PHAROS</span>
              </div>
              <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: 'white' }}>
                <PharosLogo size="sm" animated={true} />
                Collect, Battle & Mint NFTs on Pharos Network
              </p>
            </div>
          </div>
          <TopWalletConnect />
        </div>
      </div>

      {/* Navigation */}
      <div className="container" style={{ opacity: 1, visibility: 'visible' }}>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <button
            className={`btn ${currentPage === 'home' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCurrentPage('home')}
            style={{ color: 'white' }}
          >
            Home
          </button>
          <button
            className={`btn ${currentPage === 'adventure' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCurrentPage('adventure')}
            style={{ color: 'white' }}
          >
            Adventure
          </button>
          <button
            className={`btn ${currentPage === 'collection' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCurrentPage('collection')}
            style={{ color: 'white' }}
          >
            Collection
          </button>
          <button
            className={`btn ${currentPage === 'battle' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCurrentPage('battle')}
            style={{ color: 'white' }}
          >
            Battle
          </button>
          <button
            className={`btn ${currentPage === 'profile' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCurrentPage('profile')}
            style={{ color: 'white' }}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ opacity: 1, visibility: 'visible' }}>
        <div className="card card-glow">
          <div className="text-center mb-6">
            <h2 style={{ color: 'white' }}>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h2>
          </div>

          {currentPage === 'home' && (
            <div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <PharosLogo size="lg" animated={false} />
                <h2 style={{ color: 'white' }}>Welcome to HashMon</h2>
              </div>
              <p className="text-lg mb-6" style={{ color: 'white' }}>
                The ultimate blockchain-based Pokémon mini-game on <strong className="text-blue-400">Pharos Network</strong>. 
                Collect, train, and battle your digital monsters!
              </p>
              
              {!isWalletConnected ? (
                <WalletConnect />
              ) : (
                <div className="grid grid-3 gap-6">
                  <div className="card">
                    <h3>Adventure</h3>
                    <p>Explore the wild territory and catch wild HashMons!</p>
                    <button className="btn btn-primary mt-4" onClick={() => setCurrentPage('adventure')}>
                      Start Adventure
                    </button>
                  </div>
                  <div className="card">
                    <h3>Collection</h3>
                    <p>View and manage your HashMon collection!</p>
                    <button className="btn btn-primary mt-4" onClick={() => setCurrentPage('collection')}>
                      View Collection
                    </button>
                  </div>
                  <div className="card">
                    <h3>Battle</h3>
                    <p>Fight against wild HashMons in turn-based battles!</p>
                    <button className="btn btn-primary mt-4" onClick={() => setCurrentPage('battle')}>
                      Enter Battle
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'adventure' && <Adventure />}
          {currentPage === 'collection' && <Collection />}
          {currentPage === 'battle' && <Battle onNavigate={setCurrentPage} />}
          {currentPage === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  )
}

export default App
