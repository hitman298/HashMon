import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Play, 
  Zap, 
  Trophy, 
  Users, 
  Gamepad2, 
  Star,
  TrendingUp,
  Shield,
  Coins,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useGame } from '../contexts/GameContext'
import PharosLogo from '../components/PharosLogo'

const Home = () => {
  const { isConnected, connectWallet } = useWallet()
  const { loadPlayerData, player, stats, hashmons } = useGame()

  useEffect(() => {
    if (isConnected && !player) {
      // Load player data when wallet connects
      // This would need the wallet address from context
    }
  }, [isConnected, player])

  const features = [
    {
      icon: Gamepad2,
      title: 'Epic Battles',
      description: 'Battle with AI opponents using strategic moves and type advantages',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Zap,
      title: 'Level Up',
      description: 'Gain XP and level up your HashMon to unlock new abilities',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Trophy,
      title: 'Competitive',
      description: 'Climb the leaderboards and prove you\'re the best trainer',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Coins,
      title: 'NFT Rewards',
      description: 'Mint unique HashMon NFTs as rewards for your victories',
      color: 'from-green-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Built on Pharos Network with blockchain security',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Scalable',
      description: 'Experience high TPS and low fees on Pharos',
      color: 'from-teal-500 to-green-500'
    }
  ]

  const statsData = [
    { label: 'Active Players', value: '1,234', icon: Users },
    { label: 'HashMons Minted', value: '5,678', icon: Sparkles },
    { label: 'Battles Fought', value: '12,345', icon: Gamepad2 },
    { label: 'Total XP Earned', value: '987,654', icon: Star }
  ]

  return (
    <div className="min-h-screen pt-16" style={{ background: '#000000' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <PharosLogo size="xl" animated={true} />
                <h1 className="text-6xl md:text-8xl font-black">
                  HashMon
                </h1>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/50">
                  Powered by Pharos Network
                </span>
              </div>
              <p className="text-xl md:text-2xl text-white/80 mb-8 font-medium">
                Battle, Collect & Mint Pokémon NFTs on Pharos Network
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              {isConnected ? (
                <>
                  <Link
                    to="/game"
                    className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3"
                  >
                    <Play className="w-6 h-6" />
                    Start Playing
                  </Link>
                  <Link
                    to="/collection"
                    className="btn btn-outline text-lg px-8 py-4 flex items-center gap-3"
                  >
                    View Collection
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Connect Wallet to Play
                </button>
              )}
            </motion.div>

            {/* Player Stats Preview */}
            {isConnected && player && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
              >
                <div className="card text-center">
                  <p className="text-white/60 text-sm mb-1">HashMons</p>
                  <p className="text-2xl font-bold text-white">{hashmons.length}</p>
                </div>
                <div className="card text-center">
                  <p className="text-white/60 text-sm mb-1">Level</p>
                  <p className="text-2xl font-bold text-white">{player.level || 1}</p>
                </div>
                <div className="card text-center">
                  <p className="text-white/60 text-sm mb-1">Battles</p>
                  <p className="text-2xl font-bold text-white">{stats.totalBattles || 0}</p>
                </div>
                <div className="card text-center">
                  <p className="text-white/60 text-sm mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.winRate || 0}%</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Why Choose HashMon?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Experience the future of gaming with blockchain technology, 
              strategic battles, and unique NFT rewards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Game Statistics
            </h2>
            <p className="text-xl text-white/70">
              Join thousands of players in the HashMon universe
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-white/60 font-medium">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Connect your wallet, choose your starter HashMon, and begin your adventure in the world of blockchain gaming.
            </p>
            
            {isConnected ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/game"
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3"
                >
                  <Gamepad2 className="w-6 h-6" />
                  Enter Game
                </Link>
                <Link
                  to="/battle"
                  className="btn btn-secondary text-lg px-8 py-4 flex items-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Quick Battle
                </Link>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
              >
                <Zap className="w-6 h-6" />
                Connect Wallet & Play
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PharosLogo size="md" animated={true} />
              <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                HashMon
              </span>
              <span className="text-sm px-2 py-1 bg-blue-600/30 text-blue-300 rounded-full">
                Pharos
              </span>
            </div>
            <p className="text-white/60 mb-4">
              Built on <strong className="text-blue-400">Pharos Network</strong> • Powered by Web3 Technology
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

