-- Revert Database Schema to Original Denormalized State
-- WARNING: This will drop the normalized junction tables and recreate the main tables with JSONB columns.

-- 1. DROP NEW NORMALIZED TABLES (and cascade to junction tables)
DROP TABLE IF EXISTS trs_coping_strategies CASCADE;
DROP TABLE IF EXISTS trs_brainstormed_alternatives CASCADE;
DROP TABLE IF EXISTS trs_evidence CASCADE;
DROP TABLE IF EXISTS trs_distortions CASCADE;
DROP TABLE IF EXISTS trs_physical_sensations CASCADE;
DROP TABLE IF EXISTS trs_emotions CASCADE;
DROP TABLE IF EXISTS trs_context_tags CASCADE;
DROP TABLE IF EXISTS thought_reframing_sessions CASCADE;

DROP TABLE IF EXISTS mood_triggers CASCADE;
DROP TABLE IF EXISTS mood_emotions CASCADE;
DROP TABLE IF EXISTS mood_logs CASCADE;

DROP TABLE IF EXISTS journal_conversations CASCADE;
DROP TABLE IF EXISTS journal_coping_strategies CASCADE;
DROP TABLE IF EXISTS journal_distortions CASCADE;
DROP TABLE IF EXISTS journal_emotions CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;

DROP TABLE IF EXISTS profiles CASCADE;

-- 2. RECREATE ORIGINAL TABLES (Denormalized)

-- ==========================================
-- PROFILES
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- usually references auth.users(id)
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- JOURNAL ENTRIES
-- ==========================================
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT,
  sentiment TEXT,
  mood_score INT,
  detected_emotions JSONB,
  detected_distortions JSONB,
  coping_strategies JSONB,
  core_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- JOURNAL CONVERSATIONS
-- ==========================================
CREATE TABLE journal_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- MOOD LOGS
-- ==========================================
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  local_timezone TEXT,
  valence FLOAT,
  arousal FLOAT,
  dominant_family TEXT,
  emotions JSONB,
  triggers JSONB,
  notes TEXT,
  source_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- THOUGHT REFRAMING SESSIONS (CBT)
-- ==========================================
CREATE TABLE thought_reframing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  situation_description TEXT,
  situation_date TIMESTAMP WITH TIME ZONE,
  automatic_thought TEXT,
  initial_belief INT,
  context_tags JSONB,
  initial_emotions JSONB,
  physical_sensations JSONB,
  cognitive_distortions JSONB,
  evidence_supporting JSONB,
  evidence_against JSONB,
  brainstormed_alternatives JSONB,
  selected_reframe TEXT,
  final_belief INT,
  final_emotions JSONB,
  belief_shift INT,
  takeaway TEXT,
  coping_strategies JSONB,
  duration_minutes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
