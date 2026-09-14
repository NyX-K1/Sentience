-- Demo Data Seed Script for Sentience (Normalized Schema)
-- This script adds sample data for a specific user to test the UI and Analytics.
-- Make sure you have signed up in the app with the email 'pe@2' before running this!

DO $$
DECLARE
  demo_user_id UUID;
  j1_id UUID; j2_id UUID; j3_id UUID; j4_id UUID; j5_id UUID;
  m1_id UUID; m2_id UUID; m3_id UUID; m4_id UUID; m5_id UUID; m6_id UUID; m7_id UUID;
  t1_id UUID; t2_id UUID; t3_id UUID;
BEGIN
  -- 1. Find the User ID from our custom profiles table
  SELECT id INTO demo_user_id FROM profiles WHERE email = 'pe@2' LIMIT 1;
  
  IF demo_user_id IS NULL THEN
     -- Auto-create the user if they don't exist
     -- The password hash is for 'password' (bcrypt 10 rounds)
     INSERT INTO profiles (email, password_hash, full_name, username, timezone) 
     VALUES ('pe@2', '$2a$10$tZk52h8mXh.8V0P.r.xS.u.eP3/vXqY3K.M/mO6qS/s1z/wK7J2Gq', 'Project Exhibition', 'pe_user', 'Asia/Kolkata')
     RETURNING id INTO demo_user_id;
  END IF;

  -- Clean up existing data for this user to prevent duplicates if run multiple times
  DELETE FROM journal_entries WHERE user_id = demo_user_id;
  DELETE FROM mood_logs WHERE user_id = demo_user_id;
  DELETE FROM thought_reframing_sessions WHERE user_id = demo_user_id;

  -- ==========================================
  -- 2. SEED JOURNAL ENTRIES
  -- ==========================================
  
  -- Entry 1 (2 weeks ago)
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (demo_user_id, 'Just started working on the Project Exhibition 2 idea. Feeling a bit overwhelmed by the scope but excited to build something meaningful.', 'Mixed', 6, 'Big projects require taking it one step at a time.', now() - interval '14 days') RETURNING id INTO j1_id;
  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES (j1_id, 'Overwhelmed'), (j1_id, 'Excited');
  INSERT INTO journal_distortions (journal_id, distortion_label) VALUES (j1_id, 'Magnification');
  INSERT INTO journal_coping_strategies (journal_id, strategy_text) VALUES (j1_id, 'Task Breakdown'), (j1_id, 'Prioritization');

  -- Entry 2 (10 days ago)
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (demo_user_id, 'Had a breakthrough with the UI design today! Everything is finally coming together and looking sleek. The dark mode is gorgeous.', 'Positive', 9, 'Consistent effort leads to sudden bursts of progress.', now() - interval '10 days') RETURNING id INTO j2_id;
  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES (j2_id, 'Joy'), (j2_id, 'Pride');
  
  -- Entry 3 (7 days ago)
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (demo_user_id, 'Hit a massive roadblock with the database schema normalization. Nothing is working and I feel like I ruined the project.', 'Negative', 2, 'I need to learn to walk away and take a break when I hit a wall.', now() - interval '7 days') RETURNING id INTO j3_id;
  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES (j3_id, 'Frustration'), (j3_id, 'Despair');
  INSERT INTO journal_distortions (journal_id, distortion_label) VALUES (j3_id, 'All-or-Nothing Thinking'), (j3_id, 'Catastrophizing');
  INSERT INTO journal_coping_strategies (journal_id, strategy_text) VALUES (j3_id, 'Taking a break'), (j3_id, 'Deep Breathing');

  -- Entry 4 (3 days ago)
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (demo_user_id, 'Finally fixed the database issues. It took a lot of patience, but the new normalized structure is so much cleaner and scalable.', 'Positive', 8, 'Hard challenges usually lead to the best architectural improvements.', now() - interval '3 days') RETURNING id INTO j4_id;
  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES (j4_id, 'Relief'), (j4_id, 'Satisfaction');

  -- Entry 5 (Today)
  INSERT INTO journal_entries (user_id, content, sentiment, mood_score, core_insight, created_at)
  VALUES (demo_user_id, 'The presentation for the exhibition is tomorrow. I am extremely nervous but also ready to show what we built. I just hope the live demo works.', 'Mixed', 5, 'Anxiety is just excitement in disguise.', now() - interval '1 day') RETURNING id INTO j5_id;
  INSERT INTO journal_emotions (journal_id, emotion_label) VALUES (j5_id, 'Anxiety'), (j5_id, 'Anticipation');
  INSERT INTO journal_distortions (journal_id, distortion_label) VALUES (j5_id, 'Fortune Telling');
  INSERT INTO journal_coping_strategies (journal_id, strategy_text) VALUES (j5_id, 'Positive Visualization');

  -- Add some AI conversations for the latest entry
  INSERT INTO journal_conversations (journal_id, role, message, created_at) VALUES
    (j5_id, 'user', 'I am so scared the live demo will crash tomorrow.', now() - interval '1 day 2 hours'),
    (j5_id, 'assistant', 'It is completely normal to feel scared before a live demo. Have you tested the main flow locally?', now() - interval '1 day 1 hour'),
    (j5_id, 'user', 'Yes, it works locally but production is different.', now() - interval '1 day 30 minutes');


  -- ==========================================
  -- 3. SEED MOOD LOGS
  -- ==========================================
  
  -- Mood 1 (14 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.2, 0.6, 'Fear', 'Starting the new project', 'manual', now() - interval '14 days') RETURNING id INTO m1_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m1_id, 'anxiety_1', 70);
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES (m1_id, 'Work/School');

  -- Mood 2 (12 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', 0.5, 0.4, 'Joy', 'Good progress on UI', 'manual', now() - interval '12 days') RETURNING id INTO m2_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m2_id, 'content_1', 60);

  -- Mood 3 (10 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', 0.9, 0.8, 'Joy', 'UI design finished!', 'manual', now() - interval '10 days') RETURNING id INTO m3_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m3_id, 'joy_1', 90), (m3_id, 'proud_1', 85);
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES (m3_id, 'Achievement');

  -- Mood 4 (7 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.8, 0.9, 'Anger', 'Database broke completely', 'manual', now() - interval '7 days') RETURNING id INTO m4_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m4_id, 'frustrated_1', 95), (m4_id, 'angry_1', 80);
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES (m4_id, 'Work/School');

  -- Mood 5 (5 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.4, -0.6, 'Sadness', 'Tired from debugging all night', 'manual', now() - interval '5 days') RETURNING id INTO m5_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m5_id, 'tired_1', 85);
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES (m5_id, 'Sleep/Health');

  -- Mood 6 (3 days ago)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', 0.7, 0.2, 'Joy', 'Database finally fixed', 'manual', now() - interval '3 days') RETURNING id INTO m6_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m6_id, 'relief_1', 90);
  
  -- Mood 7 (Today)
  INSERT INTO mood_logs (user_id, local_timezone, valence, arousal, dominant_family, notes, source_context, created_at)
  VALUES (demo_user_id, 'Asia/Kolkata', -0.1, 0.7, 'Fear', 'Pre-presentation nerves', 'manual', now() - interval '1 hour') RETURNING id INTO m7_id;
  INSERT INTO mood_emotions (mood_log_id, emotion_id, intensity) VALUES (m7_id, 'anxiety_1', 80);
  INSERT INTO mood_triggers (mood_log_id, trigger_name) VALUES (m7_id, 'Public Speaking');


  -- ==========================================
  -- 4. SEED THOUGHT REFRAMING SESSIONS (CBT)
  -- ==========================================
  
  -- Session 1
  INSERT INTO thought_reframing_sessions (
    user_id, situation_description, situation_date, automatic_thought, 
    initial_belief, final_belief, belief_shift, selected_reframe, takeaway, duration_minutes, created_at
  ) VALUES (
    demo_user_id, 'Looking at the project scope on day 1', now() - interval '14 days',
    'I will never be able to finish all these features in time.',
    90, 40, 50,
    'I have built complex things before. I just need to prioritize the MVP first.',
    'Focus on MVP, ignore the nice-to-haves for now.', 12, now() - interval '14 days'
  ) RETURNING id INTO t1_id;

  INSERT INTO trs_context_tags (session_id, tag) VALUES (t1_id, 'Project'), (t1_id, 'Planning');
  INSERT INTO trs_emotions (session_id, emotion_id, intensity, stage) VALUES (t1_id, 'Overwhelmed', 85, 'initial'), (t1_id, 'Focused', 60, 'final');
  INSERT INTO trs_distortions (session_id, distortion_id) VALUES (t1_id, 'Fortune Telling'), (t1_id, 'Magnification');
  INSERT INTO trs_coping_strategies (session_id, strategy_text) VALUES (t1_id, 'Agile Planning');

  -- Session 2
  INSERT INTO thought_reframing_sessions (
    user_id, situation_description, situation_date, automatic_thought, 
    initial_belief, final_belief, belief_shift, selected_reframe, takeaway, duration_minutes, created_at
  ) VALUES (
    demo_user_id, 'Breaking the database on day 7', now() - interval '7 days',
    'I ruined everything and I am a terrible developer. I should quit.',
    95, 20, 75,
    'Breaking things is part of learning. I have backups and I can reconstruct the schema properly.',
    'Mistakes are just data. Learn from them and move on.', 20, now() - interval '7 days'
  ) RETURNING id INTO t2_id;

  INSERT INTO trs_context_tags (session_id, tag) VALUES (t2_id, 'Coding'), (t2_id, 'Failure');
  INSERT INTO trs_emotions (session_id, emotion_id, intensity, stage) VALUES (t2_id, 'Despair', 90, 'initial'), (t2_id, 'Determined', 70, 'final');
  INSERT INTO trs_distortions (session_id, distortion_id) VALUES (t2_id, 'All-or-Nothing Thinking'), (t2_id, 'Labeling');
  INSERT INTO trs_coping_strategies (session_id, strategy_text) VALUES (t2_id, 'Taking a walk'), (t2_id, 'Rubber Duck Debugging');

  -- Session 3
  INSERT INTO thought_reframing_sessions (
    user_id, situation_description, situation_date, automatic_thought, 
    initial_belief, final_belief, belief_shift, selected_reframe, takeaway, duration_minutes, created_at
  ) VALUES (
    demo_user_id, 'Preparing for the exhibition presentation', now() - interval '1 day',
    'The judges will hate the project and ask questions I cannot answer.',
    80, 30, 50,
    'I know this codebase better than anyone. If I do not know an answer, it is okay to say I will look into it.',
    'Confidence comes from knowing the limits of my knowledge.', 10, now() - interval '1 day'
  ) RETURNING id INTO t3_id;

  INSERT INTO trs_context_tags (session_id, tag) VALUES (t3_id, 'Presentation'), (t3_id, 'Anxiety');
  INSERT INTO trs_emotions (session_id, emotion_id, intensity, stage) VALUES (t3_id, 'Anxious', 85, 'initial'), (t3_id, 'Calm', 65, 'final');
  INSERT INTO trs_distortions (session_id, distortion_id) VALUES (t3_id, 'Mind Reading');
  INSERT INTO trs_coping_strategies (session_id, strategy_text) VALUES (t3_id, 'Deep Breathing');

END $$;
