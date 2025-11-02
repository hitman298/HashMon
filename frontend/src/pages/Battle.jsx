import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy } from '@privy-io/react-auth'
import { gameAPI } from '../services/api'
import { HASHMON_TYPES } from '../services/hashmonService'
import PharosLogo from '../components/PharosLogo'

const DEFAULT_MOVES = {
  fire: [
    { name: 'Ember', power: 40, type: 'fire', accuracy: 0.95 },
    { name: 'Flame Burst', power: 70, type: 'fire', accuracy: 0.9 },
    { name: 'Fire Spin', power: 60, type: 'fire', accuracy: 0.85 }
  ],
  water: [
    { name: 'Water Gun', power: 40, type: 'water', accuracy: 0.95 },
    { name: 'Aqua Tail', power: 70, type: 'water', accuracy: 0.9 },
    { name: 'Hydro Cannon', power: 100, type: 'water', accuracy: 0.8 }
  ],
  grass: [
    { name: 'Vine Whip', power: 45, type: 'grass', accuracy: 0.95 },
    { name: 'Leaf Blade', power: 70, type: 'grass', accuracy: 0.9 },
    { name: 'Solar Beam', power: 110, type: 'grass', accuracy: 0.75 }
  ],
  electric: [
    { name: 'Thunder Shock', power: 40, type: 'electric', accuracy: 0.95 },
    { name: 'Spark Surge', power: 70, type: 'electric', accuracy: 0.9 },
    { name: 'Thunder Crash', power: 110, type: 'electric', accuracy: 0.75 }
  ],
  psychic: [
    { name: 'Confusion', power: 50, type: 'psychic', accuracy: 0.95 },
    { name: 'Mind Spike', power: 75, type: 'psychic', accuracy: 0.9 },
    { name: 'Psy Strike', power: 100, type: 'psychic', accuracy: 0.85 }
  ],
  dark: [
    { name: 'Shadow Claw', power: 60, type: 'dark', accuracy: 0.95 },
    { name: 'Night Slash', power: 75, type: 'dark', accuracy: 0.9 },
    { name: 'Void Burst', power: 95, type: 'dark', accuracy: 0.8 }
  ],
  normal: [
    { name: 'Quick Attack', power: 45, type: 'normal', accuracy: 0.97 },
    { name: 'Power Strike', power: 70, type: 'normal', accuracy: 0.9 },
    { name: 'Guard Break', power: 60, type: 'normal', accuracy: 0.85 }
  ]
}

const normalizeType = (value, fallback = 'normal') => {
  if (!value) return fallback
  const normalized = String(value).toLowerCase().trim()
  return normalized || fallback
}

const normalizeAccuracy = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.9
  }
  return value > 1 ? Math.min(value / 100, 1) : Math.max(0, Math.min(value, 1))
}

const getDefaultMovesForType = (type) => {
  const normalized = normalizeType(type)
  return DEFAULT_MOVES[normalized] || DEFAULT_MOVES.normal
}

const normalizeMoves = (moves, type) => {
  if (Array.isArray(moves) && moves.length > 0) {
    return moves.map((move, index) => ({
      name: move?.name || `Move ${index + 1}`,
      power: Number(move?.power ?? 50),
      type: normalizeType(move?.type, type),
      accuracy: normalizeAccuracy(move?.accuracy)
    }))
  }
  return getDefaultMovesForType(type)
}

const normalizeHashmon = (raw = {}, fallback = {}) => {
  try {
    const type = normalizeType(raw.type || raw.type1 || fallback.type || fallback.type1 || 'normal')
  const statsSource = raw.stats || fallback.stats || {}

  const stats = {
      hp: Number(raw.hp ?? statsSource.hp ?? fallback.hp ?? fallback.stats?.hp ?? 100),
      attack: Number(raw.attack ?? statsSource.attack ?? fallback.attack ?? fallback.stats?.attack ?? 60),
      defense: Number(raw.defense ?? statsSource.defense ?? fallback.defense ?? fallback.stats?.defense ?? 60),
      speed: Number(raw.speed ?? statsSource.speed ?? fallback.speed ?? fallback.stats?.speed ?? 60)
  }

  const maxStatsSource = raw.maxStats || fallback.maxStats || {}
  const maxStats = {
    hp: Number(raw.maxHp ?? maxStatsSource.hp ?? fallback.maxHp ?? stats.hp),
    attack: Number(maxStatsSource.attack ?? stats.attack),
    defense: Number(maxStatsSource.defense ?? stats.defense),
    speed: Number(maxStatsSource.speed ?? stats.speed)
  }

  return {
    ...fallback,
    ...raw,
      id: raw.id || fallback.id || `hashmon-${Date.now()}`,
    name: raw.name || fallback.name || 'Unknown HashMon',
    level: Number(raw.level ?? fallback.level ?? 1),
    xp: Number(raw.xp ?? raw.experience ?? fallback.xp ?? fallback.experience ?? 0),
    xpToNext: Number(raw.xpToNext ?? fallback.xpToNext ?? ((Number(raw.level ?? fallback.level ?? 1)) * 100)),
    type,
    type1: type,
    type2: normalizeType(raw.type2 || fallback.type2 || ''),
    stats,
    maxStats,
    moves: normalizeMoves(raw.moves || fallback.moves, type)
    }
  } catch (error) {
    console.error('Error normalizing HashMon:', error)
    return {
      id: `error-${Date.now()}`,
      name: 'Error HashMon',
      level: 1,
      type: 'normal',
      type1: 'normal',
      type2: '',
      stats: { hp: 100, attack: 60, defense: 60, speed: 60 },
      maxStats: { hp: 100, attack: 60, defense: 60, speed: 60 },
      moves: DEFAULT_MOVES.normal,
      xp: 0,
      xpToNext: 100
    }
  }
}

