-- Normalized Database Schema for Sentience

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Users Table (Assuming Supabase Auth handles the primary users table, this is just for reference or a public profile table if needed)
-- CREATE TABLE users (
--   id UUID REFERENCES auth.users PRIMARY KEY,
--   email TEXT
-- );

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

-- Set up Row Level Security (RLS) for all tables
-- This ensures users can only access their own data.
-- (Example policy for journal_entries)
-- ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can insert their own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
-- (You should apply similar RLS policies to all tables in production)
