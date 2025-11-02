import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useGame } from '../contexts/GameContext';

const Marketplace = () => {
  const { address, isConnected } = useWallet();
  const { player } = useGame();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMarketplaceData();
  }, [filter]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      // Mock data for demo - in real app, this would fetch from your backend
      const mockNfts = [
        {
          id: 1,
          name: 'Flameon',
          type: 'Fire',
          level: 15,
          rarity: 3,
          price: '0.1',
          seller: '0x123...456',
          image: '/api/placeholder/200/200',
          stats: { hp: 120, attack: 95, defense: 80, speed: 85 }
        },
        {
          id: 2,
          name: 'Thunderbolt',
          type: 'Electric',
          level: 12,
          rarity: 4,
          price: '0.15',
          seller: '0x789...012',
          image: '/api/placeholder/200/200',
          stats: { hp: 100, attack: 110, defense: 75, speed: 120 }
        },
        {
          id: 3,
          name: 'Voidwalker',
          type: 'Dark/Psychic',
          level: 20,
          rarity: 5,
          price: '0.5',
          seller: '0x345...678',
          image: '/api/placeholder/200/200',
          stats: { hp: 140, attack: 125, defense: 100, speed: 110 }
        }
      ];
      
      setNfts(mockNfts);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 1: return 'text-gray-400';
      case 2: return 'text-green-400';
      case 3: return 'text-blue-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityStars = (rarity) => {
    return '⭐'.repeat(rarity);
  };

  const handleBuy = async (nft) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    try {
      // In a real app, this would initiate the purchase transaction
      alert(`Purchase initiated for ${nft.name} for ${nft.price} ETH`);
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Error purchasing NFT. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🛒 Marketplace</h1>
            <p className="text-gray-300 text-lg">Buy and sell HashMon NFTs</p>
          </div>

          {/* Filters */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'fire', label: 'Fire' },
                { key: 'water', label: 'Water' },
                { key: 'electric', label: 'Electric' },
                { key: 'rare', label: 'Rare (4-5⭐)' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filter === option.key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* NFT Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse"
                >
                  <div className="w-full h-48 bg-white/20 rounded-xl mb-4"></div>
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all group"
                >
                  {/* NFT Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl">🎮</div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      Level {nft.level}
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                    <p className="text-gray-300 mb-2">{nft.type}</p>
                    <div className={`text-lg font-bold ${getRarityColor(nft.rarity)}`}>
                      {getRarityStars(nft.rarity)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">HP:</span>
                      <span className="text-white">{nft.stats.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ATK:</span>
                      <span className="text-white">{nft.stats.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">DEF:</span>
                      <span className="text-white">{nft.stats.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SPD:</span>
                      <span className="text-white">{nft.stats.speed}</span>
                    </div>
                  </div>

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">{nft.price} PHAR</p>
                      <p className="text-xs text-gray-400">by {nft.seller}</p>
                    </div>
                    <button
                      onClick={() => handleBuy(nft)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform group-hover:scale-105"
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Empty State */}
          {!loading && nfts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-white mb-2">No NFTs Available</h3>
              <p className="text-gray-300">Check back later for new HashMon NFTs!</p>
            </motion.div>
          )}

          {/* Marketplace Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {nfts.length}
              </h3>
              <p className="text-gray-300">NFTs for Sale</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                {nfts.reduce((sum, nft) => sum + parseFloat(nft.price), 0).toFixed(2)} PHAR
              </h3>
              <p className="text-gray-300">Total Value</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">
                {nfts.filter(nft => nft.rarity >= 4).length}
              </h3>
              <p className="text-gray-300">Rare NFTs</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Marketplace;

