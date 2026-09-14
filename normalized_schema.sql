-- Normalized Database Schema for Sentience

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure a clean schema if re-run
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

-- Core Profiles Table (Used for Sentience Custom Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  timezone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 1. JOURNAL ENTRIES
-- ==========================================
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Should reference auth.users(id)
  content TEXT,
  sentiment TEXT,
  mood_score INT,
  core_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Journal Junction Tables
CREATE TABLE journal_emotions (
  journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  emotion_label TEXT,
  PRIMARY KEY (journal_id, emotion_label)
);

CREATE TABLE journal_distortions (
  journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  distortion_label TEXT,
  PRIMARY KEY (journal_id, distortion_label)
);

CREATE TABLE journal_coping_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  strategy_text TEXT
);

CREATE TABLE journal_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 2. MOOD LOGS
-- ==========================================
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  local_timezone TEXT,
  valence FLOAT,
  arousal FLOAT,
  dominant_family TEXT,
  notes TEXT,
  source_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mood Junction Tables
CREATE TABLE mood_emotions (
  mood_log_id UUID REFERENCES mood_logs(id) ON DELETE CASCADE,
  emotion_id TEXT,
  intensity INT,
  PRIMARY KEY (mood_log_id, emotion_id)
);

CREATE TABLE mood_triggers (
  mood_log_id UUID REFERENCES mood_logs(id) ON DELETE CASCADE,
  trigger_name TEXT,
  PRIMARY KEY (mood_log_id, trigger_name)
);

-- ==========================================
-- 3. THOUGHT REFRAMING SESSIONS (CBT)
-- ==========================================
CREATE TABLE thought_reframing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  situation_description TEXT,
  situation_date TIMESTAMP WITH TIME ZONE,
  automatic_thought TEXT,
  initial_belief INT,
  final_belief INT,
  belief_shift INT,
  selected_reframe TEXT,
  takeaway TEXT,
  duration_minutes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CBT Junction Tables
CREATE TABLE trs_context_tags (
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  tag TEXT,
  PRIMARY KEY (session_id, tag)
);

CREATE TABLE trs_emotions (
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  emotion_id TEXT,
  intensity INT,
  stage TEXT CHECK (stage IN ('initial', 'final')),
  PRIMARY KEY (session_id, emotion_id, stage)
);

CREATE TABLE trs_physical_sensations (
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  region TEXT,
  sensation TEXT,
  PRIMARY KEY (session_id, region, sensation)
);

CREATE TABLE trs_distortions (
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  distortion_id TEXT,
  PRIMARY KEY (session_id, distortion_id)
);

CREATE TABLE trs_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  evidence_text TEXT,
  type TEXT CHECK (type IN ('supporting', 'against'))
);

CREATE TABLE trs_brainstormed_alternatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  alternative_text TEXT
);

CREATE TABLE trs_coping_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES thought_reframing_sessions(id) ON DELETE CASCADE,
  strategy_text TEXT
);

-- ==========================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Since this application uses a custom authentication system (bypassing Supabase Auth) 
-- and connects via the anon key, we must disable RLS on all tables to allow access.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_emotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_distortions DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_coping_strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE mood_emotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mood_triggers DISABLE ROW LEVEL SECURITY;
ALTER TABLE thought_reframing_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_context_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_emotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_physical_sensations DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_distortions DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_brainstormed_alternatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE trs_coping_strategies DISABLE ROW LEVEL SECURITY;
