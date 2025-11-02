const { v4: uuidv4 } = require('uuid');

class BattleEngine {
  constructor() {
    this.battleSessions = new Map();
    this.aiStrategies = [
      'aggressive',    // High attack moves
      'defensive',     // High defense moves
      'balanced',      // Mixed moves
      'random'         // Completely random
    ];
  }

  // Generate AI opponent based on difficulty and player level
  generateAIOpponent(difficulty, playerLevel) {
    const baseLevel = Math.max(1, playerLevel - 2 + Math.floor(Math.random() * 5));
    const level = Math.min(100, baseLevel + difficulty - 1);

    // Select random HashMon type
    const types = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Fighting', 'Dark', 'Steel'];
    const type1 = types[Math.floor(Math.random() * types.length)];
    const type2 = Math.random() < 0.3 ? types[Math.floor(Math.random() * types.length)] : '';

    // Generate stats based on level and difficulty
    const statMultiplier = 1 + (difficulty - 1) * 0.2;
    const baseStats = {
      hp: 50 + (level * 10),
      attack: 40 + (level * 8),
      defense: 40 + (level * 8),
      speed: 35 + (level * 7)
    };

    return {
      id: uuidv4(),
      name: this.generateAIName(type1),
      level: level,
      type1: type1,
      type2: type2,
      hp: Math.floor(baseStats.hp * statMultiplier),
      maxHp: Math.floor(baseStats.hp * statMultiplier),
      attack: Math.floor(baseStats.attack * statMultiplier),
      defense: Math.floor(baseStats.defense * statMultiplier),
      speed: Math.floor(baseStats.speed * statMultiplier),
      strategy: this.aiStrategies[Math.floor(Math.random() * this.aiStrategies.length)],
      moves: this.generateAIMoves(type1, type2, level)
    };
  }

