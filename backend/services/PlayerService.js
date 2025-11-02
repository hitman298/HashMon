const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const RARITY_STRING_TO_NUM = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 5
};

const RARITY_NUM_TO_STRING = Object.entries(RARITY_STRING_TO_NUM)
  .reduce((acc, [key, value]) => (
    acc[value] = acc[value] || key,
    acc
  ), {});

const STARTER_HASHMONS = {
  fire: {
    name: 'Flameon',
    type1: 'Fire',
    type2: '',
    stats: { hp: 60, attack: 65, defense: 55, speed: 60 },
    rarity: 'common'
  },
  water: {
    name: 'Aquaflow',
    type1: 'Water',
    type2: '',
    stats: { hp: 65, attack: 60, defense: 60, speed: 55 },
    rarity: 'common'
  },
  grass: {
    name: 'Leafwing',
    type1: 'Grass',
    type2: '',
    stats: { hp: 55, attack: 55, defense: 65, speed: 65 },
    rarity: 'common'
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const toLowerAddress = (address) => (typeof address === 'string' ? address.toLowerCase() : address);

const normalizeHashmonId = (hashmonId) => {
  if (hashmonId === undefined || hashmonId === null) {
    return null;
  }
  return String(hashmonId).trim();
};

const rarityToString = (rarity) => {
  if (typeof rarity === 'string') {
    return rarity.toLowerCase();
  }
  if (typeof rarity === 'number') {
    return RARITY_NUM_TO_STRING[rarity] || 'common';
  }
  return 'common';
};

const rarityToNumeric = (rarity) => {
  if (typeof rarity === 'number' && rarity > 0) {
    return rarity;
  }
  if (typeof rarity === 'string') {
    return RARITY_STRING_TO_NUM[rarity.toLowerCase()] || 1;
  }
  return 1;
};

const capitalizeType = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const extractStats = (hashmonData = {}) => {
  const statsSource = hashmonData.stats || {};

  const getNumber = (input, fallback) => {
    const value = input ?? fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const hp = getNumber(statsSource.hp ?? hashmonData.hp ?? hashmonData.maxHp, 50);
  const attack = getNumber(statsSource.attack ?? hashmonData.attack, 50);
  const defense = getNumber(statsSource.defense ?? hashmonData.defense, 50);
  const speed = getNumber(statsSource.speed ?? hashmonData.speed, 50);

  return { hp, attack, defense, speed };
};

class InMemoryPlayerRepository {
  constructor() {
    this.players = new Map();
    this.hashmonsByPlayer = new Map();
    this.battleHistoryByPlayer = new Map();
    this.achievementsByPlayer = new Map();
  }

  ensurePlayer(address) {
    const normalized = toLowerAddress(address);

    if (!this.players.has(normalized)) {
      const now = new Date().toISOString();
        const newPlayer = {
        id: randomUUID(),
        walletAddress: normalized,
        username: `Player_${normalized.slice(2, 8)}`,
          level: 1,
        totalBattles: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        totalXp: 0,
        createdAt: now,
        lastActive: now
      };

      this.players.set(normalized, newPlayer);
      this.hashmonsByPlayer.set(normalized, new Map());
      this.battleHistoryByPlayer.set(normalized, []);
      this.achievementsByPlayer.set(normalized, []);
    }

    const player = this.players.get(normalized);
    player.lastActive = new Date().toISOString();
    this.players.set(normalized, player);

    return player;
  }

  async getOrCreatePlayer(address) {
    const player = this.ensurePlayer(address);
    return clone(player);
  }

  async getPlayerHashmons(address) {
    const normalized = toLowerAddress(address);
    this.ensurePlayer(normalized);

    const hashmonsMap = this.hashmonsByPlayer.get(normalized) || new Map();
    return Array.from(hashmonsMap.values()).map((hashmon) => clone(hashmon));
  }

  async getPlayerHashmon(address, hashmonId) {
    const normalized = toLowerAddress(address);
    this.ensurePlayer(normalized);

    const collection = this.hashmonsByPlayer.get(normalized) || new Map();
    const hashmon = collection.get(normalizeHashmonId(hashmonId));
    return hashmon ? clone(hashmon) : null;
  }

  async addHashmonToPlayer(address, hashmonData = {}) {
    const normalized = toLowerAddress(address);
    const player = this.ensurePlayer(normalized);

    const stats = extractStats(hashmonData);
    const level = Number(hashmonData.level ?? hashmonData.hashmonLevel ?? 1);
    const hashmonId = normalizeHashmonId(hashmonData.id) || randomUUID();
    const now = new Date().toISOString();

    const normalizedHashmon = {
      id: hashmonId,
      name: hashmonData.name || `HashMon-${hashmonId.slice(0, 6)}`,
      level,
      xp: Number(hashmonData.xp ?? hashmonData.experience ?? 0),
      xpToNext: (level || 1) * 100,
      hp: stats.hp,
      maxHp: Number(hashmonData.maxHp ?? stats.hp),
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      type1: hashmonData.type1 || capitalizeType(hashmonData.type) || 'Normal',
      type2: hashmonData.type2 || '',
      rarity: rarityToString(hashmonData.rarity),
      stats: { ...stats },
      isShiny: Boolean(hashmonData.isShiny),
      nftTokenId: hashmonData.nftTokenId || null,
      createdAt: now,
      updatedAt: now,
      owner: player.walletAddress
    };

    const hashmonsMap = this.hashmonsByPlayer.get(normalized) || new Map();
    hashmonsMap.set(hashmonId, normalizedHashmon);
    this.hashmonsByPlayer.set(normalized, hashmonsMap);

    return clone(normalizedHashmon);
  }

  async updatePlayerStats(address, hashmonId, battleResult = {}) {
    const normalized = toLowerAddress(address);
    const player = this.ensurePlayer(normalized);

    player.totalBattles += 1;
    player.totalXp += Number(battleResult.xpGained || 0);

    switch (battleResult.result) {
      case 'victory':
        player.wins += 1;
        break;
      case 'defeat':
        player.losses += 1;
        break;
      case 'draw':
        player.draws += 1;
        break;
      default:
        break;
    }

    player.lastActive = new Date().toISOString();
    this.players.set(normalized, player);

    const hashmonsMap = this.hashmonsByPlayer.get(normalized) || new Map();
    const hashmon = hashmonsMap.get(normalizeHashmonId(hashmonId));

    if (hashmon) {
      hashmon.level = battleResult.playerHashmon?.level ?? battleResult.newLevel ?? hashmon.level;
      hashmon.xp = battleResult.playerHashmon?.xp ?? hashmon.xp + Number(battleResult.xpGained || 0);
      hashmon.hp = battleResult.playerHashmon?.hp ?? hashmon.hp;
      hashmon.maxHp = battleResult.playerHashmon?.maxHp ?? hashmon.maxHp;
      hashmon.attack = battleResult.playerHashmon?.attack ?? hashmon.attack;
      hashmon.defense = battleResult.playerHashmon?.defense ?? hashmon.defense;
      hashmon.speed = battleResult.playerHashmon?.speed ?? hashmon.speed;
      hashmon.stats = {
        hp: hashmon.hp,
        attack: hashmon.attack,
        defense: hashmon.defense,
        speed: hashmon.speed
      };
      hashmon.updatedAt = new Date().toISOString();

      hashmonsMap.set(hashmon.id, hashmon);
      this.hashmonsByPlayer.set(normalized, hashmonsMap);
    }

    await this.logBattle(address, hashmonId, battleResult);

    return {
      player: clone(player),
      hashmon: hashmon ? clone(hashmon) : null
    };
  }

  async logBattle(address, hashmonId, battleResult = {}) {
    const normalized = toLowerAddress(address);
    this.ensurePlayer(normalized);

    const history = this.battleHistoryByPlayer.get(normalized) || [];
    const entry = {
      id: randomUUID(),
      playerAddress: normalized,
      hashmonId: normalizeHashmonId(hashmonId),
      result: battleResult.result || 'ongoing',
      xpGained: Number(battleResult.xpGained || 0),
      levelUp: Boolean(battleResult.levelUp),
      newLevel: battleResult.newLevel ?? battleResult.playerHashmon?.level ?? null,
      playerDamage: Number(battleResult.playerDamage || 0),
      aiDamage: Number(battleResult.aiDamage || 0),
      battleDuration: battleResult.battleDuration || 0,
      difficulty: battleResult.difficulty || 5,
      createdAt: new Date().toISOString()
    };

    history.unshift(entry);
    this.battleHistoryByPlayer.set(normalized, history.slice(0, 200));

    return clone(entry);
  }

  async getBattleHistory(address, limit = 20, offset = 0) {
    const normalized = toLowerAddress(address);
    const history = this.battleHistoryByPlayer.get(normalized) || [];

    return history
      .slice(offset, offset + limit)
      .map((entry) => clone(entry));
  }

  async getLeaderboard(type = 'wins', limit = 100) {
    const players = Array.from(this.players.values());

    const metricMap = {
      wins: 'wins',
      losses: 'losses',
      draws: 'draws',
      total_xp: 'totalXp',
      totalXp: 'totalXp',
      total_battles: 'totalBattles',
      totalBattles: 'totalBattles',
      level: 'level'
    };

    const key = metricMap[type] || 'wins';

    return players
      .sort((a, b) => (b[key] || 0) - (a[key] || 0))
      .slice(0, limit)
      .map((player) => clone(player));
  }

  async updateHashmonNFT(address, hashmonId, nftTokenId) {
    const normalized = toLowerAddress(address);
    const hashmonsMap = this.hashmonsByPlayer.get(normalized) || new Map();
    const hashmon = hashmonsMap.get(normalizeHashmonId(hashmonId));

    if (!hashmon) {
      return null;
    }

    hashmon.nftTokenId = nftTokenId;
    hashmon.updatedAt = new Date().toISOString();
    hashmonsMap.set(hashmon.id, hashmon);
    this.hashmonsByPlayer.set(normalized, hashmonsMap);

    return clone(hashmon);
  }

  async getPlayerAchievements(address) {
    const normalized = toLowerAddress(address);
    this.ensurePlayer(normalized);

    const achievements = this.achievementsByPlayer.get(normalized) || [];
    return achievements.map((achievement) => clone(achievement));
  }

  async addAchievement(address, achievementType, achievementData = {}) {
    const normalized = toLowerAddress(address);
    this.ensurePlayer(normalized);

    const achievements = this.achievementsByPlayer.get(normalized) || [];
    const achievement = {
      id: randomUUID(),
      playerAddress: normalized,
      achievementType,
      achievementData,
      createdAt: new Date().toISOString()
    };

    achievements.unshift(achievement);
    this.achievementsByPlayer.set(normalized, achievements);

    return clone(achievement);
  }

  async createStarterHashmon(address, starterType = 'fire') {
    const template = STARTER_HASHMONS[starterType] || STARTER_HASHMONS.fire;
    const hashmonPayload = {
      id: randomUUID(),
      name: template.name,
          level: 1,
      xp: 0,
      stats: template.stats,
      type1: template.type1,
      type2: template.type2,
      rarity: template.rarity
    };

    return this.addHashmonToPlayer(address, hashmonPayload);
  }
}

class SupabasePlayerRepository {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  mapPlayer(record) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      walletAddress: record.wallet_address,
      username: record.username,
      level: record.level,
      totalBattles: record.total_battles,
      wins: record.wins,
      losses: record.losses,
      draws: record.draws,
      totalXp: record.total_xp,
      createdAt: record.created_at,
      lastActive: record.last_active
    };
  }

  mapHashmon(record) {
    if (!record) {
      return null;
    }

    const base = record.hashmons || {};
    const rarity = rarityToString(record.rarity);

    return {
      id: record.id,
      hashmonId: record.hashmon_id,
      owner: record.player_address,
      name: base.name || `HashMon-${String(record.id).slice(0, 6)}`,
      level: record.level,
      xp: record.xp,
      xpToNext: (record.level || 1) * 100,
      hp: record.hp,
      maxHp: record.max_hp,
      attack: record.attack,
      defense: record.defense,
      speed: record.speed,
      type1: record.type1 || base.type1 || 'Normal',
      type2: record.type2 || base.type2 || '',
      rarity,
      stats: {
        hp: record.hp,
        attack: record.attack,
        defense: record.defense,
        speed: record.speed
      },
      nftTokenId: record.nft_token_id || null,
      createdAt: record.created_at,
      updatedAt: record.last_battle || record.updated_at || record.created_at,
      isShiny: Boolean(record.is_shiny)
    };
  }

  mapBattle(record) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      playerAddress: record.player_address,
      hashmonId: record.hashmon_id,
      result: record.result,
      xpGained: record.xp_gained,
      levelUp: record.level_up,
      newLevel: record.new_level,
      playerDamage: record.player_damage,
      aiDamage: record.ai_damage,
      battleDuration: record.battle_duration,
      difficulty: record.difficulty,
      createdAt: record.created_at
    };
  }

  mapAchievement(record) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      playerAddress: record.player_address,
      achievementType: record.achievement_type,
      achievementData: record.achievement_data,
      createdAt: record.created_at
    };
  }

  async ensurePlayer(address) {
    const normalized = toLowerAddress(address);

    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('wallet_address', normalized)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load player: ${error.message}`);
    }

    if (data) {
      return data;
    }

    const now = new Date().toISOString();
    const payload = {
      wallet_address: normalized,
      username: `Player_${normalized.slice(2, 8)}`,
          level: 1,
          total_battles: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          total_xp: 0,
      created_at: now,
      last_active: now
    };

    const { data: inserted, error: insertError } = await this.supabase
      .from('players')
      .insert(payload)
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to create player: ${insertError.message}`);
    }

    return inserted;
  }

  async getOrCreatePlayer(address) {
    const playerRecord = await this.ensurePlayer(address);
    return this.mapPlayer(playerRecord);
  }

  async ensureHashmonTemplate(hashmonData = {}) {
    const desiredName = hashmonData.name || `HashMon-${randomUUID().slice(0, 8)}`;

    const { data, error } = await this.supabase
      .from('hashmons')
      .select('*')
      .eq('name', desiredName)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch base HashMon: ${error.message}`);
    }

    if (data) {
      return data;
    }

    const stats = extractStats(hashmonData);
    const payload = {
      name: desiredName,
      type1: hashmonData.type1 || capitalizeType(hashmonData.type) || 'Normal',
      type2: hashmonData.type2 || null,
      base_hp: stats.hp,
      base_attack: stats.attack,
      base_defense: stats.defense,
      base_speed: stats.speed,
      rarity: rarityToNumeric(hashmonData.rarity)
    };

    const { data: inserted, error: insertError } = await this.supabase
      .from('hashmons')
      .insert(payload)
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to create base HashMon: ${insertError.message}`);
    }

    return inserted;
  }

  async getPlayerHashmons(address) {
    const normalized = toLowerAddress(address);
    await this.ensurePlayer(normalized);

    const { data, error } = await this.supabase
        .from('player_hashmons')
        .select(`
        id,
        player_address,
        hashmon_id,
        level,
        xp,
        hp,
        max_hp,
        attack,
        defense,
        speed,
        type1,
        type2,
        rarity,
        nft_token_id,
        created_at,
        last_battle,
        hashmons ( id, name, type1, type2, rarity )
      `)
      .eq('player_address', normalized)
      .order('created_at', { ascending: false });

      if (error) {
      throw new Error(`Failed to fetch player HashMons: ${error.message}`);
    }

    return (data || []).map((record) => this.mapHashmon(record));
  }

  async getPlayerHashmon(address, hashmonId) {
    const normalized = toLowerAddress(address);
    await this.ensurePlayer(normalized);

    const { data, error } = await this.supabase
      .from('player_hashmons')
      .select(`
        id,
        player_address,
        hashmon_id,
        level,
        xp,
        hp,
        max_hp,
        attack,
        defense,
        speed,
        type1,
        type2,
        rarity,
        nft_token_id,
        created_at,
        last_battle,
        hashmons ( id, name, type1, type2, rarity )
      `)
      .eq('player_address', normalized)
      .eq('id', normalizeHashmonId(hashmonId))
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch player HashMon: ${error.message}`);
    }

    return this.mapHashmon(data);
  }

  async addHashmonToPlayer(address, hashmonData = {}) {
    const normalized = toLowerAddress(address);
    await this.ensurePlayer(normalized);

    const baseTemplate = await this.ensureHashmonTemplate(hashmonData);
    const stats = extractStats(hashmonData);
    const level = Number(hashmonData.level ?? 1);

    const payload = {
      player_address: normalized,
      hashmon_id: baseTemplate ? baseTemplate.id : randomUUID(),
      level,
      xp: Number(hashmonData.xp ?? hashmonData.experience ?? 0),
      hp: stats.hp,
      max_hp: Number(hashmonData.maxHp ?? stats.hp),
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      type1: hashmonData.type1 || baseTemplate?.type1 || capitalizeType(hashmonData.type) || 'Normal',
      type2: hashmonData.type2 || baseTemplate?.type2 || null,
      rarity: rarityToNumeric(hashmonData.rarity),
      nft_token_id: hashmonData.nftTokenId || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
        .from('player_hashmons')
      .insert(payload)
      .select(`
        id,
        player_address,
        hashmon_id,
        level,
        xp,
        hp,
        max_hp,
        attack,
        defense,
        speed,
        type1,
        type2,
        rarity,
        nft_token_id,
        created_at,
        last_battle,
        hashmons ( id, name, type1, type2, rarity )
      `)
        .single();

      if (error) {
      throw new Error(`Failed to add HashMon: ${error.message}`);
    }

    return this.mapHashmon(data);
  }

  async updatePlayerStats(address, hashmonId, battleResult = {}) {
    const normalized = toLowerAddress(address);
    const hashmonKey = normalizeHashmonId(hashmonId);
    const now = new Date().toISOString();

    const playerRecord = await this.ensurePlayer(normalized);

    const playerUpdate = {
      total_battles: Number(playerRecord.total_battles || 0) + 1,
      total_xp: Number(playerRecord.total_xp || 0) + Number(battleResult.xpGained || 0),
      wins: Number(playerRecord.wins || 0) + (battleResult.result === 'victory' ? 1 : 0),
      losses: Number(playerRecord.losses || 0) + (battleResult.result === 'defeat' ? 1 : 0),
      draws: Number(playerRecord.draws || 0) + (battleResult.result === 'draw' ? 1 : 0),
      last_active: now
    };

    const { error: playerUpdateError } = await this.supabase
      .from('players')
      .update(playerUpdate)
      .eq('wallet_address', normalized);

    if (playerUpdateError) {
      throw new Error(`Failed to update player stats: ${playerUpdateError.message}`);
    }

    const { data: hashmonRecord, error: hashmonError } = await this.supabase
      .from('player_hashmons')
      .select('xp, level, hp, max_hp, attack, defense, speed')
      .eq('player_address', normalized)
      .eq('id', hashmonKey)
      .single();

    if (hashmonError) {
      throw new Error(`Failed to load player HashMon: ${hashmonError.message}`);
    }

    const hashmonUpdate = {
      level: battleResult.playerHashmon?.level ?? battleResult.newLevel ?? hashmonRecord.level,
      xp: battleResult.playerHashmon?.xp ?? Number(hashmonRecord.xp || 0) + Number(battleResult.xpGained || 0),
      hp: battleResult.playerHashmon?.hp ?? hashmonRecord.hp,
      max_hp: battleResult.playerHashmon?.maxHp ?? hashmonRecord.max_hp,
      attack: battleResult.playerHashmon?.attack ?? hashmonRecord.attack,
      defense: battleResult.playerHashmon?.defense ?? hashmonRecord.defense,
      speed: battleResult.playerHashmon?.speed ?? hashmonRecord.speed,
      last_battle: now
    };

    const { error: hashmonUpdateError } = await this.supabase
        .from('player_hashmons')
      .update(hashmonUpdate)
      .eq('player_address', normalized)
      .eq('id', hashmonKey);

    if (hashmonUpdateError) {
      throw new Error(`Failed to update HashMon: ${hashmonUpdateError.message}`);
    }

    await this.logBattle(address, hashmonId, battleResult);

    return {
      player: await this.getOrCreatePlayer(normalized),
      hashmon: await this.getPlayerHashmon(normalized, hashmonId)
    };
  }

  async logBattle(address, hashmonId, battleResult = {}) {
    const normalized = toLowerAddress(address);
    await this.ensurePlayer(normalized);

    const payload = {
      player_address: normalized,
      hashmon_id: normalizeHashmonId(hashmonId),
      result: battleResult.result || 'ongoing',
      xp_gained: Number(battleResult.xpGained || 0),
      level_up: Boolean(battleResult.levelUp),
      new_level: battleResult.newLevel ?? battleResult.playerHashmon?.level ?? null,
      player_damage: Number(battleResult.playerDamage || 0),
      ai_damage: Number(battleResult.aiDamage || 0),
      battle_duration: battleResult.battleDuration || 0,
      difficulty: battleResult.difficulty || 5,
      created_at: new Date().toISOString()
    };

      const { data, error } = await this.supabase
        .from('battle_history')
      .insert(payload)
      .select('*')
        .single();

      if (error) {
      throw new Error(`Failed to log battle: ${error.message}`);
    }

    return this.mapBattle(data);
  }

  async getBattleHistory(address, limit = 20, offset = 0) {
    const normalized = toLowerAddress(address);
    await this.ensurePlayer(normalized);

    const { data, error } = await this.supabase
        .from('battle_history')
      .select('*')
      .eq('player_address', normalized)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
      throw new Error(`Failed to fetch battle history: ${error.message}`);
    }

    return (data || []).map((record) => this.mapBattle(record));
  }

  async getLeaderboard(type = 'wins', limit = 100) {
    const metric = ['wins', 'losses', 'draws', 'total_xp', 'total_battles', 'level'].includes(type)
      ? type
      : 'wins';

    const { data, error } = await this.supabase
        .from('players')
      .select('*')
      .order(metric, { ascending: false })
        .limit(limit);

      if (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    return (data || []).map((record) => this.mapPlayer(record));
  }

  async updateHashmonNFT(address, hashmonId, nftTokenId) {
    const normalized = toLowerAddress(address);

      const { data, error } = await this.supabase
        .from('player_hashmons')
      .update({
        nft_token_id: nftTokenId,
        last_battle: new Date().toISOString()
      })
      .eq('player_address', normalized)
      .eq('id', normalizeHashmonId(hashmonId))
      .select(`
        id,
        player_address,
        hashmon_id,
        level,
        xp,
        hp,
        max_hp,
        attack,
        defense,
        speed,
        type1,
        type2,
        rarity,
        nft_token_id,
        created_at,
        last_battle,
        hashmons ( id, name, type1, type2, rarity )
      `)
        .single();

      if (error) {
      throw new Error(`Failed to update HashMon NFT reference: ${error.message}`);
    }

    return this.mapHashmon(data);
  }

  async getPlayerAchievements(address) {
    const normalized = toLowerAddress(address);

    const { data, error } = await this.supabase
        .from('player_achievements')
        .select('*')
      .eq('player_address', normalized)
        .order('created_at', { ascending: false });

      if (error) {
      throw new Error(`Failed to fetch player achievements: ${error.message}`);
    }

    return (data || []).map((record) => this.mapAchievement(record));
  }

  async addAchievement(address, achievementType, achievementData = {}) {
    const normalized = toLowerAddress(address);

    const payload = {
      player_address: normalized,
          achievement_type: achievementType,
          achievement_data: achievementData,
          created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('player_achievements')
      .insert(payload)
      .select('*')
        .single();

      if (error) {
      throw new Error(`Failed to add achievement: ${error.message}`);
    }

    return this.mapAchievement(data);
  }

  async createStarterHashmon(address, starterType = 'fire') {
    const template = STARTER_HASHMONS[starterType] || STARTER_HASHMONS.fire;

    return this.addHashmonToPlayer(address, {
      name: template.name,
      level: 1,
      stats: template.stats,
      type1: template.type1,
      type2: template.type2,
      rarity: template.rarity
    });
  }
}

class PlayerService {
  constructor() {
    this.repository = this.initializeRepository();
  }

  initializeRepository() {
    const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasSupabaseConfig) {
      try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            persistSession: false
          }
        });

        console.log('✅ PlayerService: Supabase client initialized');
        return new SupabasePlayerRepository(supabase);
      } catch (error) {
        console.warn('⚠️ PlayerService: Failed to initialize Supabase client, falling back to in-memory store.', error);
      }
    } else {
      console.warn('ℹ️ PlayerService: Supabase configuration not found. Using in-memory player store.');
    }

    return new InMemoryPlayerRepository();
  }

  normalizeAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Player address is required');
    }

    return toLowerAddress(address);
  }

  async getOrCreatePlayer(address) {
    return this.repository.getOrCreatePlayer(this.normalizeAddress(address));
  }

  async getPlayerHashmons(address) {
    return this.repository.getPlayerHashmons(this.normalizeAddress(address));
  }

  async getPlayerHashmon(address, hashmonId) {
    return this.repository.getPlayerHashmon(this.normalizeAddress(address), normalizeHashmonId(hashmonId));
  }

  async addHashmonToPlayer(address, hashmonData) {
    return this.repository.addHashmonToPlayer(this.normalizeAddress(address), hashmonData);
  }

  async updatePlayerStats(address, hashmonId, battleResult) {
    return this.repository.updatePlayerStats(
      this.normalizeAddress(address),
      normalizeHashmonId(hashmonId),
      battleResult
    );
  }

  async logBattle(address, hashmonId, battleResult) {
    return this.repository.logBattle(
      this.normalizeAddress(address),
      normalizeHashmonId(hashmonId),
      battleResult
    );
  }

  async getBattleHistory(address, limit = 20, offset = 0) {
    return this.repository.getBattleHistory(this.normalizeAddress(address), limit, offset);
  }

  async getLeaderboard(type = 'wins', limit = 100) {
    return this.repository.getLeaderboard(type, limit);
  }

  async updateHashmonNFT(address, hashmonId, nftTokenId) {
    return this.repository.updateHashmonNFT(
      this.normalizeAddress(address),
      normalizeHashmonId(hashmonId),
      nftTokenId
    );
  }

  async getPlayerAchievements(address) {
    return this.repository.getPlayerAchievements(this.normalizeAddress(address));
  }

  async addAchievement(address, achievementType, achievementData) {
    return this.repository.addAchievement(
      this.normalizeAddress(address),
      achievementType,
      achievementData
    );
  }

  async createStarterHashmon(address, starterType = 'fire') {
    return this.repository.createStarterHashmon(this.normalizeAddress(address), starterType);
  }

  async getPlayerStats(address) {
    const normalized = this.normalizeAddress(address);

    const [player, hashmons, achievements, recentBattles] = await Promise.all([
      this.getOrCreatePlayer(normalized),
      this.getPlayerHashmons(normalized),
      this.getPlayerAchievements(normalized),
      this.getBattleHistory(normalized, 10, 0)
    ]);

    const totalBattles = Number(player?.totalBattles || 0);
    const totalXp = Number(player?.totalXp || 0);
    const wins = Number(player?.wins || 0);

      return {
      player,
      hashmons,
      achievements,
      recentBattles,
        stats: {
          totalHashmons: hashmons.length,
          totalAchievements: achievements.length,
        winRate: totalBattles > 0 ? Number(((wins / totalBattles) * 100).toFixed(2)) : 0,
        averageXP: totalBattles > 0 ? Number((totalXp / totalBattles).toFixed(2)) : 0
      }
    };
  }
}

module.exports = new PlayerService();

