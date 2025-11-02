// HashMon types and their properties
export const HASHMON_TYPES = {
  fire: {
    name: 'Fire HashMon',
    color: '#FF6B35',
    strengths: ['grass'],
    weaknesses: ['water'],
    baseStats: { hp: 100, attack: 120, defense: 80, speed: 90 }
  },
  water: {
    name: 'Water HashMon',
    color: '#4A90E2',
    strengths: ['fire'],
    weaknesses: ['grass'],
    baseStats: { hp: 110, attack: 100, defense: 100, speed: 80 }
  },
  grass: {
    name: 'Grass HashMon',
    color: '#7ED321',
    strengths: ['water'],
    weaknesses: ['fire'],
    baseStats: { hp: 120, attack: 90, defense: 110, speed: 70 }
  },
  electric: {
    name: 'Electric HashMon',
    color: '#F5A623',
    strengths: ['water'],
    weaknesses: ['grass'],
    baseStats: { hp: 90, attack: 130, defense: 70, speed: 120 }
  },
  psychic: {
    name: 'Psychic HashMon',
    color: '#9013FE',
    strengths: ['electric'],
    weaknesses: ['dark'],
    baseStats: { hp: 100, attack: 110, defense: 90, speed: 100 }
  },
  dark: {
    name: 'Dark HashMon',
    color: '#4A4A4A',
    strengths: ['psychic'],
    weaknesses: ['electric'],
    baseStats: { hp: 110, attack: 110, defense: 110, speed: 90 }
  }
}

// Generate a random HashMon
export const generateRandomHashmon = (level = 1) => {
  const types = Object.keys(HASHMON_TYPES)
  const type = types[Math.floor(Math.random() * types.length)]
  const typeData = HASHMON_TYPES[type]
  
  const id = Math.random().toString(36).substr(2, 9)
  const name = generateHashmonName(type)
  
  // Calculate stats based on level
  const levelMultiplier = 1 + (level - 1) * 0.2
  const stats = {}
  for (const [stat, baseValue] of Object.entries(typeData.baseStats)) {
    stats[stat] = Math.floor(baseValue * levelMultiplier)
  }
  
  return {
    id,
    name,
    type,
    level,
    stats,
    maxStats: { ...stats },
    experience: 0,
    experienceToNext: level * 100,
    moves: generateMoves(type),
    isShiny: Math.random() < 0.05, // 5% chance of being shiny
    caughtAt: Date.now(),
    rarity: calculateRarity(stats, level)
  }
}

// Generate HashMon name
const generateHashmonName = (type) => {
  const prefixes = ['Blaze', 'Aqua', 'Leaf', 'Spark', 'Mind', 'Shadow']
  const suffixes = ['mon', 'zard', 'chu', 'gon', 'ite', 'on']
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return `${prefix}${suffix}`
}

// Generate moves for HashMon
const generateMoves = (type) => {
  const moveSets = {
    fire: [
      { name: 'Ember', power: 40, type: 'fire', accuracy: 100 },
      { name: 'Flame Thrower', power: 90, type: 'fire', accuracy: 100 },
      { name: 'Fire Blast', power: 110, type: 'fire', accuracy: 85 }
    ],
    water: [
      { name: 'Water Gun', power: 40, type: 'water', accuracy: 100 },
      { name: 'Surf', power: 90, type: 'water', accuracy: 100 },
      { name: 'Hydro Pump', power: 110, type: 'water', accuracy: 80 }
    ],
    grass: [
      { name: 'Vine Whip', power: 45, type: 'grass', accuracy: 100 },
      { name: 'Razor Leaf', power: 55, type: 'grass', accuracy: 95 },
      { name: 'Solar Beam', power: 120, type: 'grass', accuracy: 100 }
    ],
    electric: [
      { name: 'Thunder Shock', power: 40, type: 'electric', accuracy: 100 },
      { name: 'Thunderbolt', power: 90, type: 'electric', accuracy: 100 },
      { name: 'Thunder', power: 110, type: 'electric', accuracy: 70 }
    ],
    psychic: [
      { name: 'Confusion', power: 50, type: 'psychic', accuracy: 100 },
      { name: 'Psychic', power: 90, type: 'psychic', accuracy: 100 },
      { name: 'Psybeam', power: 65, type: 'psychic', accuracy: 100 }
    ],
    dark: [
      { name: 'Bite', power: 60, type: 'dark', accuracy: 100 },
      { name: 'Dark Pulse', power: 80, type: 'dark', accuracy: 100 },
      { name: 'Night Slash', power: 70, type: 'dark', accuracy: 100 }
    ]
  }
  
  return moveSets[type] || moveSets.fire
}

