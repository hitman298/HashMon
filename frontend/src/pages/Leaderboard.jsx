import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import api from '../services/api';

const Leaderboard = () => {
  const { address, isConnected } = useWallet();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('total_xp');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/player/leaderboard?sortBy=${sortBy}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Mock data for demo
      setPlayers([
        {
          username: 'HashMaster',
          total_xp: 2500,
          total_battles: 45,
          wins: 38,
          losses: 7,
          level: 12
        },
        {
          username: 'PharosChampion',
          total_xp: 2200,
          total_battles: 42,
          wins: 35,
          losses: 7,
          level: 11
        },
        {
          username: 'CryptoTrainer',
          total_xp: 1800,
          total_battles: 35,
          wins: 28,
          losses: 7,
          level: 9
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  const getWinRate = (wins, totalBattles) => {
    if (totalBattles === 0) return '0%';
    return `${Math.round((wins / totalBattles) * 100)}%`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
            <p className="text-gray-300 text-lg">Top HashMon Trainers</p>
          </div>

          {/* Sort Options */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex space-x-2">
              {[
                { key: 'total_xp', label: 'Total XP' },
                { key: 'wins', label: 'Victories' },
                { key: 'total_battles', label: 'Battles' },
                { key: 'level', label: 'Level' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    sortBy === option.key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading leaderboard...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Rank</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Trainer</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Level</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Total XP</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Battles</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <motion.tr
                        key={player.username}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                          player.wallet_address === address ? 'bg-purple-500/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-2xl">
                            {getRankIcon(index)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {player.username?.charAt(0) || 'P'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {player.username || 'Anonymous'}
                              </p>
                              {player.wallet_address === address && (
                                <p className="text-xs text-purple-400">You</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            Level {player.level || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-400 font-bold">
                            {player.total_xp?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">
                            {player.total_battles || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${
                            parseInt(getWinRate(player.wins, player.total_battles)) >= 70 
                              ? 'text-green-400' 
                              : parseInt(getWinRate(player.wins, player.total_battles)) >= 50 
                                ? 'text-yellow-400' 
                                : 'text-red-400'
                          }`}>
                            {getWinRate(player.wins, player.total_battles)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {players.length}
              </h3>
              <p className="text-gray-300">Total Trainers</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                {players.reduce((sum, p) => sum + (p.total_battles || 0), 0)}
              </h3>
              <p className="text-gray-300">Total Battles</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">
                {players.reduce((sum, p) => sum + (p.total_xp || 0), 0).toLocaleString()}
              </h3>
              <p className="text-gray-300">Total XP Earned</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

