import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import nftService from '../services/nftService'
import { HASHMON_TYPES } from '../services/hashmonService'

const Collection = () => {
  const { authenticated, user } = usePrivy()
  const [collection, setCollection] = useState([])
  const [blockchainNFTs, setBlockchainNFTs] = useState([])
  const [selectedHashmon, setSelectedHashmon] = useState(null)
  const [filter, setFilter] = useState('all')
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)

  // Load collection from localStorage
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      const savedCollection = localStorage.getItem(`hashmon_collection_${user.wallet.address}`)
      if (savedCollection) {
        setCollection(JSON.parse(savedCollection))
      }
    }
  }, [authenticated, user])

  // Load blockchain NFTs
  const loadBlockchainNFTs = async () => {
    if (!user?.wallet?.address) return;
    
    setIsLoadingNFTs(true);
    try {
      const response = await nftService.getUserNFTs(user.wallet.address);
      setBlockchainNFTs(response.nfts || []);
    } catch (error) {
      setBlockchainNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Load blockchain NFTs on mount
  useEffect(() => {
    if (user?.wallet?.address) {
      loadBlockchainNFTs();
    }
  }, [user?.wallet?.address]);

  // Save collection to localStorage
  useEffect(() => {
    if (authenticated && user?.wallet?.address && collection.length > 0) {
      localStorage.setItem(`hashmon_collection_${user.wallet.address}`, JSON.stringify(collection))
    }
  }, [collection, authenticated, user])

  // Merge local and blockchain collections into Pharos Collection
  const getAllHashMons = () => {
    const local = collection.map(h => ({ ...h, source: 'local' }))
    const blockchain = blockchainNFTs.map(h => ({ ...h, source: 'blockchain' }))
    return [...local, ...blockchain]
  }

  // Filter collection
  const getFilteredItems = () => {
    const items = getAllHashMons()
    if (filter === 'all') return items
    if (filter === 'legendary') return items.filter(h => h.rarity === 'legendary' || h.type2 === 'legendary')
    return items.filter(hashmon => {
      const type = hashmon.type || hashmon.type1 || hashmon.type2
      return type === filter
    })
  }

  const filteredItems = getFilteredItems()

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
        <p>Please connect your wallet to view your HashMon collection!</p>
      </div>
    )
  }

  if (collection.length === 0) {
    return (
      <div className="text-center" style={{ background: '#000000', minHeight: '100vh', padding: '20px' }}>
        <h2>No HashMons Yet</h2>
        <p>Start your adventure to catch your first HashMon!</p>
        <div className="mt-6">
          <div className="grid grid-3 gap-6">
            {Object.entries(HASHMON_TYPES).map(([type, data]) => (
              <div key={type} className="card" style={{ border: `2px solid ${data.color}` }}>
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: data.color }}
                >
                  {type.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ color: data.color }}>{data.name}</h3>
                <p className="text-sm">Type: {type}</p>
                <p className="text-sm">Base HP: {data.baseStats.hp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
            <span className="text-blue-400 text-xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Pharos Collection</h2>
            <p className="text-sm text-white/60">Your HashMons on Pharos Network</p>
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="grid grid-4 gap-4 mb-6">
        <div className="card text-center bg-blue-600/10 border border-blue-500/30">
          <h3 className="text-blue-300">Total HashMons</h3>
          <p className="text-2xl font-bold text-blue-400">{getAllHashMons().length}</p>
        </div>
        <div className="card text-center bg-purple-600/10 border border-purple-500/30">
          <h3 className="text-purple-300">On Blockchain</h3>
          <p className="text-2xl font-bold text-purple-400">{blockchainNFTs.length}</p>
        </div>
        <div className="card text-center bg-green-600/10 border border-green-500/30">
          <h3 className="text-green-300">Types</h3>
          <p className="text-2xl font-bold text-green-400">{new Set(getAllHashMons().map(h => h.type || h.type1)).size}</p>
        </div>
        <div className="card text-center bg-yellow-600/10 border border-yellow-500/30">
          <h3 className="text-yellow-300">Legendary</h3>
          <p className="text-2xl font-bold text-yellow-400">{getAllHashMons().filter(h => h.rarity === 'legendary' || h.type2 === 'legendary').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'legendary' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('legendary')}
          style={filter === 'legendary' ? { backgroundColor: '#FFD700', color: '#000' } : {}}
        >
          ⭐ Legendary
        </button>
        {Object.keys(HASHMON_TYPES).map(type => (
          <button
            key={type}
            className={`btn ${filter === type ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(type)}
            style={filter === type ? { backgroundColor: HASHMON_TYPES[type].color } : {}}
          >
            {HASHMON_TYPES[type].name}
          </button>
        ))}
      </div>

      {/* Collection Grid */}
      <div className="grid grid-4 gap-4">
        {isLoadingNFTs ? (
          <div className="col-span-4 text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p>Loading Pharos Collection...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-4 text-center py-8">
            <h3>No HashMons Found</h3>
            <p className="text-gray-400">
              {getAllHashMons().length === 0 
                ? "Start your adventure to catch your first HashMon on Pharos!" 
                : "No HashMons match the selected filter."}
            </p>
          </div>
        ) : (
          filteredItems.map((hashmon, idx) => {
            const isBlockchain = hashmon.source === 'blockchain' || hashmon.tokenId !== undefined
            const hashmonType = hashmon.type || hashmon.type1
            const hashmonId = hashmon.id || hashmon.tokenId || `hashmon-${idx}`
            return (
              <div
                key={hashmonId}
                className="card cursor-pointer hover:scale-105 transition-transform relative"
                onClick={() => setSelectedHashmon(hashmon)}
                style={{
                  border: `2px solid ${HASHMON_TYPES[hashmonType]?.color || '#666'}`,
                }}
              >
                {/* Blockchain badge */}
                {isBlockchain && (
                  <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>⛓️</span>
                    <span>Pharos</span>
                  </div>
                )}
                
                {/* Shiny indicator */}
                {hashmon.isShiny && (
                  <div className="absolute top-2 left-2 text-yellow-400 text-xl">✨</div>
                )}
                
                {/* Rarity indicator */}
                <div 
                  className="absolute bottom-2 left-2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: getRarityColor(hashmon.rarity || hashmon.type2) }}
                ></div>

                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: HASHMON_TYPES[hashmonType]?.color || '#666' }}
                >
                  {(hashmonType || 'N').charAt(0).toUpperCase()}
                </div>

                <h3 className="text-center mb-2">{hashmon.name}</h3>
                <p className="text-sm text-center mb-2">Level {hashmon.level || 1}</p>
                
                {/* HP Bar - only show for local hashmon */}
                {hashmon.stats && (
                  <>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>HP</span>
                        <span>{hashmon.stats.hp || hashmon.hp}/{hashmon.maxStats?.hp || hashmon.stats?.hp || hashmon.hp || 100}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ((hashmon.stats.hp || hashmon.hp || 100) / (hashmon.maxStats?.hp || hashmon.stats?.hp || hashmon.hp || 100)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Experience Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>EXP</span>
                        <span>{(hashmon.experience || hashmon.xp || 0)}/{(hashmon.experienceToNext || hashmon.requiredXP || 100)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ((hashmon.experience || hashmon.xp || 0) / (hashmon.experienceToNext || hashmon.requiredXP || 100)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* For blockchain NFTs, show token ID */}
                {isBlockchain && hashmon.tokenId && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-400">Token #{hashmon.tokenId}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* HashMon Detail Modal */}
      {selectedHashmon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl">
                  {selectedHashmon.tokenId ? `#${String(selectedHashmon.tokenId).padStart(3, '0')} ` : ''}
                  {selectedHashmon.name}
                </h2>
                {selectedHashmon.tokenId && (
                  <p className="text-sm text-gray-400">Token ID: {selectedHashmon.tokenId}</p>
                )}
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedHashmon(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-2 gap-6">
              {/* Left Side - HashMon Info */}
              <div>
                <div 
                  className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: HASHMON_TYPES[selectedHashmon.type || selectedHashmon.type1]?.color || '#666' }}
                >
                  {(selectedHashmon.type || selectedHashmon.type1 || 'N').charAt(0).toUpperCase()}
                </div>

                <div className="text-center mb-4">
                  <p className="text-lg">Level {selectedHashmon.level || 1}</p>
                  <p className="text-sm capitalize">{(selectedHashmon.type || selectedHashmon.type1 || 'Unknown')} Type</p>
                  <p className="text-sm capitalize">{selectedHashmon.rarity || 'common'} Rarity</p>
                  {selectedHashmon.isShiny && (
                    <p className="text-yellow-400">✨ Shiny ✨</p>
                  )}
                </div>

                {/* Stats */}
                <div>
                  <h3 className="mb-2">Stats</h3>
                  {selectedHashmon.stats && Object.entries(selectedHashmon.stats).map(([stat, value]) => {
                    const maxValue = selectedHashmon.maxStats?.[stat] || selectedHashmon.maxHp || 100
                    return (
                      <div key={stat} className="flex justify-between items-center mb-2">
                        <span className="capitalize">{stat}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-12 text-right">{value}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Side - Moves and Info */}
              <div>
                <div className="mb-4">
                  <h3 className="mb-2">Moves</h3>
                  {selectedHashmon.moves && selectedHashmon.moves.length > 0 ? (
                    selectedHashmon.moves.map((move, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-800 rounded">
                        <div className="flex justify-between">
                          <span className="font-bold">{move.name || `Move ${index + 1}`}</span>
                          <span className="text-sm">{move.power || 50} power</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{move.type || 'Normal'}</span>
                          <span>{Math.round((move.accuracy || 0.9) * 100)}% accuracy</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No moves available</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-2">Experience</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Level {(selectedHashmon.level || 1) + 1}</span>
                    <span>{selectedHashmon.experience || selectedHashmon.xp || 0}/{selectedHashmon.experienceToNext || selectedHashmon.requiredXP || 100}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ 
                        width: `${Math.min(100, ((selectedHashmon.experience || selectedHashmon.xp || 0) / (selectedHashmon.experienceToNext || selectedHashmon.requiredXP || 100)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2">Info</h3>
                  {selectedHashmon.caughtAt && (
                    <p className="text-sm">Caught: {new Date(selectedHashmon.caughtAt).toLocaleDateString()}</p>
                  )}
                  {selectedHashmon.id && (
                    <p className="text-sm">ID: {selectedHashmon.id}</p>
                  )}
                  {selectedHashmon.tokenId && (
                    <p className="text-sm">Token ID: {selectedHashmon.tokenId}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Collection