// Calculate rarity based on stats and level
const calculateRarity = (stats, level) => {
  const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0)
  const averageStat = totalStats / 4
  
  if (averageStat >= 120) return 'legendary'
  if (averageStat >= 100) return 'rare'
  if (averageStat >= 80) return 'uncommon'
  return 'common'
}

// Calculate damage in battle
export const calculateDamage = (attacker, defender, move) => {
  const attack = attacker.stats.attack
  const defense = defender.stats.defense
  const power = move.power
  
  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.type)
  
  // Critical hit chance (5%)
  const isCritical = Math.random() < 0.05
  
  // Base damage calculation
  let damage = Math.floor(((2 * attacker.level + 10) / 250) * (attack / defense) * power + 2)
  
  // Apply type effectiveness
  damage = Math.floor(damage * effectiveness)
  
  // Apply critical hit
  if (isCritical) {
    damage = Math.floor(damage * 1.5)
  }
  
  // Random factor (85-100%)
  const randomFactor = 0.85 + Math.random() * 0.15
  damage = Math.floor(damage * randomFactor)
  
  return {
    damage: Math.max(1, damage),
    isCritical,
    effectiveness
  }
}

// Get type effectiveness
export const getTypeEffectiveness = (attackType, defenseType) => {
  const effectiveness = {
    fire: { fire: 0.5, water: 0.5, grass: 2, electric: 1, psychic: 1, dark: 1 },
    water: { fire: 2, water: 0.5, grass: 0.5, electric: 0.5, psychic: 1, dark: 1 },
    grass: { fire: 0.5, water: 2, grass: 0.5, electric: 1, psychic: 1, dark: 1 },
    electric: { fire: 1, water: 2, grass: 0.5, electric: 0.5, psychic: 1, dark: 1 },
    psychic: { fire: 1, water: 1, grass: 1, electric: 1, psychic: 0.5, dark: 0 },
    dark: { fire: 1, water: 1, grass: 1, electric: 1, psychic: 2, dark: 0.5 }
  }
  
  return effectiveness[attackType]?.[defenseType] || 1
}

// Level up HashMon
export const levelUpHashmon = (hashmon) => {
  const newLevel = hashmon.level + 1
  const newStats = { ...hashmon.stats }
  const newMaxStats = { ...hashmon.maxStats }
  
  // Increase stats
  Object.keys(newStats).forEach(stat => {
    const increase = Math.floor(Math.random() * 3) + 1 // 1-3 stat increase
    newStats[stat] += increase
    newMaxStats[stat] += increase
  })
  
  return {
    ...hashmon,
    level: newLevel,
    stats: newStats,
    maxStats: newMaxStats,
    experience: 0,
    experienceToNext: newLevel * 100
  }
}

// Add experience to HashMon
export const addExperience = (hashmon, exp) => {
  let newExperience = hashmon.experience + exp
  let newLevel = hashmon.level
  let newStats = { ...hashmon.stats }
  let newMaxStats = { ...hashmon.maxStats }
  
  // Check for level up
  while (newExperience >= hashmon.experienceToNext) {
    newExperience -= hashmon.experienceToNext
    newLevel++
    
    // Increase stats on level up
    Object.keys(newStats).forEach(stat => {
      const increase = Math.floor(Math.random() * 3) + 1
      newStats[stat] += increase
      newMaxStats[stat] += increase
    })
  }
  
  return {
    ...hashmon,
    level: newLevel,
    experience: newExperience,
    experienceToNext: newLevel * 100,
    stats: newStats,
    maxStats: newMaxStats
  }
}

export default {
  HASHMON_TYPES,
  generateRandomHashmon,
  calculateDamage,
  getTypeEffectiveness,
  levelUpHashmon,
  addExperience
}
