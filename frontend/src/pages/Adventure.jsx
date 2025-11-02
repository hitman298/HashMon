import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { generateRandomHashmon, HASHMON_TYPES } from '../services/hashmonService'
import nftService from '../services/nftService'
import Pokeball from '../components/Pokeball'
import NFTMinting from '../components/NFTMinting'
import PharosLogo from '../components/PharosLogo'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Adventure = () => {
  const { authenticated, user } = usePrivy()
  const [wildHashmon, setWildHashmon] = useState(null)
  const [isEncountering, setIsEncountering] = useState(false)
  const [isCatching, setIsCatching] = useState(false)
  const [catchResult, setCatchResult] = useState(null)
  const [currentCatchResult, setCurrentCatchResult] = useState(null)
  const [energy, setEnergy] = useState(100)
  const [lastEncounter, setLastEncounter] = useState(null)
  const [pokeballThrown, setPokeballThrown] = useState(false)
  const [showNFTMinting, setShowNFTMinting] = useState(false)
  const [preCreatedVoucher, setPreCreatedVoucher] = useState(null)

  // Load energy from localStorage
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      const savedEnergy = localStorage.getItem(`adventure_energy_${user.wallet.address}`)
      if (savedEnergy) {
        setEnergy(parseInt(savedEnergy))
      }
    }
  }, [authenticated, user])

  // Fix any existing HashMons with string caughtAt values
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      const savedCollection = localStorage.getItem(`hashmon_collection_${user.wallet.address}`)
      if (savedCollection) {
        try {
          const collection = JSON.parse(savedCollection)
          let needsUpdate = false
          const fixedCollection = collection.map(hashmon => {
            if (typeof hashmon.caughtAt === 'string') {
              needsUpdate = true
              return {
                ...hashmon,
                caughtAt: new Date(hashmon.caughtAt).getTime()
              }
            }
            return hashmon
          })
          
          if (needsUpdate) {
            console.log('🔧 Fixed existing HashMon collection caughtAt values')
            localStorage.setItem(`hashmon_collection_${user.wallet.address}`, JSON.stringify(fixedCollection))
          }
        } catch (error) {
          console.error('Error fixing HashMon collection:', error)
        }
      }
    }
  }, [authenticated, user])

  // Save energy to localStorage
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      localStorage.setItem(`adventure_energy_${user.wallet.address}`, energy.toString())
    }
  }, [energy, authenticated, user])

  // Energy regeneration (1 energy per minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1))
    }, 60000) // 1 minute

    return () => clearInterval(interval)
  }, [])

  // Start encounter
  const startEncounter = async () => {
    if (energy < 10) {
      alert('Not enough energy! You need 10 energy to encounter a HashMon.')
      return
    }

    setIsEncountering(true)
    setWildHashmon(null)
    setCatchResult(null)

    // Simulate searching
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newHashmon = generateRandomHashmon(Math.floor(Math.random() * 10) + 1)
    setWildHashmon(newHashmon)
    setIsEncountering(false)
    setEnergy(prev => prev - 10)
  }

  // Handle catch animation completion
  const handleCatchComplete = async (success) => {
    if (success) {
      // DON'T add to local collection - only add to blockchain when minted
      // The HashMon will only exist on blockchain after successful minting
      setCatchResult({ success: true, hashmons: wildHashmon })
      
      // Automatically create mint voucher for immediate minting
      try {
        console.log('🎯 Auto-creating mint voucher for caught HashMon...')
        
        // Fix caughtAt to be a number (timestamp) instead of string
        const fixedHashmonData = {
          ...wildHashmon,
          caughtAt: typeof wildHashmon.caughtAt === 'string' 
            ? new Date(wildHashmon.caughtAt).getTime() 
            : (typeof wildHashmon.caughtAt === 'number' ? wildHashmon.caughtAt : Date.now()),
          // Ensure all required fields are present
          id: wildHashmon.id || `hashmon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: wildHashmon.name || 'Unknown HashMon',
          level: wildHashmon.level || 1,
          experience: wildHashmon.experience || 0,
          stats: wildHashmon.stats || { hp: 50, attack: 50, defense: 50, speed: 50 },
          type: wildHashmon.type || 'normal',
          rarity: wildHashmon.rarity || 'common'
        }
        
        const directResponse = await fetch(`${API_BASE_URL}/nft/mint-voucher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playerAddress: user.wallet.address,
            hashmonData: fixedHashmonData
          })
        })
        
        if (!directResponse.ok) {
          const errorData = await directResponse.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || `HTTP ${directResponse.status}: ${directResponse.statusText}`)
        }
        
        const directData = await directResponse.json()
        console.log('✅ Mint voucher created:', directData)
        
        if (directData.success && directData.voucher) {
          setPreCreatedVoucher(directData) // Store the pre-created voucher
          setShowNFTMinting(true) // Show NFT minting panel immediately
        } else {
          throw new Error(directData.message || 'Failed to create voucher')
        }
      } catch (error) {
        console.error('⚠️ Failed to auto-create mint voucher:', error)
        // Show error but still allow manual minting
        setPreCreatedVoucher(null)
        setShowNFTMinting(true) // Show NFT minting panel so user can create voucher manually
      }
    } else {
      setCatchResult({ success: false })
    }

    // Set the current catch result for the pokeball animation
    setCurrentCatchResult(success)
    
    // Reset states immediately (no delay)
    setIsCatching(false)
    setPokeballThrown(false)
    // Keep currentCatchResult for animation display, reset after a very short delay
    setTimeout(() => {
      setCurrentCatchResult(null)
    }, 500)
  }

  // Handle NFT minting completion
  const handleMintComplete = (mintData) => {
    console.log('NFT minted successfully:', mintData)
    
    // Only add to local collection AFTER successful blockchain minting
    // This ensures the HashMon exists on blockchain first
    if (mintData && (mintData.transactionHash || mintData.isMock)) {
      const collection = JSON.parse(localStorage.getItem(`hashmon_collection_${user.wallet.address}`) || '[]')
      
      // Check if already in collection (avoid duplicates)
      const alreadyExists = collection.some(h => h.id === wildHashmon?.id)
      if (!alreadyExists && wildHashmon) {
        collection.push(wildHashmon)
        localStorage.setItem(`hashmon_collection_${user.wallet.address}`, JSON.stringify(collection))
        console.log('✅ HashMon added to local collection after blockchain mint')
      }
    }
    
    // Reset all catch/mint states - prevents re-minting
    setShowNFTMinting(false)
    setPreCreatedVoucher(null)
    setCatchResult(null)
    setWildHashmon(null)
    setPokeballThrown(false)
    setIsCatching(false)
    setCurrentCatchResult(null)
  }

  // Handle closing NFT minting
  const handleCloseNFTMinting = () => {
    setShowNFTMinting(false)
    setPreCreatedVoucher(null) // Clear the pre-created voucher
  }

  // Run away
  const runAway = () => {
    setWildHashmon(null)
    setCatchResult(null)
    setPokeballThrown(false)
    setIsCatching(false)
    setCurrentCatchResult(null)
    setShowNFTMinting(false)
    setPreCreatedVoucher(null) // Reset pre-created voucher
  }

  // Get rarity color
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#FFD700'
      case 'rare': return '#C0C0C0'
      case 'uncommon': return '#CD7F32'
      default: return '#8B4513'
    }
  }

  if (!authenticated) {
    return (
      <div className="text-center">
        <h2>Connect Wallet Required</h2>
        <p>Please connect your wallet to start your adventure!</p>
      </div>
    )
  }

         return (
           <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#000000' }}>
      {/* Energy Display - COMPACT */}
      <div className="flex justify-center items-center gap-2 mb-1 h-6 flex-shrink-0 px-2">
        <span className="text-[9px] font-bold text-gray-300">Energy:</span>
        <div className="w-32 bg-gray-800 rounded-full h-2 border border-gray-700">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          ></div>
        </div>
        <span className="text-[9px] font-bold text-white">{energy}/100</span>
      </div>

      {/* Adventure Area - FIXED HEIGHT - NO SCROLL */}
      <div className="flex-1 min-h-0 overflow-hidden px-2">
        <div className="card text-center h-full flex flex-col">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PharosLogo size="md" animated={true} />
          <div>
            <h2 className="mb-0 text-lg font-bold">Wild HashMon Territory</h2>
            <p className="text-xs text-blue-400">Powered by <strong>Pharos Network</strong></p>
          </div>
        </div>
        <p className="text-xs text-center text-white/60 mb-4">Explore Pharos Network to catch unique HashMons</p>
        
        {!wildHashmon && !isEncountering && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl mb-3">
              🌲
            </div>
            <p className="text-sm mb-3">Explore the wild territory on Pharos Network!</p>
            
            <button 
              className="btn btn-primary btn-sm"
              onClick={startEncounter}
              disabled={energy < 10}
            >
              {energy < 10 ? 'Not Enough Energy' : 'Start Adventure'}
            </button>
          </div>
        )}

        {isEncountering && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full flex items-center justify-center text-5xl mb-3 animate-pulse">
              🔍
            </div>
            <p className="text-sm">Searching for wild HashMons...</p>
          </div>
        )}

        {wildHashmon && !catchResult && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Encounter Header - COMPACT */}
            <div className="text-center mb-1">
              <p className="text-[10px] font-bold text-white mb-1 animate-pulse">
                🎯 A wild HashMon appeared!
              </p>

              {/* HashMon Card - ULTRA COMPACT */}
              <div
                className="mx-auto max-w-[200px] p-2 rounded-lg mb-1"
                style={{
                  background: `linear-gradient(135deg, ${HASHMON_TYPES[wildHashmon.type].color}20, ${HASHMON_TYPES[wildHashmon.type].color}40)`,
                  boxShadow: `0 0 15px ${HASHMON_TYPES[wildHashmon.type].color}30`,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="text-2xl mb-1">
                  {wildHashmon.isShiny ? '✨' : '🔮'}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{wildHashmon.name}</h3>
                <div className="flex flex-wrap justify-center gap-1 mb-1">
                  <span className="px-1 py-0 bg-blue-600 rounded text-white text-[8px] font-semibold">
                    Lv.{wildHashmon.level}
                  </span>
                  <span 
                    className="px-1 py-0 rounded text-white text-[8px] font-semibold"
                    style={{ backgroundColor: getRarityColor(wildHashmon.rarity) }}
                  >
                    {wildHashmon.rarity}
                  </span>
                  <span className="px-1 py-0 bg-purple-600 rounded text-white text-[8px] font-semibold capitalize">
                    {wildHashmon.type}
                  </span>
                </div>
                
                {/* Compact Stats Grid - 2x2 - SMALLER */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-red-600/80 rounded p-1 text-center">
                    <div className="text-[7px] text-red-100 mb-0">HP</div>
                    <div className="text-xs font-bold text-white">{wildHashmon.stats.hp}</div>
                  </div>
                  <div className="bg-orange-600/80 rounded p-1 text-center">
                    <div className="text-[7px] text-orange-100 mb-0">ATK</div>
                    <div className="text-xs font-bold text-white">{wildHashmon.stats.attack}</div>
                  </div>
                  <div className="bg-blue-600/80 rounded p-1 text-center">
                    <div className="text-[7px] text-blue-100 mb-0">DEF</div>
                    <div className="text-xs font-bold text-white">{wildHashmon.stats.defense}</div>
                  </div>
                  <div className="bg-green-600/80 rounded p-1 text-center">
                    <div className="text-[7px] text-green-100 mb-0">SPD</div>
                    <div className="text-xs font-bold text-white">{wildHashmon.stats.speed}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pokeball Area - DEDICATED BLANK SPACE */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
              {!pokeballThrown && (
                <>
                  {/* Interactive Pokeball - Drag and Throw - IN BLANK AREA */}
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <Pokeball 
                      isThrowing={false}
                      isCatching={false}
                      catchResult={null}
                      onThrow={() => {
                        setPokeballThrown(true)
                        setIsCatching(true)
                      }}
                      onAnimationComplete={() => {}}
                    />
                    <p className="text-[8px] text-gray-400">
                      Drag up and release!
                    </p>
                  </div>
                  
                  <button 
                    className="btn btn-outline btn-sm text-[9px] px-2 py-1"
                    onClick={runAway}
                    disabled={isCatching}
                  >
                    Run Away
                  </button>
                </>
              )}

              {/* Catching Animation - IN BLANK AREA */}
              {pokeballThrown && isCatching && (
                <div className="flex flex-col items-center gap-1">
                  <Pokeball 
                    isThrowing={true}
                    isCatching={true}
                    catchResult={currentCatchResult}
                    onThrow={() => {}}
                    onAnimationComplete={(success) => handleCatchComplete(success)}
                  />
                  <div className="text-center">
                    <p className="text-gray-300 animate-pulse text-xs font-bold mb-0">Catching...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {catchResult && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
            {/* Success/Failure Animation - COMPACT */}
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-1 animate-bounce ${catchResult.success ? 'bg-green-500' : 'bg-red-500'}`}>
              {catchResult.success ? '🎉' : '💔'}
            </div>
            
            <h3 className="text-sm font-bold mb-1">
              {catchResult.success ? '🎉 GOTCHA! 🎉' : '😔 Better luck next time!'}
            </h3>
            
            {/* Caught HashMon Info - ULTRA COMPACT */}
            {catchResult.success && (
              <div className="mx-auto max-w-[200px] mb-2">
                <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-2">
                  <p className="text-xs font-bold text-white mb-1">
                    You caught {catchResult.hashmons.name}!
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    <span className="px-1 py-0 bg-blue-600 rounded text-white text-[8px] font-semibold">
                      Lv.{catchResult.hashmons.level}
                    </span>
                    <span 
                      className="px-1 py-0 rounded text-white text-[8px] font-semibold"
                      style={{ backgroundColor: getRarityColor(catchResult.hashmons.rarity) }}
                    >
                      {catchResult.hashmons.rarity}
                    </span>
                    <span className="px-1 py-0 bg-purple-600 rounded text-white text-[8px] font-semibold capitalize">
                      {catchResult.hashmons.type}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NFT Minting Section - COMPACT */}
            {/* Always show mint panel immediately after successful catch */}
            {catchResult?.success && wildHashmon && (
              <div className="mx-auto max-w-md w-full mb-2">
                <NFTMinting 
                  hashmon={catchResult.hashmons || wildHashmon}
                  onMintComplete={handleMintComplete}
                  onClose={handleCloseNFTMinting}
                  preCreatedVoucher={preCreatedVoucher}
                />
              </div>
            )}
            
            {/* Failure Message - COMPACT */}
            {!catchResult.success && (
              <div className="bg-red-600/20 rounded-lg p-2 max-w-[200px] mx-auto mb-2">
                <p className="text-xs text-red-300 mb-0">
                  The wild {wildHashmon?.name} broke free!
                </p>
              </div>
            )}

            {/* Action Buttons - COMPACT */}
            <div className="flex gap-1 justify-center">
              <button 
                className="btn btn-primary btn-sm text-[9px] px-2 py-1"
                onClick={() => {
                  setWildHashmon(null)
                  setCatchResult(null)
                  setPokeballThrown(false)
                  setIsCatching(false)
                  setCurrentCatchResult(null)
                  setShowNFTMinting(false)
                  setPreCreatedVoucher(null)
                }}
              >
                {catchResult.success ? 'Catch More!' : 'Try Again'}
              </button>
              <button 
                className="btn btn-outline btn-sm text-[9px] px-2 py-1"
                onClick={() => {
                  setWildHashmon(null)
                  setCatchResult(null)
                  setPokeballThrown(false)
                  setIsCatching(false)
                  setCurrentCatchResult(null)
                  setShowNFTMinting(false)
                  setPreCreatedVoucher(null)
                }}
              >
                Return
              </button>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
  )
}

export default Adventure
