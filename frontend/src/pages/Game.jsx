import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Settings, 
  Trophy, 
  User, 
  Zap, 
  Heart,
  Shield,
  Swords,
  Star,
  ChevronRight,
  Gamepad2
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useWallet } from '../contexts/WalletContext'
import { toast } from 'react-hot-toast'

const Game = () => {
  const { 
    player, 
    hashmons, 
    selectedHashmon, 
    selectHashmon, 
    stats,
    isLoading,
    loadPlayerData
  } = useGame()
  const { account, isConnected } = useWallet()
  const [selectedDifficulty, setSelectedDifficulty] = useState(5)
  const [showHashmonSelect, setShowHashmonSelect] = useState(false)

  useEffect(() => {
    if (isConnected && account && !player) {
      loadPlayerData(account)
    }
  }, [isConnected, account, player, loadPlayerData])

  const difficulties = [
    { value: 1, label: 'Easy', color: 'from-green-500 to-emerald-500' },
    { value: 3, label: 'Medium', color: 'from-yellow-500 to-orange-500' },
    { value: 5, label: 'Hard', color: 'from-orange-500 to-red-500' },
    { value: 8, label: 'Expert', color: 'from-red-500 to-purple-500' },
    { value: 10, label: 'Legendary', color: 'from-purple-500 to-pink-500' }
  ]

  const handleStartBattle = () => {
    if (!selectedHashmon) {
      toast.error('Please select a HashMon first')
      setShowHashmonSelect(true)
      return
    }
    
    // Navigate to battle page with selected HashMon and difficulty
    window.location.href = `/battle?hashmon=${selectedHashmon.id}&difficulty=${selectedDifficulty}`
  }

  const handleHashmonSelect = (hashmon) => {
    selectHashmon(hashmon)
    setShowHashmonSelect(false)
    toast.success(`Selected ${hashmon.name}`)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="w-24 h-24 text-white/30 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/70 mb-8">Connect your wallet to start playing HashMon</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/70">Loading your HashMons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">
            HashMon Arena
          </h1>
          <p className="text-xl text-white/70">
            Choose your HashMon and battle AI opponents
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - HashMon Selection */}
          <div className="lg:col-span-2">
            {/* Selected HashMon */}
            {selectedHashmon ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Selected HashMon</h2>
                  <button
                    onClick={() => setShowHashmonSelect(true)}
                    className="btn btn-outline text-sm"
                  >
                    Change
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* HashMon Image/Stats */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <div className="text-6xl">🔥</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedHashmon.name}</h3>
                    <p className="text-white/60">Level {selectedHashmon.level}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        <span className="text-white">HP</span>
                      </div>
                      <span className="text-white font-bold">{selectedHashmon.hp}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Swords className="w-5 h-5 text-orange-400" />
                        <span className="text-white">Attack</span>
                      </div>
                      <span className="text-white font-bold">{selectedHashmon.attack}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Defense</span>
                      </div>
                      <span className="text-white font-bold">{selectedHashmon.defense}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Speed</span>
                      </div>
                      <span className="text-white font-bold">{selectedHashmon.speed}</span>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm">XP</span>
                        </div>
                        <span className="text-white/60 text-sm">{selectedHashmon.xp || 0} / {selectedHashmon.level * 100}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((selectedHashmon.xp || 0) / (selectedHashmon.level * 100)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-8"
              >
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No HashMon Selected</h3>
                  <p className="text-white/60 mb-6">Choose a HashMon to start battling</p>
                  <button
                    onClick={() => setShowHashmonSelect(true)}
                    className="btn btn-primary"
                  >
                    Select HashMon
                  </button>
                </div>
              </motion.div>
            )}

            {/* HashMon Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Your HashMons</h2>
              
              {hashmons.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hashmons.map((hashmon) => (
                    <motion.div
                      key={hashmon.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHashmonSelect(hashmon)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedHashmon?.id === hashmon.id
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                          <div className="text-2xl">🔥</div>
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1">{hashmon.name}</h4>
                        <p className="text-white/60 text-xs">Level {hashmon.level}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No HashMons found</p>
                  <button className="btn btn-primary text-sm">
                    Get Starter HashMon
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Battle Settings */}
          <div className="space-y-6">
            {/* Difficulty Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-white mb-4">Battle Difficulty</h2>
              <div className="space-y-3">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.value}
                    onClick={() => setSelectedDifficulty(difficulty.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedDifficulty === difficulty.value
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{difficulty.label}</span>
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${difficulty.color}`} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Player Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-white mb-4">Your Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Level</span>
                  <span className="text-white font-bold">{player?.level || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Battles</span>
                  <span className="text-white font-bold">{stats.totalBattles || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Wins</span>
                  <span className="text-white font-bold text-green-400">{stats.wins || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Losses</span>
                  <span className="text-white font-bold text-red-400">{stats.losses || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Win Rate</span>
                  <span className="text-white font-bold">{stats.winRate || 0}%</span>
                </div>
              </div>
            </motion.div>

            {/* Battle Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <button
                onClick={handleStartBattle}
                disabled={!selectedHashmon}
                className="btn btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Start Battle
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/collection"
                  className="btn btn-outline text-center py-3"
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  Collection
                </Link>
                <Link
                  to="/leaderboard"
                  className="btn btn-outline text-center py-3"
                >
                  <Trophy className="w-5 h-5 mx-auto mb-1" />
                  Rankings
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HashMon Selection Modal */}
      <AnimatePresence>
        {showHashmonSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHashmonSelect(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Select HashMon</h2>
                <button
                  onClick={() => setShowHashmonSelect(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {hashmons.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hashmons.map((hashmon) => (
                    <motion.button
                      key={hashmon.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHashmonSelect(hashmon)}
                      className="p-4 rounded-xl border-2 border-white/20 bg-white/5 hover:border-yellow-400 hover:bg-yellow-400/10 transition-all"
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                          <div className="text-3xl">🔥</div>
                        </div>
                        <h4 className="text-white font-bold mb-1">{hashmon.name}</h4>
                        <p className="text-white/60 text-sm">Level {hashmon.level}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-6">No HashMons available</p>
                  <button className="btn btn-primary">
                    Get Starter HashMon
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Game

