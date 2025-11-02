import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import nftService from '../services/nftService';
import { HASHMON_TYPES } from '../services/hashmonService';
import api from '../services/api';
import PharosLogo from '../components/PharosLogo';

const Profile = () => {
  const { authenticated, user } = usePrivy();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [battleHistory, setBattleHistory] = useState([]);
  const [loadingBattles, setLoadingBattles] = useState(false);
  const [localHashmons, setLocalHashmons] = useState([]);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchAllData();
    } else {
      setProfile(null);
      setNfts([]);
      setBattleHistory([]);
      setLocalHashmons([]);
      setLoading(false);
    }
  }, [authenticated, user?.wallet?.address]);

  // Fetch all profile data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchNFTs(),
      fetchBattleHistory(),
      fetchLocalHashmons()
    ]);
    setLoading(false);
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!authenticated || !user?.wallet?.address) return;
    
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [authenticated, user?.wallet?.address]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Add timeout and better error handling
      const response = await Promise.race([
        api.get(`/player/stats/${user.wallet.address}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      setProfile(response.data || {});
    } catch (error) {
      // Set default profile if API fails
      setProfile({
        level: 1,
        total_battles: 0,
        wins: 0,
        losses: 0,
        total_xp: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTs = async () => {
    if (!user?.wallet?.address) return;
    
    setLoadingNFTs(true);
    try {
      const response = await nftService.getUserNFTs(user.wallet.address);
      setNfts(response.nfts || []);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      setNfts([]);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const fetchBattleHistory = async () => {
    if (!user?.wallet?.address) return;
    
    setLoadingBattles(true);
    try {
      const response = await api.get(`/player/battles/${user.wallet.address}`, {
        params: { limit: 20, offset: 0 }
      });
      setBattleHistory(response.data?.battles || response.data || []);
    } catch (error) {
      console.error('Failed to fetch battle history:', error);
      setBattleHistory([]);
    } finally {
      setLoadingBattles(false);
    }
  };

  const fetchLocalHashmons = () => {
    if (!user?.wallet?.address) return;
    
    try {
      const savedCollection = localStorage.getItem(`hashmon_collection_${user.wallet.address}`);
      if (savedCollection) {
        const collection = JSON.parse(savedCollection);
        setLocalHashmons(Array.isArray(collection) ? collection : []);
      } else {
        setLocalHashmons([]);
      }
    } catch (error) {
      console.error('Failed to fetch local HashMons:', error);
      setLocalHashmons([]);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'common': '#9CA3AF',
      'uncommon': '#10B981',
      'rare': '#3B82F6',
      'epic': '#8B5CF6',
      'legendary': '#F59E0B',
      'mythic': '#EF4444'
    };
    return colors[rarity?.toLowerCase()] || '#9CA3AF';
  };

  if (!authenticated || !user?.wallet?.address) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to view your profile.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Profile Header - Vertical Box Layout */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-white/10 via-purple-900/20 to-blue-900/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-purple-500/30 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative mb-4"
              >
                <PharosLogo size="lg" animated={true} />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg"
                >
                  <span className="text-sm font-bold text-white">
                    {user?.wallet?.address?.charAt(2)?.toUpperCase() || 'P'}
                  </span>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2 mb-4"
              >
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </h1>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-xs px-3 py-1 bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-blue-300 rounded-full border border-blue-500/50 font-bold"
                  >
                    PHAROS
                  </motion.span>
                </div>
                <p className="text-gray-300 flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  Level {profile?.level || 1} Trainer on <strong className="text-blue-400">Pharos Network</strong>
                </p>
                <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
                  <span>🔗</span> {user?.wallet?.address}
                </p>
              </motion.div>
            </div>
            
            {/* Quick Stats - Vertical Boxes */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-lg p-4 border-2 border-blue-500/50 shadow-lg hover:shadow-blue-500/50 transition-all text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-3xl font-bold text-blue-400 mb-1"
                >
                  {nfts.length}
                </motion.div>
                <div className="text-xs text-gray-200 font-semibold">NFTs</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg p-4 border-2 border-purple-500/50 shadow-lg hover:shadow-purple-500/50 transition-all text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-3xl font-bold text-purple-400 mb-1"
                >
                  {localHashmons.length}
                </motion.div>
                <div className="text-xs text-gray-200 font-semibold">Local</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-lg p-4 border-2 border-green-500/50 shadow-lg hover:shadow-green-500/50 transition-all text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-3xl font-bold text-green-400 mb-1"
                >
                  {battleHistory.length}
                </motion.div>
                <div className="text-xs text-gray-200 font-semibold">Battles</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid - Vertical Boxes Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Battles - Vertical Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-5 text-center border-2 border-blue-500/30 shadow-lg hover:shadow-blue-500/50 transition-all flex flex-col justify-between"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-3xl mb-2"
              >
                ⚔️
              </motion.div>
              <motion.h3
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-2xl font-bold text-blue-400 mb-1"
              >
                {profile?.total_battles || 0}
              </motion.h3>
              <p className="text-gray-300 text-sm font-semibold mb-2">Total Battles</p>
              <div className="h-1 bg-blue-500/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </motion.div>

            {/* Victories - Vertical Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-5 text-center border-2 border-green-500/30 shadow-lg hover:shadow-green-500/50 transition-all flex flex-col justify-between"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-3xl mb-2"
              >
                🏆
              </motion.div>
              <motion.h3
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-2xl font-bold text-green-400 mb-1"
              >
                {profile?.wins || 0}
              </motion.h3>
              <p className="text-gray-300 text-sm font-semibold mb-2">Victories</p>
              <div className="h-1 bg-green-500/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.total_battles ? (profile.wins / profile.total_battles) * 100 : 0}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </motion.div>

            {/* Defeats - Vertical Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-md rounded-xl p-5 text-center border-2 border-red-500/30 shadow-lg hover:shadow-red-500/50 transition-all flex flex-col justify-between"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-3xl mb-2"
              >
                💔
              </motion.div>
              <motion.h3
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-2xl font-bold text-red-400 mb-1"
              >
                {profile?.losses || 0}
              </motion.h3>
              <p className="text-gray-300 text-sm font-semibold mb-2">Defeats</p>
              <div className="h-1 bg-red-500/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.total_battles ? (profile.losses / profile.total_battles) * 100 : 0}%` }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                />
              </div>
            </motion.div>

            {/* Total XP - Vertical Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 backdrop-blur-md rounded-xl p-5 text-center border-2 border-yellow-500/30 shadow-lg hover:shadow-yellow-500/50 transition-all flex flex-col justify-between"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-3xl mb-2"
              >
                ⭐
              </motion.div>
              <motion.h3
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-2xl font-bold text-yellow-400 mb-1"
              >
                {profile?.total_xp || 0}
              </motion.h3>
              <p className="text-gray-300 text-sm font-semibold mb-2">Total XP</p>
              <div className="h-1 bg-yellow-500/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((profile?.total_xp || 0) % 1000 / 10, 100)}%` }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                />
              </div>
            </motion.div>
          </div>

          {/* NFT Collection Section - Vertical Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-white/10 via-purple-900/20 to-blue-900/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-purple-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PharosLogo size="sm" animated={true} />
                <h2 className="text-2xl font-bold text-white">Your HashMon NFTs</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Total: {nfts.length}</span>
                <button
                  onClick={fetchAllData}
                  disabled={loadingNFTs || loading || loadingBattles}
                  className="btn btn-outline btn-sm"
                  title="Refresh all data"
                >
                  {loadingNFTs || loading || loadingBattles ? '🔄' : '↻'}
                </button>
              </div>
            </div>
            
            {loadingNFTs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-300">Loading NFTs...</p>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No NFTs found</p>
                <p className="text-sm text-gray-500">Mint your HashMons to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nfts.map((nft, index) => (
                  <motion.div
                    key={nft.tokenId}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.08, y: -5, rotate: 1 }}
                    className="bg-gradient-to-br from-white/10 to-purple-900/20 backdrop-blur-sm rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-purple-500/70 transition-all shadow-lg hover:shadow-purple-500/50"
                    onClick={() => setSelectedNFT(nft)}
                    style={{ 
                      borderColor: HASHMON_TYPES[nft.type1]?.color || '#666',
                      boxShadow: `0 0 20px ${HASHMON_TYPES[nft.type1]?.color || '#666'}40`
                    }}
                  >
                    {/* NFT Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRarityColor(nft.type2) }}
                        ></div>
                        <span className="text-xs text-gray-400">#{String(nft.tokenId).padStart(3, '0')}</span>
                      </div>
                      <span className="text-blue-400 text-xs">⛓️</span>
                    </div>

                    {/* NFT Name */}
                    <h3 className="text-xl font-bold text-white mb-2 text-center">
                      {nft.name}
                    </h3>

                    {/* Type & Level */}
                    <div className="flex justify-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-600/30 rounded text-xs text-blue-300 capitalize">
                        {nft.type1}
                      </span>
                      <span className="px-2 py-1 bg-purple-600/30 rounded text-xs text-purple-300">
                        Lv.{nft.level}
                      </span>
                      <span className="px-2 py-1 bg-yellow-600/30 rounded text-xs text-yellow-300 capitalize">
                        {nft.type2 || 'common'}
                      </span>
                    </div>

                    {/* Stats Grid - Enhanced with animations */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="bg-gradient-to-br from-red-600/30 to-red-800/30 rounded p-2 text-center border border-red-500/50"
                      >
                        <div className="text-white font-bold">HP</div>
                        <div className="text-red-300 font-semibold">{nft.hp}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.75 + index * 0.1 }}
                        className="bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded p-2 text-center border border-orange-500/50"
                      >
                        <div className="text-white font-bold">ATK</div>
                        <div className="text-orange-300 font-semibold">{nft.attack}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded p-2 text-center border border-blue-500/50"
                      >
                        <div className="text-white font-bold">DEF</div>
                        <div className="text-blue-300 font-semibold">{nft.defense}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.85 + index * 0.1 }}
                        className="bg-gradient-to-br from-green-600/30 to-green-800/30 rounded p-2 text-center border border-green-500/50"
                      >
                        <div className="text-white font-bold">SPD</div>
                        <div className="text-green-300 font-semibold">{nft.speed}</div>
                      </motion.div>
                    </div>

                    {/* Explorer Link */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <a
                        href={`${import.meta.env.VITE_PHAROS_EXPLORER_URL || 'https://testnet.pharosscan.xyz'}/token/${import.meta.env.VITE_HASHMON_CONTRACT_ADDRESS}/${nft.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 text-center block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Explorer →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Battle History - Vertical Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-white/10 via-blue-900/20 to-indigo-900/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-blue-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PharosLogo size="sm" animated={true} />
                <h2 className="text-2xl font-bold text-white">Battle History</h2>
              </div>
              <span className="text-gray-400">Total: {battleHistory.length}</span>
            </div>
            
            {loadingBattles ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-300">Loading battles...</p>
              </div>
            ) : battleHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No battles yet</p>
                <p className="text-sm text-gray-500">Start battling to see your history!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {battleHistory.slice(0, 10).map((battle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      battle.result === 'win' 
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 hover:shadow-green-500/50' 
                        : battle.result === 'loss' 
                        ? 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/50 hover:shadow-red-500/50'
                        : 'bg-gradient-to-r from-gray-600/20 to-slate-600/20 border-gray-500/50 hover:shadow-gray-500/50'
                    } shadow-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.9 + idx * 0.1, type: "spring" }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          battle.result === 'win' ? 'bg-green-500/30' : battle.result === 'loss' ? 'bg-red-500/30' : 'bg-gray-500/30'
                        }`}
                      >
                        {battle.result === 'win' ? '🏆' : battle.result === 'loss' ? '💔' : '🤝'}
                      </motion.div>
                      <div>
                        <p className={`font-bold text-lg ${
                          battle.result === 'win' ? 'text-green-400' : battle.result === 'loss' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {battle.result === 'win' ? 'Victory' : battle.result === 'loss' ? 'Defeat' : 'Draw'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {battle.playerHashmon || 'Your HashMon'} vs {battle.opponentHashmon || 'Opponent'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">
                        {battle.timestamp ? new Date(battle.timestamp).toLocaleDateString() : 'Recent'}
                      </p>
                      {battle.xpEarned && (
                        <motion.p
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + idx * 0.1, type: "spring" }}
                          className="text-yellow-400 text-sm font-bold flex items-center gap-1"
                        >
                          ⭐ +{battle.xpEarned} XP
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Account Summary - Vertical Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-white/10 via-indigo-900/20 to-purple-900/20 backdrop-blur-md rounded-2xl p-6 border-2 border-indigo-500/30 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <PharosLogo size="sm" animated={true} />
              <h2 className="text-2xl font-bold text-white">Account Summary</h2>
            </div>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, type: "spring" }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border-2 border-green-500/50 shadow-lg hover:shadow-green-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span>⛓️</span> NFTs on Blockchain
                  </p>
                  <p className="text-gray-300 text-sm">
                    {nfts.length} HashMon{nfts.length !== 1 ? 's' : ''} minted
                  </p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="px-4 py-2 bg-green-500/30 text-green-400 rounded-full text-sm font-bold border border-green-500/50"
                >
                  {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, type: "spring" }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg border-2 border-blue-500/50 shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span>📦</span> Local Collection
                  </p>
                  <p className="text-gray-300 text-sm">
                    {localHashmons.length} HashMon{localHashmons.length !== 1 ? 's' : ''} caught
                  </p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring" }}
                  className="px-4 py-2 bg-blue-500/30 text-blue-400 rounded-full text-sm font-bold border border-blue-500/50"
                >
                  {localHashmons.length} Local
                </motion.span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, type: "spring" }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border-2 border-purple-500/50 shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span>🔗</span> Wallet Connected
                  </p>
                  <p className="text-gray-300 text-sm font-mono">
                    {user?.wallet?.address?.slice(0, 10)}...{user?.wallet?.address?.slice(-8)}
                  </p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="px-4 py-2 bg-purple-500/30 text-purple-400 rounded-full text-sm font-bold border border-purple-500/50 flex items-center gap-1"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedNFT(null)}>
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  #{String(selectedNFT.tokenId).padStart(3, '0')} {selectedNFT.name}
                </h2>
                <p className="text-sm text-gray-400">Token ID: {selectedNFT.tokenId}</p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedNFT(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 mb-4 text-center">
                  <div className="text-4xl mb-2">🔮</div>
                  <h3 className="text-xl font-bold text-white">{selectedNFT.name}</h3>
                  <p className="text-sm text-gray-200">Level {selectedNFT.level}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Type:</span>
                    <span className="text-white capitalize">{selectedNFT.type1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Rarity:</span>
                    <span className="text-white capitalize">{selectedNFT.type2 || 'common'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">XP:</span>
                    <span className="text-white">{selectedNFT.xp || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Stats</h3>
                <div className="space-y-3">
                  {[
                    { name: 'HP', value: selectedNFT.hp, color: 'red' },
                    { name: 'Attack', value: selectedNFT.attack, color: 'orange' },
                    { name: 'Defense', value: selectedNFT.defense, color: 'blue' },
                    { name: 'Speed', value: selectedNFT.speed, color: 'green' }
                  ].map((stat) => (
                    <div key={stat.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{stat.name}:</span>
                        <span className="text-white font-bold">{stat.value}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-${stat.color}-500 h-2 rounded-full`}
                          style={{ width: `${(stat.value / 300) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <a
                href={`${import.meta.env.VITE_PHAROS_EXPLORER_URL || 'https://testnet.pharosscan.xyz'}/token/${import.meta.env.VITE_HASHMON_CONTRACT_ADDRESS}/${selectedNFT.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