const Battle = ({ onNavigate }) => {
  const { authenticated, user } = usePrivy()
  const [availableHashmons, setAvailableHashmons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const handleNavigate = useCallback((page) => {
    if (typeof onNavigate === 'function') {
      onNavigate(page)
    }
  }, [onNavigate])

  const [playerHashmon, setPlayerHashmon] = useState(null)
  const [opponentHashmon, setOpponentHashmon] = useState(null)
  const [battleId, setBattleId] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [battleEnded, setBattleEnded] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [isSelectingHashmon, setIsSelectingHashmon] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [difficulty, setDifficulty] = useState(5)
  const [damageAnimation, setDamageAnimation] = useState({ player: 0, opponent: 0 })
  const [battleStats, setBattleStats] = useState({ moves: 0, damageDealt: 0, damageTaken: 0 })
  const [showBattleIntro, setShowBattleIntro] = useState(false)
  const [attackEffect, setAttackEffect] = useState({ type: null, target: null })
  const [moveAnnouncement, setMoveAnnouncement] = useState({ show: false, playerMove: null, enemyMove: null, playerDamage: 0, enemyDamage: 0 })

  // Load player's HashMons
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadPlayerHashmons()
    } else {
      setLoading(false)
    }
  }, [authenticated, user])

  const loadPlayerHashmons = async () => {
    setLoading(true)
    setError(null)
    
    try {
    const fallbackFromLocalStorage = () => {
        try {
      const collection = JSON.parse(localStorage.getItem(`hashmon_collection_${user.wallet.address}`) || '[]')
          return Array.isArray(collection) 
            ? collection.map(hashmon => normalizeHashmon(hashmon)).filter(hashmon => (hashmon.stats?.hp ?? hashmon.hp ?? 0) > 0)
            : []
        } catch (e) {
          console.error('Error reading localStorage:', e)
          return []
        }
    }

    const tryCreateStarter = async () => {
      try {
        const starterResponse = await gameAPI.createStarterHashmon(user.wallet.address, 'fire')
        if (starterResponse?.hashmon) {
          const starter = normalizeHashmon(starterResponse.hashmon)
          const existingCollection = fallbackFromLocalStorage()
          const updatedCollection = [...existingCollection, starter]
          localStorage.setItem(`hashmon_collection_${user.wallet.address}`, JSON.stringify(updatedCollection))
          return updatedCollection
        }
      } catch (err) {
        console.warn('Unable to create starter HashMon via backend:', err)
      }

      const placeholder = normalizeHashmon({
        id: `starter-${Date.now()}`,
        name: 'Flameon (Starter)',
        level: 3,
        type: 'fire',
        stats: { hp: 65, attack: 60, defense: 55, speed: 60 }
      })
      const updatedCollection = [placeholder]
        try {
      localStorage.setItem(`hashmon_collection_${user.wallet.address}`, JSON.stringify(updatedCollection))
        } catch (e) {
          console.error('Error saving to localStorage:', e)
        }
      return updatedCollection
    }

    try {
      const response = await gameAPI.getPlayerHashmons(user.wallet.address)
      if (response && Array.isArray(response.hashmons) && response.hashmons.length > 0) {
        const normalizedHashmons = response.hashmons
          .map(hashmon => normalizeHashmon(hashmon))
          .filter(hashmon => (hashmon.stats?.hp ?? hashmon.hp ?? 0) > 0)
        setAvailableHashmons(normalizedHashmons)
          setLoading(false)
        return
      }
    } catch (error) {
      console.error('Failed to load HashMons from backend:', error)
    }

    let normalizedCollection = fallbackFromLocalStorage()

    if (normalizedCollection.length === 0) {
      normalizedCollection = await tryCreateStarter()
    }

    setAvailableHashmons(normalizedCollection)
    } catch (err) {
      console.error('Error loading HashMons:', err)
      setError(err.message || 'Failed to load HashMons')
      setAvailableHashmons([])
    } finally {
      setLoading(false)
    }
  }

  const startBattle = useCallback(() => {
    if (availableHashmons.length === 0) {
      alert('You need at least one healthy HashMon to battle!')
      return
    }
    setIsSelectingHashmon(true)
  }, [availableHashmons.length])

  const selectHashmon = async (hashmon) => {
    setIsSelectingHashmon(false)
    setIsProcessing(true)
    setError(null)
    
    try {
      const selectedHashmon = normalizeHashmon(hashmon)
      let response;
      let battleId;

      try {
        response = await gameAPI.startBattle(
        user.wallet.address,
        hashmon.id,
        difficulty
      )

        if (response && response.battleId) {
          battleId = response.battleId
        }
      } catch (apiError) {
        console.warn('Backend battle start failed, using local fallback:', apiError)
        battleId = `local-battle-${Date.now()}`
        
        response = {
          battleId: battleId,
          playerHashmon: selectedHashmon,
          aiOpponent: null
        }
      }

      let aiOpponent = response?.aiOpponent
      if (!aiOpponent) {
        const baseLevel = Math.max(1, selectedHashmon.level - 2 + Math.floor(Math.random() * 5))
        const level = Math.min(100, baseLevel + difficulty - 1)
        const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dark', 'normal']
        const type = types[Math.floor(Math.random() * types.length)]
        
        const statMultiplier = 1 + (difficulty - 1) * 0.2
        const baseStats = {
          hp: 50 + (level * 10),
          attack: 40 + (level * 8),
          defense: 40 + (level * 8),
          speed: 35 + (level * 7)
        }

        aiOpponent = {
          id: `ai-${Date.now()}`,
          name: `Wild ${type.charAt(0).toUpperCase() + type.slice(1)} Beast`,
          level: level,
          type: type,
          type1: type,
          type2: '',
          stats: {
            hp: Math.floor(baseStats.hp * statMultiplier),
            attack: Math.floor(baseStats.attack * statMultiplier),
            defense: Math.floor(baseStats.defense * statMultiplier),
            speed: Math.floor(baseStats.speed * statMultiplier)
          },
          maxStats: {
            hp: Math.floor(baseStats.hp * statMultiplier),
            attack: Math.floor(baseStats.attack * statMultiplier),
            defense: Math.floor(baseStats.defense * statMultiplier),
            speed: Math.floor(baseStats.speed * statMultiplier)
          },
          moves: getDefaultMovesForType(type)
        }
      }

      setBattleId(battleId)
      const enrichedPlayer = normalizeHashmon(response?.playerHashmon || selectedHashmon, selectedHashmon)
      const enrichedOpponent = normalizeHashmon(aiOpponent)
      setPlayerHashmon(enrichedPlayer)
      setOpponentHashmon(enrichedOpponent)
      setBattleLog([`⚔️ Battle started! ${enrichedPlayer.name} vs ${enrichedOpponent.name}`])
    setIsPlayerTurn(true)
    setBattleEnded(false)
    setBattleResult(null)
      setBattleStats({ moves: 0, damageDealt: 0, damageTaken: 0 })
      setShowBattleIntro(true)
      
      setTimeout(() => {
        setShowBattleIntro(false)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to start battle:', error)
      setError(error.message || 'Failed to start battle')
      alert('Failed to start battle: ' + (error.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const executeMove = async (move) => {
    if (!isPlayerTurn || battleEnded || isProcessing || !battleId || !move) return

    setIsProcessing(true)
    setIsPlayerTurn(false)
    setError(null)

    // Show attack effect
    setAttackEffect({ type: move.type, target: 'opponent' })
    setTimeout(() => setAttackEffect({ type: null, target: null }), 600)

    try {
      let response;
      let result;
      const isLocalBattle = battleId.startsWith('local-battle-')
      
      if (isLocalBattle) {
        result = executeLocalBattleMove(playerHashmon, opponentHashmon, move)
      } else {
        try {
          response = await gameAPI.executeBattleMove(battleId, move, null)
          if (!response || !response.result) {
            throw new Error('Invalid battle response')
          }
          result = response.result
        } catch (apiError) {
          console.warn('Backend move execution failed, using local fallback:', apiError)
          result = executeLocalBattleMove(playerHashmon, opponentHashmon, move)
        }
      }

      const playerMoveResult = result.moveResults?.playerMove || {}
      const aiMoveResult = result.moveResults?.aiMove || {}

      const updatedOpponent = result.aiOpponent
        ? normalizeHashmon(result.aiOpponent, opponentHashmon)
        : opponentHashmon
      const updatedPlayer = result.playerHashmon
        ? normalizeHashmon(result.playerHashmon, playerHashmon)
        : playerHashmon

      setOpponentHashmon(updatedOpponent || opponentHashmon)

      const playerName = updatedPlayer?.name || playerHashmon?.name || 'Your HashMon'
      const opponentName = updatedOpponent?.name || opponentHashmon?.name || 'Opponent'

      // Get AI move for display (random selection)
      const aiMoveForDisplay = aiMoveResult?.name 
        ? aiMoveResult 
        : (updatedOpponent?.moves?.[Math.floor(Math.random() * (updatedOpponent?.moves?.length || 1))] || { name: 'Attack', type: 'Normal' })

      // ALWAYS show player move announcement and damage animation
      const playerDamageAmount = playerMoveResult?.damage || 0
      
      // Always show player move announcement (even if no damage)
      setMoveAnnouncement({
        show: true,
        playerMove: { name: move.name, damage: playerDamageAmount, target: 'opponent' },
        enemyMove: null,
        playerDamage: 0,
        enemyDamage: playerDamageAmount
      })
      
      if (playerDamageAmount > 0) {
        // Set damage animation immediately (with delay to ensure visibility)
        setTimeout(() => {
          setDamageAnimation(prev => ({ ...prev, opponent: playerDamageAmount }))
        }, 500)
        setBattleStats(prev => ({ ...prev, damageDealt: prev.damageDealt + playerDamageAmount }))
      }
        
      // Clear player announcement after 4 seconds (SLOWER), then show enemy move
      setTimeout(() => {
        setMoveAnnouncement({ show: false, playerMove: null, enemyMove: null, playerDamage: 0, enemyDamage: 0 })
        
      setTimeout(() => {
        const refreshedPlayer = updatedPlayer || playerHashmon
        const refreshedOpponent = updatedOpponent || opponentHashmon
          const aiMoveName = aiMoveResult?.name || aiMoveForDisplay?.name || refreshedOpponent?.moves?.[Math.floor(Math.random() * (refreshedOpponent?.moves?.length || 1))]?.name || 'Attack'
          const aiMoveType = aiMoveResult?.type || aiMoveForDisplay?.type || 'normal'
          const aiDamageAmount = aiMoveResult?.damage || 0

          // ALWAYS show enemy move announcement (even if no damage)
          console.log('Showing enemy attack:', { aiMoveName, aiDamageAmount, aiMoveType })
          
          setAttackEffect({ type: aiMoveType, target: 'player' })
          setTimeout(() => setAttackEffect({ type: null, target: null }), 800)
          
          // Show enemy move announcement with damage (4 seconds display)
          setMoveAnnouncement({
            show: true,
            playerMove: null,
            enemyMove: { name: aiMoveName, damage: aiDamageAmount, target: 'player' },
            playerDamage: aiDamageAmount,
            enemyDamage: 0
          })
          
          // Set damage animation for player if damage > 0 (with delay to ensure visibility)
          if (aiDamageAmount > 0) {
            setTimeout(() => {
              setDamageAnimation(prev => ({ ...prev, player: aiDamageAmount }))
            }, 500)
            setBattleStats(prev => ({ ...prev, damageTaken: prev.damageTaken + aiDamageAmount }))
          }
          
          // Clear enemy announcement after 4 seconds
          setTimeout(() => {
            setMoveAnnouncement({ show: false, playerMove: null, enemyMove: null, playerDamage: 0, enemyDamage: 0 })
          }, 4000)
        }, 1000)
      }, 4000)
      // Even if no player damage, still show enemy move after delay
      if (playerDamageAmount === 0) {
        setTimeout(() => {
          const refreshedPlayer = updatedPlayer || playerHashmon
          const refreshedOpponent = updatedOpponent || opponentHashmon
          const aiMoveName = aiMoveResult?.name || aiMoveForDisplay?.name || refreshedOpponent?.moves?.[Math.floor(Math.random() * (refreshedOpponent?.moves?.length || 1))]?.name || 'Attack'
          const aiMoveType = aiMoveResult?.type || aiMoveForDisplay?.type || 'normal'
          const aiDamageAmount = aiMoveResult?.damage || 0

          // ALWAYS show enemy move announcement
          console.log('Showing enemy attack (no player damage):', { aiMoveName, aiDamageAmount, aiMoveType })
          
          setAttackEffect({ type: aiMoveType, target: 'player' })
          setTimeout(() => setAttackEffect({ type: null, target: null }), 800)
          
          setMoveAnnouncement({
            show: true,
            playerMove: null,
            enemyMove: { name: aiMoveName, damage: aiDamageAmount, target: 'player' },
            playerDamage: aiDamageAmount,
            enemyDamage: 0
          })
          
          // Set damage animation for player if damage > 0 (with delay to ensure visibility)
          if (aiDamageAmount > 0) {
            setTimeout(() => {
              setDamageAnimation(prev => ({ ...prev, player: aiDamageAmount }))
            }, 500)
            setBattleStats(prev => ({ ...prev, damageTaken: prev.damageTaken + aiDamageAmount }))
          }
          
          setTimeout(() => {
            setMoveAnnouncement({ show: false, playerMove: null, enemyMove: null, playerDamage: 0, enemyDamage: 0 })
          }, 4000)
        }, 2000)
      }

      // Delay state updates to allow animations to complete (SLOWER - users spend more time)
      setTimeout(() => {
        const refreshedPlayer = updatedPlayer || playerHashmon
        const refreshedOpponent = updatedOpponent || opponentHashmon

        setPlayerHashmon(refreshedPlayer)

        if (result.battleComplete) {
          handleBattleComplete({ ...result, playerHashmon: refreshedPlayer, aiOpponent: refreshedOpponent })
    } else {
          setIsPlayerTurn(true)
          setBattleStats(prev => ({ ...prev, moves: prev.moves + 1 }))
          
          const playerHp = refreshedPlayer.stats?.hp ?? refreshedPlayer.hp ?? 0
          const opponentHp = refreshedOpponent.stats?.hp ?? refreshedOpponent.hp ?? 0
          
          if (playerHp <= 0 || opponentHp <= 0) {
            handleBattleComplete({ ...result, playerHashmon: refreshedPlayer, aiOpponent: refreshedOpponent })
          }
        }
        setIsProcessing(false)
        // Clear damage animations after all animations complete
        setTimeout(() => {
          setDamageAnimation({ player: 0, opponent: 0 })
        }, 500)
      }, 7000) // Total 7 seconds for both moves + animations (SLOWER)

    } catch (error) {
      console.error('Battle move error:', error)
      setError(error.message || 'Failed to execute move')
      setIsProcessing(false)
      setIsPlayerTurn(true)
    }
  }

  const executeLocalBattleMove = (player, opponent, playerMove) => {
    const playerAttack = player.stats?.attack || player.attack || 60
    const opponentDefense = opponent.stats?.defense || opponent.defense || 60
    const movePower = playerMove.power || 50
    const moveAccuracy = playerMove.accuracy || 0.9
    
    const playerHit = Math.random() < moveAccuracy
    const playerDamage = playerHit 
      ? Math.max(1, Math.floor((playerAttack * movePower) / opponentDefense * (0.85 + Math.random() * 0.15)))
      : 0
    
    const aiMoves = opponent.moves || getDefaultMovesForType(opponent.type || 'normal')
    const aiMove = aiMoves[Math.floor(Math.random() * aiMoves.length)]
    const aiAttack = opponent.stats?.attack || opponent.attack || 60
    const playerDefense = player.stats?.defense || player.defense || 60
    const aiMovePower = aiMove.power || 50
    const aiMoveAccuracy = aiMove.accuracy || 0.9
    
    const aiHit = Math.random() < aiMoveAccuracy
    const aiDamage = aiHit
      ? Math.max(1, Math.floor((aiAttack * aiMovePower) / playerDefense * (0.85 + Math.random() * 0.15)))
      : 0
    
    const updatedOpponentHp = Math.max(0, (opponent.stats?.hp || opponent.hp || 0) - playerDamage)
    const updatedPlayerHp = Math.max(0, (player.stats?.hp || player.hp || 0) - aiDamage)
    
    const updatedOpponent = {
      ...opponent,
      stats: {
        ...opponent.stats,
        hp: updatedOpponentHp
      },
      hp: updatedOpponentHp
    }
    
    const updatedPlayer = {
      ...player,
      stats: {
        ...player.stats,
        hp: updatedPlayerHp
      },
      hp: updatedPlayerHp
    }
    
    const battleComplete = updatedOpponentHp <= 0 || updatedPlayerHp <= 0
    let battleResult = 'ongoing'
    let xpGained = 0
    let levelUp = false
    let newLevel = player.level || 1
    
    if (battleComplete) {
      if (updatedOpponentHp <= 0) {
        battleResult = 'victory'
        xpGained = Math.floor((opponent.level || 1) * 10)
        const requiredXP = (player.level || 1) * 100
        const newXP = (player.xp || 0) + xpGained
        if (newXP >= requiredXP) {
          levelUp = true
          newLevel = (player.level || 1) + 1
        }
      } else if (updatedPlayerHp <= 0) {
        battleResult = 'defeat'
        xpGained = Math.floor((opponent.level || 1) * 1)
      } else {
        battleResult = 'draw'
        xpGained = Math.floor((opponent.level || 1) * 5)
      }
    }
    
    return {
      battleComplete,
      result: battleResult,
      playerHashmon: updatedPlayer,
      aiOpponent: updatedOpponent,
      xpGained,
      levelUp,
      newLevel: levelUp ? newLevel : (player.level || 1),
      moveResults: {
        playerMove: {
          name: playerMove.name,
          damage: playerDamage,
          type: playerMove.type || 'normal',
          power: playerMove.power || 50
        },
        aiMove: {
          name: aiMove.name,
          damage: aiDamage,
          type: aiMove.type || 'normal',
          power: aiMove.power || 50
        }
      }
    }
  }

  const handleBattleComplete = (result) => {
    setBattleEnded(true)
    setBattleResult(result.result || 'draw')
    
    const playerData = result.playerHashmon || playerHashmon
    const playerName = playerData?.name || 'Your HashMon'
    const xpGained = result.xpGained || 0
    const levelUp = result.levelUp || false
    const newLevel = result.newLevel || playerData?.level || playerHashmon?.level || 1

    if (result.result === 'victory') {
      setBattleLog(prev => [
        ...prev,
        `🎉 ${playerName} gained ${xpGained} XP!`,
        levelUp ? `🌟 Level Up! ${playerName} is now level ${newLevel}!` : '',
        '🏆 VICTORY! You won the battle!'
      ].filter(Boolean))

      setTimeout(() => {
        loadPlayerHashmons()
      }, 2000)
    } else if (result.result === 'defeat') {
      setBattleLog(prev => [
        ...prev,
        `💔 ${playerName} gained ${xpGained} XP (defeat bonus)`,
        '😢 DEFEAT... Better luck next time!'
      ])
    } else {
      setBattleLog(prev => [
        ...prev,
        `🤝 ${playerName} gained ${xpGained} XP`,
        '⚖️ DRAW - It was a close battle!'
      ])
    }

    if (result.mintVoucher) {
      setTimeout(() => {
        alert('🎁 Mint Voucher Available! You can now mint this HashMon as an NFT!')
      }, 2000)
    }
  }

  const resetBattle = useCallback(() => {
    setPlayerHashmon(null)
    setOpponentHashmon(null)
    setBattleId(null)
    setBattleLog([])
    setIsPlayerTurn(true)
    setBattleEnded(false)
    setBattleResult(null)
    setIsSelectingHashmon(false)
    setBattleStats({ moves: 0, damageDealt: 0, damageTaken: 0 })
    setDamageAnimation({ player: 0, opponent: 0 })
    setError(null)
    setShowBattleIntro(false)
    setAttackEffect({ type: null, target: null })
  }, [])

  const getResultColor = () => {
    if (battleResult === 'victory') return 'text-green-400'
    if (battleResult === 'defeat') return 'text-red-400'
    return 'text-yellow-400'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#000000' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="flex items-center gap-3">
            <PharosLogo size="md" animated={true} />
            <h2 className="text-3xl font-bold text-white mb-2">Loading Battle Arena...</h2>
          </div>
          <p className="text-white/60">Preparing battle on Pharos Network</p>
          <p className="text-gray-300">Preparing your HashMons...</p>
        </motion.div>
      </div>
    )
  }

  if (!authenticated || !user?.wallet?.address) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#000000' }}>
      <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to access the battle arena!</p>
        </div>
      </div>
    )
  }

  if (availableHashmons.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#000000' }}>
      <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">No HashMons Available</h2>
          <p className="text-gray-300 mb-2">You need at least one healthy HashMon to battle!</p>
          <p className="text-gray-400 mb-4">{error ? `Error: ${error}` : 'Go on an adventure to catch some HashMons first!'}</p>
          <button className="btn btn-primary mt-6" onClick={() => handleNavigate('adventure')}>
            Go to Adventure →
          </button>
          <button className="btn btn-outline mt-4 ml-4" onClick={loadPlayerHashmons}>
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  if (isSelectingHashmon) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: '#000000' }}>
        <div className="h-full flex flex-col p-4">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-white mb-4 text-center"
          >
            ⚔️ Select Your HashMon
          </motion.h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <label className="text-white flex items-center gap-2 text-sm">
                Difficulty:
                <select 
                className="px-3 py-1 bg-gray-800 rounded text-white border border-purple-500"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex gap-3 px-4 min-w-max">
              {availableHashmons.map((hashmon, idx) => (
              <motion.div
              key={hashmon.id}
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.1, z: 10 }}
                  className="card cursor-pointer border-2 transition-all hover:shadow-2xl flex-shrink-0 w-32"
                  onClick={() => !isProcessing && selectHashmon(hashmon)}
                style={{ borderColor: HASHMON_TYPES[hashmon.type]?.color || '#666' }}
            >
              <div 
                    className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: HASHMON_TYPES[hashmon.type]?.color || '#666' }}
                >
                  {hashmon.type?.charAt(0).toUpperCase() || 'H'}
                </div>
                  <h3 className="text-center text-sm font-bold mb-1 truncate">{hashmon.name || 'Unknown'}</h3>
                  <p className="text-center text-xs mb-2">Lv.{hashmon.level || 1}</p>
                  
                  <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                    <div className="bg-red-600/20 rounded p-1 text-center">
                      <div className="text-red-300 text-[9px]">HP</div>
                    <div className="text-white font-bold">
                        {hashmon.stats?.hp || hashmon.hp || 0}/{hashmon.maxStats?.hp || hashmon.maxHp || 100}
                    </div>
                  </div>
                    <div className="bg-orange-600/20 rounded p-1 text-center">
                      <div className="text-orange-300 text-[9px]">ATK</div>
                      <div className="text-white font-bold">{hashmon.stats?.attack || hashmon.attack || 0}</div>
                  </div>
                </div>
              </motion.div>
          ))}
            </div>
        </div>

          <div className="text-center">
            <button 
              className="btn btn-outline text-sm px-6" 
              onClick={() => setIsSelectingHashmon(false)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Starting Battle...' : 'Cancel'}
          </button>
          </div>
        </div>
      </div>
    )
  }

  if (!playerHashmon || !opponentHashmon) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#000000' }}>
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.h2 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl font-bold text-white mb-6"
          >
            <div className="flex items-center gap-2">
              <PharosLogo size="sm" animated={true} />
              <span>⚔️ Battle Arena</span>
              <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full">Pharos</span>
            </div>
          </motion.h2>
          <p className="text-xl text-gray-300 mb-8">Ready for epic battles?</p>
          {error && <div className="text-red-400 mb-4">Error: {error}</div>}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg text-xl px-8 py-4" 
            onClick={startBattle}
            disabled={isProcessing || loading}
          >
            {isProcessing ? 'Starting...' : '⚔️ Start Battle'}
          </motion.button>
          </motion.div>
      </div>
    )
  }

  const playerHpPercent = Math.max(0, Math.min(100, ((playerHashmon.stats?.hp || playerHashmon.hp || 0) / (playerHashmon.maxStats?.hp || playerHashmon.maxHp || 1)) * 100))
  const opponentHpPercent = Math.max(0, Math.min(100, ((opponentHashmon.stats?.hp || opponentHashmon.hp || 0) / (opponentHashmon.maxStats?.hp || opponentHashmon.maxHp || 1)) * 100))
  const playerMoves = Array.isArray(playerHashmon?.moves) && playerHashmon.moves.length > 0
    ? playerHashmon.moves
    : getDefaultMovesForType(playerHashmon?.type)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 overflow-hidden">
      <AnimatePresence>
        {showBattleIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.h1
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-7xl font-bold text-white"
              style={{ textShadow: '0 0 30px rgba(147, 51, 234, 0.8)' }}
            >
              BATTLE START!
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attack Effects Overlay */}
      <AnimatePresence>
        {attackEffect.type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              backgroundColor: attackEffect.type === 'fire' ? 'rgba(255, 100, 0, 0.3)' :
                             attackEffect.type === 'water' ? 'rgba(0, 150, 255, 0.3)' :
                             attackEffect.type === 'electric' ? 'rgba(255, 255, 0, 0.3)' :
                             attackEffect.type === 'grass' ? 'rgba(0, 255, 100, 0.3)' :
                             'rgba(255, 255, 255, 0.2)'
            }}
          />
        )}
      </AnimatePresence>

      {/* MOVE ANNOUNCEMENT OVERLAY - ENHANCED FOR BOTH PLAYER & ENEMY */}
      <AnimatePresence>
        {moveAnnouncement.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -40 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="fixed top-[12%] left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-black/97 border-4 border-yellow-400 rounded-xl p-4 shadow-2xl min-w-[260px] max-w-[320px] text-center backdrop-blur-md">
              {moveAnnouncement.playerMove && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.7, delay: 0.3, repeat: 1 }}
                    className="text-3xl font-black text-yellow-300 mb-2"
                    style={{ textShadow: '0 0 15px rgba(255, 255, 0, 0.9), 0 0 30px rgba(255, 255, 0, 0.6)' }}
                  >
                    YOU USED
                  </motion.div>
                  <motion.div
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="text-4xl font-black text-blue-300 mb-2"
                    style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.9)' }}
                  >
                    {moveAnnouncement.playerMove.name?.toUpperCase() || 'ATTACK'}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="text-2xl font-bold text-red-400 flex items-center justify-center gap-2"
                  >
                    <span className="text-white text-xl">Enemy:</span>
                    <span className="bg-red-600/50 px-3 py-1 rounded-lg border-2 border-red-400 text-2xl">-{moveAnnouncement.enemyDamage} HP</span>
                  </motion.div>
                </>
              )}
              {moveAnnouncement.enemyMove && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.7, delay: 0.3, repeat: 1 }}
                    className="text-3xl font-black text-red-400 mb-2"
                    style={{ textShadow: '0 0 15px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.6)' }}
                  >
                    ENEMY USED
                  </motion.div>
                  <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="text-4xl font-black text-orange-300 mb-2"
                    style={{ textShadow: '0 0 15px rgba(251, 146, 60, 0.9)' }}
                  >
                    {moveAnnouncement.enemyMove.name?.toUpperCase() || 'ATTACK'}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="text-2xl font-bold text-red-400 flex items-center justify-center gap-2"
                  >
                    <span className="text-white text-xl">You:</span>
                    <span className="bg-red-600/50 px-3 py-1 rounded-lg border-2 border-red-400 text-2xl">-{moveAnnouncement.playerDamage} HP</span>
                  </motion.div>
                </>
              )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Battle Arena - REDESIGNED - LESS CONGESTED - SAME SIZE */}
      <div className="h-screen flex flex-col p-1 overflow-hidden" style={{ background: '#000000' }}>
        {/* Compact Header - SPACED OUT */}
        <div className="flex justify-center items-center gap-2 mb-1 h-5 flex-shrink-0 px-1">
          <PharosLogo size="sm" animated={true} className="opacity-70" />
          <span className={`px-2 py-1 rounded-lg text-[9px] font-bold shadow-md ${isPlayerTurn ? 'bg-green-600/70 text-green-100 border border-green-400/50' : 'bg-gray-700/70 text-gray-300 border border-gray-600/50'}`}>
            {isPlayerTurn ? '▶️ YOUR TURN' : '⏸️ ENEMY TURN'}
          </span>
          <span className="px-2 py-1 rounded-lg bg-purple-600/70 text-purple-100 text-[9px] font-bold shadow-md border border-purple-400/50">M: {battleStats.moves}</span>
          <span className="px-2 py-1 rounded-lg bg-blue-600/70 text-blue-100 text-[9px] font-bold shadow-md border border-blue-400/50">💥 {battleStats.damageDealt}</span>
          <span className="px-2 py-1 rounded-lg bg-red-600/70 text-red-100 text-[9px] font-bold shadow-md border border-red-400/50">💢 {battleStats.damageTaken}</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-600/30 text-blue-300 border border-blue-500/50">Pharos</span>
            {battleEnded && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              className={`text-[10px] font-black px-2 py-1 rounded-lg shadow-md border ${getResultColor()}`}
              >
              {battleResult === 'victory' && '🏆 WIN'}
              {battleResult === 'defeat' && '💔 LOSE'}
                {battleResult === 'draw' && '⚖️ DRAW'}
              </motion.div>
            )}
      </div>

        {/* Player HashMon - TOP - REDESIGNED LESS CONGESTED */}
        <div className="flex-1 min-h-0 overflow-hidden px-1 mb-1">
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ 
              x: attackEffect.target === 'player' ? [0, -5, 5, -5, 0] : 0,
              opacity: 1 
            }}
            transition={{ duration: attackEffect.target === 'player' ? 0.8 : 0.6 }}
            className="card relative overflow-hidden border-3 p-2 rounded-xl flex items-center justify-between shadow-lg"
            style={{ 
              borderColor: HASHMON_TYPES[playerHashmon.type]?.color || '#666', 
              boxShadow: `0 4px 20px ${HASHMON_TYPES[playerHashmon.type]?.color || '#666'}40`,
              background: `linear-gradient(135deg, ${HASHMON_TYPES[playerHashmon.type]?.color || '#666'}15 0%, rgba(0,0,0,0.4) 100%)`
            }}
          >
            <div className="absolute top-1 right-1 text-[8px] font-black text-white bg-black/90 px-1.5 py-0.5 rounded-md z-10 border border-white/40">
              YOU
            </div>
            
            {/* Avatar - LEFT SIDE */}
                  <motion.div
              animate={isPlayerTurn && !battleEnded ? { 
                scale: [1, 1.08, 1],
                filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'],
                boxShadow: ['0 0 10px rgba(34, 197, 94, 0.6)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 10px rgba(34, 197, 94, 0.6)']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0 relative border-2 border-white/40 shadow-lg"
                style={{ backgroundColor: HASHMON_TYPES[playerHashmon.type]?.color || '#666' }}
              >
                {playerHashmon.type?.charAt(0).toUpperCase() || 'H'}
                {isPlayerTurn && !battleEnded && (
                  <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-3 border-green-400 rounded-full"
                />
              )}
            </motion.div>

            {/* Stats - CENTER - BETTER SPACING */}
            <div className="flex-1 flex flex-col items-center justify-center mx-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-[11px] font-black text-white">{playerHashmon.name || 'Unknown'}</h3>
                <p className="text-[9px] text-gray-300 font-bold bg-gray-800/60 px-1.5 py-0.5 rounded">Lv.{playerHashmon.level || 1}</p>
            </div>

              {/* HP Bar - LARGER */}
              <div className="w-full max-w-[140px] mb-1.5">
                <div className="flex justify-between items-center text-[8px] mb-1">
                  <span className="text-white font-bold">HP</span>
                  <span className="text-white font-black text-[9px] bg-black/60 px-1.5 py-0.5 rounded-md">
                    {Math.max(0, playerHashmon.stats?.hp ?? playerHashmon.hp ?? 0)}/{playerHashmon.maxStats?.hp ?? playerHashmon.maxHp ?? 100}
                </span>
              </div>
                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border-2 border-gray-700">
                <motion.div 
                    className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 h-2 rounded-full"
                  initial={{ width: '100%' }}
                    animate={{ width: `${Math.max(0, Math.min(100, playerHpPercent))}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
          </div>
        </div>

              {/* Stats Grid - HORIZONTAL SPREAD */}
              <div className="flex gap-2 text-[7px]">
                <div className="bg-orange-600/40 rounded-md px-2 py-1 text-center border border-orange-500/60 shadow-sm">
                  <div className="text-orange-200 font-bold">ATK</div>
                  <div className="text-white font-black text-[8px]">{playerHashmon.stats?.attack ?? playerHashmon.attack ?? 0}</div>
              </div>
                <div className="bg-blue-600/40 rounded-md px-2 py-1 text-center border border-blue-500/60 shadow-sm">
                  <div className="text-blue-200 font-bold">DEF</div>
                  <div className="text-white font-black text-[8px]">{playerHashmon.stats?.defense ?? playerHashmon.defense ?? 0}</div>
              </div>
                <div className="bg-green-600/40 rounded-md px-2 py-1 text-center border border-green-500/60 shadow-sm">
                  <div className="text-green-200 font-bold">SPD</div>
                  <div className="text-white font-black text-[8px]">{playerHashmon.stats?.speed ?? playerHashmon.speed ?? 0}</div>
              </div>
              </div>
            </div>

            {/* Damage Number - ENHANCED - ALWAYS VISIBLE - FOR PLAYER - WHITE */}
              <AnimatePresence>
              {damageAnimation.player > 0 && (
                  <motion.div
                  key={`player-damage-${damageAnimation.player}-${Math.random()}`}
                  initial={{ y: 30, opacity: 0, scale: 0.2 }}
                  animate={{ 
                    y: -90, 
                    opacity: [0, 1, 1, 1, 0.9, 0], 
                    scale: [0.2, 0.8, 1.5, 2, 2.5, 3] 
                  }}
                    exit={{ opacity: 0 }}
                  transition={{ duration: 4, ease: "easeOut" }}
                  className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl font-black z-50 pointer-events-none"
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.9), 0 0 60px rgba(255, 255, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.6), 0 0 100px rgba(255, 255, 255, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)',
                    WebkitTextStroke: '1px rgba(0, 0, 0, 0.5)',
                    WebkitTextFillColor: '#FFFFFF',
                    filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 1)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))'
                  }}
                >
                  -{damageAnimation.player}
                  </motion.div>
                )}
              </AnimatePresence>
          </motion.div>
        </div>

        {/* Opponent HashMon - BOTTOM - REDESIGNED LESS CONGESTED */}
        <div className="flex-1 min-h-0 overflow-hidden px-1 mb-1">
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ 
              x: attackEffect.target === 'opponent' ? [0, -5, 5, -5, 0] : 0,
              opacity: 1 
            }}
            transition={{ duration: attackEffect.target === 'opponent' ? 0.8 : 0.6 }}
            className="card relative overflow-hidden border-3 p-2 rounded-xl flex items-center justify-between shadow-lg"
            style={{ 
              borderColor: HASHMON_TYPES[opponentHashmon.type1 || opponentHashmon.type]?.color || '#666', 
              boxShadow: `0 4px 20px ${HASHMON_TYPES[opponentHashmon.type1 || opponentHashmon.type]?.color || '#666'}40`,
              background: `linear-gradient(135deg, ${HASHMON_TYPES[opponentHashmon.type1 || opponentHashmon.type]?.color || '#666'}15 0%, rgba(0,0,0,0.4) 100%)`
            }}
          >
            <div className="absolute top-1 right-1 text-[8px] font-black text-white bg-black/90 px-1.5 py-0.5 rounded-md z-10 border border-white/40">
              ENEMY
            </div>

            {/* Avatar - LEFT SIDE */}
            <motion.div
              animate={!isPlayerTurn && !battleEnded ? { 
                scale: [1, 1.08, 1],
                filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'],
                boxShadow: ['0 0 10px rgba(239, 68, 68, 0.6)', '0 0 20px rgba(239, 68, 68, 0.8)', '0 0 10px rgba(239, 68, 68, 0.6)']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0 relative border-2 border-white/40 shadow-lg"
                style={{ backgroundColor: HASHMON_TYPES[opponentHashmon.type1 || opponentHashmon.type]?.color || '#666' }}
              >
                {(opponentHashmon.type1 || opponentHashmon.type)?.charAt(0).toUpperCase() || 'O'}
                {!isPlayerTurn && !battleEnded && (
                  <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-3 border-red-400 rounded-full"
                />
              )}
            </motion.div>

            {/* Stats - CENTER - BETTER SPACING */}
            <div className="flex-1 flex flex-col items-center justify-center mx-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-[11px] font-black text-white">{opponentHashmon.name || 'Unknown'}</h3>
                <p className="text-[9px] text-gray-300 font-bold bg-gray-800/60 px-1.5 py-0.5 rounded">Lv.{opponentHashmon.level || 1}</p>
            </div>

              {/* HP Bar - LARGER */}
              <div className="w-full max-w-[140px] mb-1.5">
                <div className="flex justify-between items-center text-[8px] mb-1">
                  <span className="text-white font-bold">HP</span>
                  <span className="text-white font-black text-[9px] bg-black/60 px-1.5 py-0.5 rounded-md">
                    {Math.max(0, opponentHashmon.stats?.hp ?? opponentHashmon.hp ?? 0)}/{opponentHashmon.maxStats?.hp ?? opponentHashmon.maxHp ?? 100}
                </span>
          </div>
                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border-2 border-gray-700">
                <motion.div 
                    className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 h-2 rounded-full"
                  initial={{ width: '100%' }}
                    animate={{ width: `${Math.max(0, Math.min(100, opponentHpPercent))}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
        </div>
            </div>

              {/* Stats Grid - HORIZONTAL SPREAD */}
              <div className="flex gap-2 text-[7px]">
                <div className="bg-orange-600/40 rounded-md px-2 py-1 text-center border border-orange-500/60 shadow-sm">
                  <div className="text-orange-200 font-bold">ATK</div>
                  <div className="text-white font-black text-[8px]">{opponentHashmon.stats?.attack ?? opponentHashmon.attack ?? 0}</div>
              </div>
                <div className="bg-blue-600/40 rounded-md px-2 py-1 text-center border border-blue-500/60 shadow-sm">
                  <div className="text-blue-200 font-bold">DEF</div>
                  <div className="text-white font-black text-[8px]">{opponentHashmon.stats?.defense ?? opponentHashmon.defense ?? 0}</div>
              </div>
                <div className="bg-green-600/40 rounded-md px-2 py-1 text-center border border-green-500/60 shadow-sm">
                  <div className="text-green-200 font-bold">SPD</div>
                  <div className="text-white font-black text-[8px]">{opponentHashmon.stats?.speed ?? opponentHashmon.speed ?? 0}</div>
              </div>
              </div>
            </div>
            
            {/* Damage Number - ENHANCED - ALWAYS VISIBLE - FOR OPPONENT - WHITE */}
            <AnimatePresence>
              {damageAnimation.opponent > 0 && (
                <motion.div
                  key={`opponent-damage-${damageAnimation.opponent}-${Math.random()}`}
                  initial={{ y: 30, opacity: 0, scale: 0.2 }}
                  animate={{ 
                    y: -90, 
                    opacity: [0, 1, 1, 1, 0.9, 0], 
                    scale: [0.2, 0.8, 1.5, 2, 2.5, 3] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4, ease: "easeOut" }}
                  className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl font-black z-50 pointer-events-none"
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.9), 0 0 60px rgba(255, 255, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.6), 0 0 100px rgba(255, 255, 255, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)',
                    WebkitTextStroke: '1px rgba(0, 0, 0, 0.5)',
                    WebkitTextFillColor: '#FFFFFF',
                    filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 1)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))'
                  }}
                >
                  -{damageAnimation.opponent}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
      </div>

        {/* Bottom Section - Moves - REDESIGNED - LESS CONGESTED */}
        <div className="h-16 flex-shrink-0 overflow-hidden px-1">
          <div className="w-full overflow-hidden">
            {!battleEnded && isPlayerTurn && !isProcessing ? (
          <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-gradient-to-r from-purple-600/40 to-blue-600/40 h-full p-1.5 overflow-hidden border-2 border-purple-500/60 rounded-xl shadow-lg"
              >
                <div className="flex gap-2 h-full items-center justify-center">
              {playerMoves.map((move, index) => (
                <motion.button
                key={index}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      className="flex-1 btn btn-outline text-center p-1.5 border-2 border-purple-400/60 hover:border-purple-400 hover:bg-purple-500/30 transition-all text-[9px] h-full flex flex-col justify-center rounded-lg font-bold shadow-md"
                  onClick={() => executeMove(move)}
                  disabled={isProcessing}
                >
                      <div className="font-black text-[10px] mb-1 truncate text-white">{move.name || `Move ${index + 1}`}</div>
                      <div className="text-[8px] text-purple-200">
                        {move.power || 50}⚔️ {Math.round((move.accuracy || 0.9) * 100)}%🎯
                </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
            ) : isProcessing ? (
              <div className="card h-full flex items-center justify-center p-1 bg-gray-800/60 rounded-xl border-2 border-purple-500/40">
                <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-1"
                  />
                  <p className="text-gray-300 text-[9px] font-bold">Processing...</p>
        </div>
      </div>
            ) : battleEnded ? (
              <div className="card bg-gradient-to-r from-purple-600/30 to-blue-600/30 h-full flex flex-col items-center justify-center p-1 rounded-xl border-2 border-purple-500/50 shadow-lg">
                <h3 className={`text-[11px] font-bold mb-1 ${getResultColor()}`}>
                  {battleResult === 'victory' && '🎉 Victory!'}
                  {battleResult === 'defeat' && '💔 Defeat'}
                {battleResult === 'draw' && '⚖️ Draw'}
              </h3>
                <div className="flex gap-2 text-[8px] mb-1">
                  <div className="bg-gray-800/60 px-2 py-1 rounded">
                    <div className="text-gray-400">Moves</div>
                    <div className="text-white font-bold">{battleStats.moves}</div>
                </div>
                  <div className="bg-gray-800/60 px-2 py-1 rounded">
                    <div className="text-gray-400">Dealt</div>
                    <div className="text-green-400 font-bold">{battleStats.damageDealt}</div>
                </div>
                  <div className="bg-gray-800/60 px-2 py-1 rounded">
                    <div className="text-gray-400">Taken</div>
                    <div className="text-red-400 font-bold">{battleStats.damageTaken}</div>
                </div>
              </div>
                <div className="flex gap-1">
                  <button className="btn btn-primary text-[9px] px-2 py-1 rounded-lg" onClick={resetBattle}>
            New Battle
          </button>
                  <button className="btn btn-outline text-[9px] px-2 py-1 rounded-lg" onClick={() => handleNavigate('collection')}>
                    Collection
          </button>
        </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Battle
