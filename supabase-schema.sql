-- Gift Exchange Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Create exchanges table
CREATE TABLE IF NOT EXISTS exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invite_code TEXT UNIQUE NOT NULL
);

-- Create exchange_memberships table
CREATE TABLE IF NOT EXISTS exchange_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exchange_id, wallet_address)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exchange_memberships_wallet 
    ON exchange_memberships(wallet_address);

CREATE INDEX IF NOT EXISTS idx_exchange_memberships_exchange 
    ON exchange_memberships(exchange_id);

CREATE INDEX IF NOT EXISTS idx_exchanges_invite_code 
    ON exchanges(invite_code);

CREATE INDEX IF NOT EXISTS idx_exchanges_created_by 
    ON exchanges(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchanges table
-- Allow anyone to read exchanges they are a member of
CREATE POLICY "Users can read exchanges they are members of"
    ON exchanges FOR SELECT
    USING (
        id IN (
            SELECT exchange_id 
            FROM exchange_memberships 
            WHERE wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address'
        )
        OR created_by = current_setting('request.jwt.claims')::json->>'wallet_address'
    );

-- Allow authenticated users to create exchanges
CREATE POLICY "Authenticated users can create exchanges"
    ON exchanges FOR INSERT
    WITH CHECK (true);

-- Allow creators to update their exchanges
CREATE POLICY "Creators can update their exchanges"
    ON exchanges FOR UPDATE
    USING (created_by = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Allow creators to delete their exchanges
CREATE POLICY "Creators can delete their exchanges"
    ON exchanges FOR DELETE
    USING (created_by = current_setting('request.jwt.claims')::json->>'wallet_address');

-- RLS Policies for exchange_memberships table
-- Allow users to read memberships of exchanges they are in
CREATE POLICY "Users can read memberships of their exchanges"
    ON exchange_memberships FOR SELECT
    USING (
        exchange_id IN (
            SELECT exchange_id 
            FROM exchange_memberships 
            WHERE wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address'
        )
    );

-- Allow users to join exchanges
CREATE POLICY "Users can join exchanges"
    ON exchange_memberships FOR INSERT
    WITH CHECK (true);

-- Allow users to leave exchanges
CREATE POLICY "Users can leave exchanges"
    ON exchange_memberships FOR DELETE
    USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Note: For the application to work with RLS, you'll need to either:
-- 1. Use the service role key (bypasses RLS) in server-side API routes
-- 2. Or disable RLS and handle permissions in your application layer
-- 
-- For simplicity, you can disable RLS and handle permissions in code:
-- ALTER TABLE exchanges DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE exchange_memberships DISABLE ROW LEVEL SECURITY;

