-- Demo Data Seed Script for Sentience
-- This script adds sample data for a specific user to test the UI.
-- Make sure you have created a user in Supabase Authentication with the email 'pe@2' before running this!

DO $$
DECLARE
  demo_user_id UUID;
  j1_id UUID;
  j2_id UUID;
  m1_id UUID;
  m2_id UUID;
  m3_id UUID;
  t1_id UUID;
  t2_id UUID;
BEGIN
  -- 1. Find the User ID
  -- We assume you are using Supabase Auth and have created a user with this email.
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'pe@2' LIMIT 1;
  
  IF demo_user_id IS NULL THEN
     RAISE EXCEPTION 'User with email "pe@2" not found in auth.users. Please sign up or create this user in Supabase Authentication first.';
  END IF;

  -- Clean up existing data for this user to prevent duplicates if run multiple times
  DELETE FROM journal_entries WHERE user_id = demo_user_id;
  DELETE FROM mood_logs WHERE user_id = demo_user_id;
  DELETE FROM thought_reframing_sessions WHERE user_id = demo_user_id;

  -- ==========================================
  -- 2. SEED JOURNAL ENTRIES
  -- ==========================================
  
  -- Entry 1
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (
    demo_user_id, 
    'I had a presentation today for the project exhibition. I was incredibly nervous beforehand, but once I started talking, it flowed naturally. The judges seemed impressed by our architecture.', 
    'Positive', 
    8, 
    'Preparation pays off, and my anxiety before an event is usually worse than the event itself.', 
    now() - interval '2 days'
  ) RETURNING id INTO j1_id;

  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES 
    (j1_id, 'Relief'), (j1_id, 'Pride'), (j1_id, 'Anxiety');
  
  INSERT INTO journal_distortions (journal_id, distortion_label) VALUES 
    (j1_id, 'Fortune Telling');

  INSERT INTO journal_coping_strategies (journal_id, strategy_text) VALUES 
    (j1_id, 'Box Breathing'), (j1_id, 'Positive Visualization');

  INSERT INTO journal_conversations (journal_id, role, message, created_at) VALUES
    (j1_id, 'user', 'I am so scared about the presentation tomorrow.', now() - interval '2 days 2 hours'),
    (j1_id, 'assistant', 'It is completely normal to feel scared before a big presentation. What is the worst that could happen, realistically?', now() - interval '2 days 1 hour');

  -- Entry 2
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (
    demo_user_id, 
    'Felt really sluggish and unmotivated today. Spent most of the morning doomscrolling instead of working on the bug fixes. I feel like I am falling behind.', 
    'Negative', 
    3, 
    'I need to establish a morning routine to avoid getting stuck on my phone.', 
    now() - interval '1 day'
  ) RETURNING id INTO j2_id;

  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES 
    (j2_id, 'Guilt'), (j2_id, 'Apathy');
  
  INSERT INTO journal_distortions (journal_id, distortion_label) VALUES 
    (j2_id, 'Should Statements'), (j2_id, 'Mental Filter');


  -- ==========================================
  -- 3. SEED MOOD LOGS
  -- ==========================================
  
  -- Mood 1
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.6, 0.8, 'Fear', 'Pre-presentation jitters', 'manual', now() - interval '2 days 4 hours')
  RETURNING id INTO m1_id;

  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES 
    (m1_id, 'anxiety_1', 80), (m1_id, 'stress_1', 75);
  
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES 
    (m1_id, 'Work/School'), (m1_id, 'Public Speaking');

  -- Mood 2
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', 0.8, 0.5, 'Joy', 'Post-presentation celebration with the team', 'manual', now() - interval '1 day 20 hours')
  RETURNING id INTO m2_id;

  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES 
    (m2_id, 'joy_1', 90), (m2_id, 'relief_1', 85);
  
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES 
    (m2_id, 'Social Event'), (m2_id, 'Achievement');

  -- Mood 3
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.2, -0.5, 'Sadness', 'Feeling tired and unmotivated', 'manual', now() - interval '5 hours')
  RETURNING id INTO m3_id;

  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES 
    (m3_id, 'tired_1', 70), (m3_id, 'bored_1', 60);


  -- ==========================================
  -- 4. SEED THOUGHT REFRAMING SESSIONS (CBT)
  -- ==========================================
  
  -- Session 1
  INSERT INTO thought_reframing_sessions (
    user_id, situation_description, situation_date, automatic_thought, 
    initial_belief, final_belief, belief_shift, selected_reframe, takeaway, duration_minutes, created_at
  ) VALUES (
    demo_user_id, 
    'Reviewing the code for the project exhibition', 
    now() - interval '3 days',
    'My code is messy and the judges will think I am a terrible developer.',
    85, 
    30, 
    55,
    'My code works and solves the problem. I can always refactor later. Perfection is the enemy of progress.',
    'I should judge myself on the functionality first, aesthetics second.',
    15,
    now() - interval '3 days'
  ) RETURNING id INTO t1_id;

  INSERT INTO trs_context_tags (session_id, tag) VALUES (t1_id, 'Project'), (t1_id, 'Imposter Syndrome');
  
  INSERT INTO trs_emotions (session_id, emotion_id, intensity, stage) VALUES 
    (t1_id, 'anxiety', 80, 'initial'), 
    (t1_id, 'inadequacy', 75, 'initial'),
    (t1_id, 'calm', 60, 'final'), 
    (t1_id, 'acceptance', 70, 'final');

  INSERT INTO trs_physical_sensations (session_id, region, sensation) VALUES 
    (t1_id, 'Chest', 'Tightness'), (t1_id, 'Stomach', 'Butterflies');

  INSERT INTO trs_distortions (session_id, distortion_id) VALUES 
    (t1_id, 'Mind Reading'), (t1_id, 'Magnification');

  INSERT INTO trs_evidence (session_id, evidence_text, type) VALUES 
    (t1_id, 'The application compiles and runs without critical bugs.', 'against'),
    (t1_id, 'I have some hardcoded values.', 'supporting');

  INSERT INTO trs_brainstormed_alternatives (session_id, alternative_text) VALUES 
    (t1_id, 'The judges care more about the architecture than minor syntax issues.');

  INSERT INTO trs_coping_strategies (session_id, strategy_text) VALUES 
    (t1_id, 'Code Review with a Peer'), (t1_id, 'Taking a walk');

END $$;
