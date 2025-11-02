-- HashMon Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    total_battles INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    total_xp BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HashMons table (reference data)
CREATE TABLE IF NOT EXISTS hashmons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type1 VARCHAR(20) NOT NULL,
    type2 VARCHAR(20),
    base_hp INTEGER NOT NULL,
    base_attack INTEGER NOT NULL,
    base_defense INTEGER NOT NULL,
    base_speed INTEGER NOT NULL,
    rarity INTEGER DEFAULT 1 CHECK (rarity BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player HashMons table (owned HashMons)
CREATE TABLE IF NOT EXISTS player_hashmons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_address VARCHAR(42) NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
    hashmon_id UUID NOT NULL REFERENCES hashmons(id),
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    type1 VARCHAR(20) NOT NULL,
    type2 VARCHAR(20),
    rarity INTEGER DEFAULT 1 CHECK (rarity BETWEEN 1 AND 5),
    nft_token_id BIGINT, -- Will be set when NFT is minted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_battle TIMESTAMP WITH TIME ZONE
);

-- Battle history table
CREATE TABLE IF NOT EXISTS battle_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_address VARCHAR(42) NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
    hashmon_id UUID NOT NULL REFERENCES player_hashmons(id) ON DELETE CASCADE,
    result VARCHAR(10) NOT NULL CHECK (result IN ('victory', 'defeat', 'draw')),
    xp_gained INTEGER DEFAULT 0,
    level_up BOOLEAN DEFAULT FALSE,
    new_level INTEGER,
    player_damage INTEGER DEFAULT 0,
    ai_damage INTEGER DEFAULT 0,
    battle_duration INTEGER, -- in milliseconds
    difficulty INTEGER DEFAULT 5 CHECK (difficulty BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_address VARCHAR(42) NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_data JSONB, -- Additional data for the achievement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT minting history table
CREATE TABLE IF NOT EXISTS nft_minting_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_address VARCHAR(42) NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
    hashmon_id UUID NOT NULL REFERENCES player_hashmons(id) ON DELETE CASCADE,
    token_id BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_last_active ON players(last_active);

CREATE INDEX IF NOT EXISTS idx_player_hashmons_player_address ON player_hashmons(player_address);
CREATE INDEX IF NOT EXISTS idx_player_hashmons_hashmon_id ON player_hashmons(hashmon_id);
CREATE INDEX IF NOT EXISTS idx_player_hashmons_nft_token_id ON player_hashmons(nft_token_id);

CREATE INDEX IF NOT EXISTS idx_battle_history_player_address ON battle_history(player_address);
CREATE INDEX IF NOT EXISTS idx_battle_history_created_at ON battle_history(created_at);
CREATE INDEX IF NOT EXISTS idx_battle_history_result ON battle_history(result);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player_address ON player_achievements(player_address);
CREATE INDEX IF NOT EXISTS idx_player_achievements_type ON player_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_nft_minting_player_address ON nft_minting_history(player_address);
CREATE INDEX IF NOT EXISTS idx_nft_minting_token_id ON nft_minting_history(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_minting_transaction_hash ON nft_minting_history(transaction_hash);

-- Row Level Security (RLS) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hashmons ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_minting_history ENABLE ROW LEVEL SECURITY;

-- Players can only see their own data
CREATE POLICY "Players can view own data" ON players
    FOR SELECT USING (wallet_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can update own data" ON players
    FOR UPDATE USING (wallet_address = current_setting('app.current_user_address', true));

-- Player HashMons policies
CREATE POLICY "Players can view own hashmons" ON player_hashmons
    FOR SELECT USING (player_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can insert own hashmons" ON player_hashmons
    FOR INSERT WITH CHECK (player_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can update own hashmons" ON player_hashmons
    FOR UPDATE USING (player_address = current_setting('app.current_user_address', true));

-- Battle history policies
CREATE POLICY "Players can view own battle history" ON battle_history
    FOR SELECT USING (player_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can insert own battle history" ON battle_history
    FOR INSERT WITH CHECK (player_address = current_setting('app.current_user_address', true));

-- Achievements policies
CREATE POLICY "Players can view own achievements" ON player_achievements
    FOR SELECT USING (player_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can insert own achievements" ON player_achievements
    FOR INSERT WITH CHECK (player_address = current_setting('app.current_user_address', true));

-- NFT minting history policies
CREATE POLICY "Players can view own nft history" ON nft_minting_history
    FOR SELECT USING (player_address = current_setting('app.current_user_address', true));

CREATE POLICY "Players can insert own nft history" ON nft_minting_history
    FOR INSERT WITH CHECK (player_address = current_setting('app.current_user_address', true));

-- Functions for common operations
CREATE OR REPLACE FUNCTION increment_battle_stats(
    p_player_address VARCHAR(42),
    p_result VARCHAR(10),
    p_xp_gained INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE players 
    SET 
        total_battles = total_battles + 1,
        total_xp = total_xp + p_xp_gained,
        last_active = NOW(),
        CASE p_result
            WHEN 'victory' THEN wins = wins + 1
            WHEN 'defeat' THEN losses = losses + 1
            WHEN 'draw' THEN draws = draws + 1
        END
    WHERE wallet_address = p_player_address;
END;
$$ LANGUAGE plpgsql;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(
    p_player_address VARCHAR(42)
) RETURNS VOID AS $$
DECLARE
    player_stats RECORD;
    achievement_count INTEGER;
BEGIN
    -- Get player stats
    SELECT * INTO player_stats FROM players WHERE wallet_address = p_player_address;
    
    -- Check for various achievements
    -- First Victory
    IF player_stats.wins = 1 AND NOT EXISTS (
        SELECT 1 FROM player_achievements 
        WHERE player_address = p_player_address AND achievement_type = 'first_victory'
    ) THEN
        INSERT INTO player_achievements (player_address, achievement_type, achievement_data)
        VALUES (p_player_address, 'first_victory', '{"message": "First Victory!"}');
    END IF;
    
    -- Battle Master (10 battles)
    IF player_stats.total_battles >= 10 AND NOT EXISTS (
        SELECT 1 FROM player_achievements 
        WHERE player_address = p_player_address AND achievement_type = 'battle_master'
    ) THEN
        INSERT INTO player_achievements (player_address, achievement_type, achievement_data)
        VALUES (p_player_address, 'battle_master', '{"message": "Battle Master!", "battles": ' || player_stats.total_battles || '}');
    END IF;
    
    -- Win Streak (5 wins in a row - simplified check)
    IF player_stats.wins >= 5 AND NOT EXISTS (
        SELECT 1 FROM player_achievements 
        WHERE player_address = p_player_address AND achievement_type = 'win_streak'
    ) THEN
        INSERT INTO player_achievements (player_address, achievement_type, achievement_data)
        VALUES (p_player_address, 'win_streak', '{"message": "Win Streak!", "wins": ' || player_stats.wins || '}');
    END IF;
    
    -- XP Collector (1000 total XP)
    IF player_stats.total_xp >= 1000 AND NOT EXISTS (
        SELECT 1 FROM player_achievements 
        WHERE player_address = p_player_address AND achievement_type = 'xp_collector'
    ) THEN
        INSERT INTO player_achievements (player_address, achievement_type, achievement_data)
        VALUES (p_player_address, 'xp_collector', '{"message": "XP Collector!", "total_xp": ' || player_stats.total_xp || '}');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert some default HashMon types
INSERT INTO hashmons (name, type1, type2, base_hp, base_attack, base_defense, base_speed, rarity) VALUES
('Flameon', 'Fire', NULL, 60, 65, 55, 60, 1),
('Aquaflow', 'Water', NULL, 65, 60, 60, 55, 1),
('Leafwing', 'Grass', NULL, 55, 55, 65, 65, 1),
('Thunderbolt', 'Electric', NULL, 50, 80, 50, 90, 2),
('Mindreader', 'Psychic', NULL, 70, 70, 60, 70, 2),
('Shadowstrike', 'Dark', NULL, 60, 85, 55, 80, 3),
('Ironclad', 'Steel', NULL, 80, 60, 80, 40, 3),
('Fistmaster', 'Fighting', NULL, 65, 90, 65, 70, 2),
('Stormcaller', 'Electric', 'Flying', 55, 75, 55, 95, 4),
('Voidwalker', 'Dark', 'Psychic', 70, 90, 70, 85, 5)
ON CONFLICT DO NOTHING;

