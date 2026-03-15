-- Onekof Supabase Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kxavbqpctaihavfoblta/sql/new

-- Enable pgvector extension for AI semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Success! You should see a row with 'vector' extension
-- This enables AI-powered semantic search for issues and documents
