-- Token Launchpad Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Drop existing tables (CASCADE removes dependencies)
-- ============================================
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS activity CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;

-- ============================================
-- Tokens Table (Launched tokens from bonding curve)
-- ============================================
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(32) NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    creator VARCHAR(255) NOT NULL,
    
    -- Token metadata
    image_uri TEXT,
    description TEXT,
    
    -- Bonding curve state
    tokens_sold DECIMAL(38, 8) NOT NULL DEFAULT 0,
    stx_reserve DECIMAL(38, 8) NOT NULL DEFAULT 0,
    current_price DECIMAL(38, 8) NOT NULL DEFAULT 0.01,
    market_cap DECIMAL(38, 8) NOT NULL DEFAULT 0,
    
    -- Graduation status
    is_graduated BOOLEAN NOT NULL DEFAULT FALSE,
    graduated_at TIMESTAMPTZ,
    alex_pool_address VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Trades Table (Buy/Sell transactions)
-- ============================================
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    tx_id VARCHAR(255) NOT NULL UNIQUE,
    trader VARCHAR(255) NOT NULL,
    
    -- Trade details
    trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    stx_amount DECIMAL(38, 8) NOT NULL,
    token_amount DECIMAL(38, 8) NOT NULL,
    price_at_trade DECIMAL(38, 8) NOT NULL,
    
    -- Fees
    platform_fee DECIMAL(38, 8) DEFAULT 0,
    creator_fee DECIMAL(38, 8) DEFAULT 0,
    
    -- Block info
    block_height BIGINT,
    timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Activity Table (All events)
-- ============================================
CREATE TABLE activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    tx_id VARCHAR(255),
    address VARCHAR(255),
    token_id UUID REFERENCES tokens(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event types: 'token_created', 'buy', 'sell', 'graduated'

-- ============================================
-- Leaderboard Table (Top traders)
-- ============================================
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(255) NOT NULL UNIQUE,
    total_trades INTEGER NOT NULL DEFAULT 0,
    total_volume_stx DECIMAL(38, 8) DEFAULT 0,
    total_profit_stx DECIMAL(38, 8) DEFAULT 0,
    tokens_created INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_tokens_creator ON tokens(creator);
CREATE INDEX idx_tokens_is_graduated ON tokens(is_graduated);
CREATE INDEX idx_tokens_market_cap ON tokens(market_cap DESC);
CREATE INDEX idx_tokens_created_at ON tokens(created_at DESC);

CREATE INDEX idx_trades_token_id ON trades(token_id);
CREATE INDEX idx_trades_trader ON trades(trader);
CREATE INDEX idx_trades_tx_id ON trades(tx_id);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);

CREATE INDEX idx_activity_event_type ON activity(event_type);
CREATE INDEX idx_activity_address ON activity(address);
CREATE INDEX idx_activity_token_id ON activity(token_id);
CREATE INDEX idx_activity_created_at ON activity(created_at DESC);

CREATE INDEX idx_leaderboard_volume ON leaderboard(total_volume_stx DESC);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tokens" ON tokens FOR SELECT USING (true);
CREATE POLICY "Public can read trades" ON trades FOR SELECT USING (true);
CREATE POLICY "Public can read activity" ON activity FOR SELECT USING (true);
CREATE POLICY "Public can read leaderboard" ON leaderboard FOR SELECT USING (true);

CREATE POLICY "Service role full access tokens" ON tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access trades" ON trades FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access activity" ON activity FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access leaderboard" ON leaderboard FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Functions
-- ============================================

-- Update token stats after trade
CREATE OR REPLACE FUNCTION update_token_after_trade()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tokens 
        SET 
            tokens_sold = CASE 
                WHEN NEW.trade_type = 'buy' THEN tokens_sold + NEW.token_amount
                ELSE tokens_sold - NEW.token_amount
            END,
            stx_reserve = CASE 
                WHEN NEW.trade_type = 'buy' THEN stx_reserve + NEW.stx_amount
                ELSE stx_reserve - NEW.stx_amount
            END,
            current_price = NEW.price_at_trade,
            market_cap = (tokens_sold + CASE WHEN NEW.trade_type = 'buy' THEN NEW.token_amount ELSE -NEW.token_amount END) * NEW.price_at_trade,
            updated_at = NOW()
        WHERE id = NEW.token_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_token_after_trade
AFTER INSERT ON trades
FOR EACH ROW
EXECUTE FUNCTION update_token_after_trade();

-- Update leaderboard after trade
CREATE OR REPLACE FUNCTION update_leaderboard_after_trade()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leaderboard (address, total_trades, total_volume_stx)
    VALUES (NEW.trader, 1, NEW.stx_amount)
    ON CONFLICT (address) DO UPDATE SET
        total_trades = leaderboard.total_trades + 1,
        total_volume_stx = leaderboard.total_volume_stx + NEW.stx_amount,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leaderboard_after_trade
AFTER INSERT ON trades
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_after_trade();