  // Generate AI HashMon name
  generateAIName(type) {
    const prefixes = ['Wild', 'Fierce', 'Mystic', 'Ancient', 'Shadow', 'Golden', 'Crystal', 'Storm'];
    const suffixes = ['Beast', 'Spirit', 'Guardian', 'Warrior', 'Mage', 'Hunter', 'Master', 'Lord'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${type} ${suffix}`;
  }

  // Generate AI moves based on type and level
  generateAIMoves(type1, type2, level) {
    const moveTypes = {
      'Fire': ['Flame Strike', 'Fire Blast', 'Heat Wave', 'Ember'],
      'Water': ['Aqua Jet', 'Hydro Pump', 'Tidal Wave', 'Bubble Beam'],
      'Grass': ['Vine Whip', 'Solar Beam', 'Leaf Storm', 'Razor Leaf'],
      'Electric': ['Thunder Bolt', 'Lightning Strike', 'Shock Wave', 'Electric Surge'],
      'Psychic': ['Mind Blast', 'Psychic Wave', 'Telekinetic Force', 'Mental Strike'],
      'Fighting': ['Fist Strike', 'Power Punch', 'Combo Attack', 'Battle Cry'],
      'Dark': ['Shadow Strike', 'Dark Pulse', 'Void Attack', 'Nightmare'],
      'Steel': ['Metal Claw', 'Steel Slam', 'Iron Defense', 'Metal Storm']
    };

    const moves = [...(moveTypes[type1] || ['Basic Attack'])];
    if (type2 && moveTypes[type2]) {
      moves.push(...moveTypes[type2].slice(0, 2));
    }

    // Add some generic moves
    moves.push('Quick Attack', 'Defend', 'Charge Up', 'Restore');

    // Return 4 moves based on level
    const availableMoves = moves.slice(0, Math.min(4, Math.floor(level / 5) + 1));
    return availableMoves.map(move => ({
      name: move,
      type: this.getMoveType(move),
      power: this.getMovePower(move, level),
      accuracy: 0.8 + Math.random() * 0.2
    }));
  }

  // Get move type
  getMoveType(moveName) {
    const moveTypeMap = {
      'Flame Strike': 'Fire', 'Fire Blast': 'Fire', 'Heat Wave': 'Fire', 'Ember': 'Fire',
      'Aqua Jet': 'Water', 'Hydro Pump': 'Water', 'Tidal Wave': 'Water', 'Bubble Beam': 'Water',
      'Vine Whip': 'Grass', 'Solar Beam': 'Grass', 'Leaf Storm': 'Grass', 'Razor Leaf': 'Grass',
      'Thunder Bolt': 'Electric', 'Lightning Strike': 'Electric', 'Shock Wave': 'Electric', 'Electric Surge': 'Electric',
      'Mind Blast': 'Psychic', 'Psychic Wave': 'Psychic', 'Telekinetic Force': 'Psychic', 'Mental Strike': 'Psychic',
      'Fist Strike': 'Fighting', 'Power Punch': 'Fighting', 'Combo Attack': 'Fighting', 'Battle Cry': 'Fighting',
      'Shadow Strike': 'Dark', 'Dark Pulse': 'Dark', 'Void Attack': 'Dark', 'Nightmare': 'Dark',
      'Metal Claw': 'Steel', 'Steel Slam': 'Steel', 'Iron Defense': 'Steel', 'Metal Storm': 'Steel',
      'Quick Attack': 'Normal', 'Defend': 'Normal', 'Charge Up': 'Normal', 'Restore': 'Normal'
    };
    
    return moveTypeMap[moveName] || 'Normal';
  }

  // Get move power
  getMovePower(moveName, level) {
    const powerMap = {
      'Flame Strike': 80, 'Fire Blast': 120, 'Heat Wave': 95, 'Ember': 40,
      'Aqua Jet': 40, 'Hydro Pump': 110, 'Tidal Wave': 90, 'Bubble Beam': 65,
      'Vine Whip': 45, 'Solar Beam': 120, 'Leaf Storm': 130, 'Razor Leaf': 55,
      'Thunder Bolt': 90, 'Lightning Strike': 100, 'Shock Wave': 60, 'Electric Surge': 80,
      'Mind Blast': 85, 'Psychic Wave': 90, 'Telekinetic Force': 70, 'Mental Strike': 75,
      'Fist Strike': 50, 'Power Punch': 85, 'Combo Attack': 95, 'Battle Cry': 60,
      'Shadow Strike': 70, 'Dark Pulse': 80, 'Void Attack': 90, 'Nightmare': 100,
      'Metal Claw': 50, 'Steel Slam': 80, 'Iron Defense': 0, 'Metal Storm': 110,
      'Quick Attack': 40, 'Defend': 0, 'Charge Up': 0, 'Restore': 0
    };
    
    const basePower = powerMap[moveName] || 50;
    return Math.floor(basePower * (1 + level / 100));
  }

  // Execute a battle move
  executeBattleMove(battleSession, playerMove, aiMove) {
    const { playerHashmon } = battleSession;
    const aiOpponent = battleSession.aiOpponent || this.generateAIOpponent(battleSession.difficulty, playerHashmon.level);
    
    // Ensure AI opponent is stored in session
    if (!battleSession.aiOpponent) {
      battleSession.aiOpponent = aiOpponent;
    }

    // Calculate damage for both moves
    const playerDamage = this.calculateDamage(playerHashmon, aiOpponent, playerMove);
    const aiDamage = this.calculateDamage(aiOpponent, playerHashmon, aiMove);

    // Apply damage
    aiOpponent.hp = Math.max(0, aiOpponent.hp - playerDamage);
    playerHashmon.hp = Math.max(0, playerHashmon.hp - aiDamage);

    // Check if battle is complete
    const battleComplete = aiOpponent.hp <= 0 || playerHashmon.hp <= 0;
    
    let result = 'ongoing';
    let xpGained = 0;
    let levelUp = false;
    let newLevel = playerHashmon.level;

    if (battleComplete) {
      if (aiOpponent.hp <= 0) {
        result = 'victory';
        xpGained = this.calculateXPGain(playerHashmon, aiOpponent);
        const levelUpResult = this.checkLevelUp(playerHashmon, xpGained);
        levelUp = levelUpResult.levelUp;
        newLevel = levelUpResult.newLevel;
      } else if (playerHashmon.hp <= 0) {
        result = 'defeat';
        xpGained = Math.floor(this.calculateXPGain(playerHashmon, aiOpponent) * 0.1); // 10% XP for defeat
      } else {
        result = 'draw';
        xpGained = Math.floor(this.calculateXPGain(playerHashmon, aiOpponent) * 0.5); // 50% XP for draw
      }
    }

    return {
      battleComplete,
      result,
      playerDamage,
      aiDamage,
      playerHashmon: { 
        ...playerHashmon,
        hp: playerHashmon.hp,
        maxHp: playerHashmon.maxHp,
        attack: playerHashmon.attack,
        defense: playerHashmon.defense,
        speed: playerHashmon.speed,
        level: newLevel || playerHashmon.level,
        xp: playerHashmon.xp || 0
      },
      aiOpponent: { ...aiOpponent },
      xpGained,
      levelUp,
      newLevel,
      moveResults: {
        playerMove: {
          name: playerMove.name,
          damage: playerDamage,
          type: playerMove.type || 'Normal',
          power: playerMove.power || 50
        },
        aiMove: {
          name: aiMove.name,
          damage: aiDamage,
          type: aiMove.type || 'Normal',
          power: aiMove.power || 50
        }
      },
      stats: {
        playerFinalHp: playerHashmon.hp,
        opponentFinalHp: aiOpponent.hp,
        totalDamageDealt: playerDamage,
        totalDamageTaken: aiDamage
      }
    };
  }

  // Calculate damage dealt by attacker to defender
  calculateDamage(attacker, defender, move) {
    if (move.name === 'Defend') {
      return 0;
    }

    if (move.name === 'Restore') {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * 0.3));
      return 0;
    }

    // Base damage calculation
    const baseDamage = Math.floor((attacker.attack * move.power) / defender.defense);
    
    // Type effectiveness
    const effectiveness = this.getTypeEffectiveness(move.type, defender.type1, defender.type2);
    
    // Critical hit chance (based on speed)
    const critChance = Math.min(0.3, attacker.speed / 1000);
    const isCritical = Math.random() < critChance;
    const critMultiplier = isCritical ? 1.5 : 1;
    
    // Accuracy check
    const hitChance = move.accuracy || 0.9;
    const hit = Math.random() < hitChance;
    
    if (!hit) {
      return 0;
    }

    // Random factor (85-100%)
    const randomFactor = 0.85 + Math.random() * 0.15;
    
    const finalDamage = Math.max(1, Math.floor(baseDamage * effectiveness * critMultiplier * randomFactor));
    
    return finalDamage;
  }

  // Calculate type effectiveness
  getTypeEffectiveness(attackType, defenderType1, defenderType2) {
    const effectivenessChart = {
      'Fire': { 'Grass': 2, 'Water': 0.5, 'Fire': 0.5, 'Steel': 2 },
      'Water': { 'Fire': 2, 'Grass': 0.5, 'Water': 0.5, 'Electric': 0.5 },
      'Grass': { 'Water': 2, 'Fire': 0.5, 'Grass': 0.5, 'Steel': 0.5 },
      'Electric': { 'Water': 2, 'Grass': 0.5, 'Electric': 0.5, 'Steel': 2 },
      'Psychic': { 'Fighting': 2, 'Dark': 0, 'Steel': 0.5 },
      'Fighting': { 'Normal': 2, 'Psychic': 0.5, 'Steel': 2, 'Dark': 2 },
      'Dark': { 'Psychic': 2, 'Fighting': 0.5, 'Dark': 0.5 },
      'Steel': { 'Normal': 2, 'Grass': 2, 'Fire': 0.5, 'Water': 0.5 },
      'Normal': { 'Steel': 0.5, 'Ghost': 0 }
    };

    let effectiveness1 = effectivenessChart[attackType]?.[defenderType1] || 1;
    let effectiveness2 = defenderType2 ? (effectivenessChart[attackType]?.[defenderType2] || 1) : 1;

    return effectiveness1 * effectiveness2;
  }

  // Calculate XP gain from battle
  calculateXPGain(playerHashmon, opponent) {
    const levelDiff = opponent.level - playerHashmon.level;
    const baseXP = opponent.level * 10;
    
    // Bonus XP for defeating higher level opponents
    const levelBonus = levelDiff > 0 ? levelDiff * 5 : 0;
    
    return Math.max(1, baseXP + levelBonus);
  }

  // Check if HashMon levels up
  checkLevelUp(hashmon, xpGained) {
    const currentXP = hashmon.xp || 0;
    const newXP = currentXP + xpGained;
    const xpRequiredForNextLevel = hashmon.level * 100;
    
    if (newXP >= xpRequiredForNextLevel) {
      const newLevel = hashmon.level + 1;
      
      // Update HashMon stats
      hashmon.level = newLevel;
      hashmon.xp = newXP - xpRequiredForNextLevel;
      
      // Increase stats on level up
      const statIncrease = Math.floor(Math.random() * 3) + 1;
      hashmon.hp = Math.min(hashmon.maxHp + statIncrease, hashmon.maxHp * 1.1);
      hashmon.attack = Math.floor(hashmon.attack * 1.05);
      hashmon.defense = Math.floor(hashmon.defense * 1.05);
      hashmon.speed = Math.floor(hashmon.speed * 1.05);
      
      return { levelUp: true, newLevel };
    }
    
    hashmon.xp = newXP;
    return { levelUp: false, newLevel: hashmon.level };
  }

  // Store battle session
  storeBattleSession(sessionId, session) {
    this.battleSessions.set(sessionId, session);
    
    // Clean up old sessions (older than 1 hour)
    setTimeout(() => {
      this.battleSessions.delete(sessionId);
    }, 60 * 60 * 1000);
  }

  // Get battle session
  getBattleSession(sessionId) {
    return this.battleSessions.get(sessionId);
  }

  // AI move selection based on strategy
  selectAIMove(aiOpponent, playerHashmon, strategy) {
    const moves = aiOpponent.moves;
    
    switch (strategy) {
      case 'aggressive':
        // Choose highest power move
        return moves.reduce((best, move) => 
          move.power > best.power ? move : best
        );
        
      case 'defensive':
        // Choose defensive moves when low HP
        if (aiOpponent.hp < aiOpponent.maxHp * 0.3) {
          const defensiveMove = moves.find(move => 
            move.name === 'Defend' || move.name === 'Restore'
          );
          if (defensiveMove) return defensiveMove;
        }
        // Otherwise choose balanced move
        return moves[Math.floor(Math.random() * moves.length)];
        
      case 'balanced':
        // Choose moves based on current situation
        if (aiOpponent.hp < aiOpponent.maxHp * 0.5 && Math.random() < 0.3) {
          const restoreMove = moves.find(move => move.name === 'Restore');
          if (restoreMove) return restoreMove;
        }
        return moves[Math.floor(Math.random() * moves.length)];
        
      case 'random':
      default:
        // Always use random selection for variety
        return moves[Math.floor(Math.random() * moves.length)];
    }
  }
}

// Singleton instance
const battleEngine = new BattleEngine();

module.exports = battleEngine;

