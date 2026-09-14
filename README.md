<div align="center">

# 🧠 Sentience

### *Where Introspection Meets Intelligence*

A cinematic, AI-powered emotional intelligence platform — combining immersive WebGL visuals, real-time AI journaling, an 8-step CBT Thought Reframer, comprehensive mood analytics, and clinical-grade data exports to help users understand, track, and transform their emotional landscape.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage & User Flow](#-usage--user-flow)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 About

**Sentience** is a full-stack emotional intelligence platform that goes far beyond traditional journaling apps. Built at the intersection of clinical psychology, cutting-edge web technology, and AI, Sentience provides a safe, immersive, and deeply personalized space for users to explore, understand, and transform their inner world.

Users are greeted with cinematic WebGL environments — celestial spheres, aurora borealis shaders, Prism refractions, and neural flow fields — before engaging with AI-driven tools rooted in **Cognitive Behavioral Therapy (CBT)** principles. Every interaction is persisted to a **Supabase** backend, enabling rich longitudinal analytics and clinical-grade data exports.

The platform features a curated database of **951 human emotions** mapped across families, intensities, and descriptions — powering one of the most granular emotion-tracking experiences available.

> *"Between stimulus and response there is a space. In that space is our power to choose our response."* — Viktor Frankl

---

## ✨ Features

### 🔐 Authentication & Profiles
Secure user authentication backed by **Supabase** with persistent sessions stored in `localStorage`. Each user has a profile with full name, username, email, and timezone. All feature pages are protected routes — unauthenticated users are redirected to the auth screen.

---

### 🎬 Immersive Landing Experience (`/sentience`)
The landing page is a cinematic, scroll-driven experience designed to set the emotional tone:

- **WebGL Prism Shader** — A real-time refracting prism rendered as the hero background using custom GLSL shaders via OGL
- **Ambient Light Orbs** — Slowly drifting gradient orbs creating a meditative atmosphere
- **Floating Particles** — Randomized micro-particles with infinite looping animations
- **Staggered Word Animations** — Philosophy taglines that reveal word-by-word with blur-to-focus transitions
- **Scroll Indicator** — A glowing cyan pulse line guiding users to scroll
- **Random Philosophical Quotes** — Curated quotes from Viktor Frankl, Rumi, Carl Jung, Anaïs Nin, and John Milton with source attribution and external links
- **FallingText Physics** — Interactive Matter.js-powered physics text that scatters on hover using rigid body simulation
- **Scrollytelling Story** — "The Architect & The Shadow" — a multi-scene scroll-pinned narrative about confronting one's shadow self, with fade transitions and parallax effects
- **PinRotateCards** — GSAP ScrollTrigger-pinned cards that rotate into view as the user scrolls, showcasing platform features like Emotional Cartography, Cognitive Architecture, and Neural Synthesis
- **CardNav Menu** — A full-screen animated navigation overlay with 3 categorized cards (CBT Studio, Smart Journal, Mood Trends), GSAP-driven clip-path reveals, hover scale animations, and user profile display with logout
- **Ambient Audio Toggle** — Optional ambient drone soundtrack for a meditative browsing experience
- **Lenis Smooth Scroll** — Butter-smooth scrolling with `@studio-freight/lenis` for a premium feel

---

### 📊 Mood Tracker (`/mood-tracker`)
A visually rich, multi-step mood logging system:

1. **Mood Compass** — Visual directional input for initial mood sensing
2. **Emotion Wheel** — A granular emotion picker powered by the 951-emotion dataset, organized by families (Joy, Sadness, Anger, Fear, Surprise, Disgust, Trust, Anticipation). Each emotion has:
   - Family classification
   - Intensity rating
   - Descriptive explanation
   - Hover tooltips with full emotion details
3. **Emotion Bloom** — A 3D visual bloom effect that animates when emotions are selected
4. **Valence/Arousal Mapping** — Each log captures emotional valence (-1 to 1) and arousal (1-5)
5. **Trigger Tagging** — Users tag triggers/activities associated with their mood
6. **Notes** — Free-text notes for context
7. **Mood Timeline** — Historical view of past mood logs with trend visualization
8. **Wellbeing Score** — An aggregated wellbeing metric computed from recent mood data

All data is persisted to the `mood_logs` Supabase table.

---

### 📝 Smart Journaling (`/smart-journalling`)
An AI-powered journaling experience with real-time analysis:

1. **Free Writing Mode** — Open text editor with writing prompts
2. **AI Analysis** — Each entry is analyzed via **Groq's Llama 3.3 70B** model, extracting:
   - **Sentiment** (Positive / Negative / Neutral / Anxious / Hopeful)
   - **Mood Score** (1-10)
   - **Detected Emotions** (mapped to the 951-emotion dataset)
   - **Cognitive Distortions** (from the 16 recognized CBT patterns)
   - **Coping Strategies** (personalized suggestions)
   - **Core Insight** (a distilled takeaway from the entry)
3. **Follow-up Conversations** — After analysis, users can engage in a multi-turn therapeutic conversation with the AI, which provides empathetic, CBT-informed responses
4. **Distortion Detection & Reframer Linking** — If significant cognitive distortions are detected, the app suggests using the Thought Reframer tool
5. **Post-Save Reflection** — After saving, an animated reflection component displays the analysis results

Data is persisted to `journal_entries` and `journal_conversations` Supabase tables.

---

### 📓 Diary (`/diary`)
A chronological archive of all past journal entries:

- **Timeline View** — Entries listed by date with sentiment badges, emotion tags, and core insights
- **Expandable Cards** — Click to reveal full journal text
- **Conversation History** — View the complete AI conversation thread for each entry
- **Journal Stories** — A visual stories-style carousel for browsing entries

---

### 🧩 Thought Reframer (`/thought-reframer`) — 8-Step CBT Protocol
A comprehensive, multi-step Cognitive Behavioral Therapy tool with 12 dedicated sub-components:

| Step | Component | Description |
|------|-----------|-------------|
| 1 | **SituationStep** | Describe the triggering situation with date, context tags, and detail |
| 2 | **ThoughtTrapStep** | Record the automatic negative thought |
| 3 | **EmotionCheckStep** | Tag initial emotions and rate initial belief strength (0-100%) |
| 4 | **DistortionDetective** | Identify cognitive distortions from a visual grid of 16 distortion types, each with custom SVG icons and descriptions |
| 5 | **EvidenceScale** | List evidence supporting & contradicting the negative thought (visual scale metaphor) |
| 6 | **AICompanion** | AI-generated alternative perspectives and reframed thoughts via Groq API |
| 7 | **ReframeStep** | Select or write a balanced reframe; re-rate belief strength |
| 8 | **ShiftStep + TakeawayStep** | Compare initial vs. final belief/emotions, write personal takeaway, receive coping suggestions |

Additional features:
- **Draft Auto-Save** — Sessions are auto-saved to `localStorage` so users can resume later
- **Reframer History** — Past completed sessions are viewable
- **Progress Bar** — Visual step progress indicator
- **Step Transitions** — Animated transitions between steps
- **Body Map Regions** — Optional physical sensation tracking

Data is persisted to `thought_reframing_sessions` with 20+ columns.

---

### 🗣️ Voice Notes (`/voice-notes`)
AI-powered motivational audio generation:

- **Mood Selection** — Choose current mood state from a curated list
- **AI Generation** — Groq's Llama model generates a personalized motivational text based on the selected mood
- **Text-to-Speech** — The generated text is spoken aloud using the Web Speech API
- **Visual Feedback** — Animated visualizations during playback

---

### 💨 Emotional Unloading (`/emotional-unloading`)
A judgment-free space for emotional release:

- **Free Expression Zone** — Write without any analysis or judgment
- **Fire Overlay** — Optional dramatic visual effect (fire animation overlay) to symbolically "burn away" negative emotions
- **Crisis Detection** — If distress signals are detected, a **Crisis Card** is displayed with helpline numbers from a curated database of crisis resources
- **Cathartic Animations** — Visual feedback for the unloading process

---

### 🔥 Emotional Patterns (`/emotional-patterns`)
Advanced pattern recognition and visualization:

- **Trigger Map** — A bubble cloud visualization showing activity/trigger correlations with mood. Bubble size scales with average mood score, colored by sentiment
- **Chronotype Heatmap** — Time-of-day mood heatmap showing when users feel best/worst (Morning, Afternoon, Evening, Night), with personalized scheduling recommendations
- **Spiral Detector** — Alerts users when consecutive negative emotion logs are detected, suggesting a breathing exercise
- **CelestialSphere Background** — Custom Three.js particle sphere as ambient background

---

### 📈 User Analytics (`/user-analytics`)
A comprehensive analytics dashboard with 8 visualization panels:

| Panel | Type | Data Source |
|-------|------|-------------|
| **At-a-Glance Stats** | 4 animated stat cards | Aggregated counts across all tables |
| **Core Affect Trends** | Area chart (valence + arousal) | `mood_logs` |
| **Thought Reframing Efficacy** | Grouped bar chart (initial vs final belief) | `thought_reframing_sessions` |
| **Journal Mood Score Trend** | Line chart | `journal_entries.mood_score` |
| **Emotion Family Distribution** | Donut/Pie chart | `mood_logs.dominant_family` |
| **Top Cognitive Distortions** | Horizontal bar chart | `thought_reframing_sessions.cognitive_distortions` |
| **Journal Sentiment Breakdown** | Pie chart | `journal_entries.sentiment` |
| **Journal Emotion Constellation** | Radar chart | `journal_entries.detected_emotions` |
| **Journaling Activity** | GitHub-style heatmap grid | `journal_entries.created_at` |

Additional features:
- **Time Range Toggle** — Switch between 7d / 30d / 90d views
- **AI-Generated Insight** — A personalized 3-sentence insight generated by Groq's Llama 3.3 70B, fed with aggregated data from all tables (distortion patterns, sentiment distribution, mood scores, emotion families)
- **NeuralBackground Shader** — Animated flow-field particle background

---

### 📄 Clinical Data Export (`/data-export`)
Generate a comprehensive, multi-page clinical-grade PDF report:

| Section | Contents |
|---------|----------|
| **Executive Summary** | Total data points, active days, engagement overview across all features |
| **Affect & Triggers** | Avg valence/arousal, top triggers, dominant emotion families, chronological mood timeline table |
| **Cognitive Restructuring** | Total CBT sessions, avg belief shift, avg duration, top distortions, full per-session detail table (thought → distortions → reframe → takeaway) |
| **Smart Journal Analysis** | Total entries, avg mood score, sentiment distribution, emotion frequencies, distortion frequencies, coping strategy frequencies, AI core insights, full journal entry table |
| **Therapeutic Conversations** | Total messages, avg exchanges per entry, sample conversation transcripts |
| **Cross-Feature Patterns** | Common distortions across CBT & journal, engagement consistency analysis |

Features:
- **Time Range Selection** — 30d or 90d
- **Preview Stats** — Shows data point counts before download
- **PDF Generation** — Uses `@react-pdf/renderer` with Open Sans font, structured clinical formatting, and a disclaimer
- **Confidentiality Notice** — Each page marked "Strictly Confidential"

---

### 📊 Weekly Report (`/weekly-report`)
A focused weekly mood summary:

- **AI Weekly Insight** — A one-sentence empathetic summary of the week generated by Groq
- **Logging Consistency** — RadialBarChart showing % of days logged
- **Top Emotions** — Horizontal bar chart of most frequent emotions
- **CelestialSphere Background** — Cycling through 4 visual presets (Velocity, Clarity, Social, Cognitive)
- **Graceful Fallbacks** — Local summary generation if AI API is unavailable

---

### 🫁 Guided Breakthroughs (Modal)
Accessible from the CardNav menu, providing:
- **Breathing Exercises** — Visual breathing timer with animated circles
- **Progressive Muscle Relaxation** — Step-by-step guided relaxation
- **Relaxation Library** — Curated collection of relaxation techniques

---

### 🧠 Thought Rewiring (Modal)
A secondary CBT tool accessible from the CardNav menu:
- **Balanced Thought Generator** — AI-assisted tool to generate balanced, evidence-based alternatives to negative thoughts

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18, Vite 5 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3, clsx, tailwind-merge, tailwindcss-animate |
| **3D Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), OGL (custom GLSL shaders) |
| **Animation** | GSAP (ScrollTrigger, scroll-pinned sections), Framer Motion (UI transitions, AnimatePresence) |
| **Smooth Scroll** | Lenis (`@studio-freight/lenis`) |
| **Physics** | Matter.js (FallingText rigid body simulation) |
| **AI / LLM** | Groq SDK → Llama 3.3 70B Versatile (sentiment analysis, conversational AI, insight generation) |
| **Backend / DB** | Supabase (PostgreSQL — auth, profiles, mood_logs, journal_entries, journal_conversations, thought_reframing_sessions) |
| **Routing** | React Router DOM v6 (protected routes, programmatic navigation) |
| **Data Visualization** | Recharts (AreaChart, BarChart, LineChart, RadarChart, PieChart, RadialBarChart) |
| **PDF Generation** | `@react-pdf/renderer` (multi-page clinical reports with custom fonts) |
| **State Management** | React Context (AuthContext), custom hooks (useMoodStore, useMoodData, useReframerSession, useReframerHistory, useEmotionInsights, usePatternDetection, useShaderColors) |
| **UI Components** | Lucide React (icons), Radix UI (slots), class-variance-authority |
| **Audio** | Web Speech API (TTS), HTML5 Audio (ambient sounds) |

---

## 🏗️ Architecture

```
sentience/
├── public/
│   ├── favicon.png
│   ├── decode-psyche.png
│   ├── emotional-silhouette.png
│   ├── frames/                    # Scroll-animation video frames
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── thought-reframer/      # 12 CBT step components
│   │   │   ├── SituationStep.tsx
│   │   │   ├── ThoughtTrapStep.tsx
│   │   │   ├── EmotionCheckStep.tsx
│   │   │   ├── DistortionDetective.tsx
│   │   │   ├── EvidenceScale.tsx
│   │   │   ├── AICompanion.tsx
│   │   │   ├── ReframeStep.tsx
│   │   │   ├── ShiftStep.tsx
│   │   │   ├── TakeawayStep.tsx
│   │   │   ├── DistortionIcon.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── StepTransition.tsx
│   │   │
│   │   ├── ui/                    # 27 reusable UI components
│   │   │   ├── aurora-borealis-shader.tsx
│   │   │   ├── celestial-sphere.tsx
│   │   │   ├── flow-field-background.tsx
│   │   │   ├── shader-background.tsx
│   │   │   ├── breathing-timer.tsx
│   │   │   ├── breathing-animations.tsx
│   │   │   ├── progressive-muscle-relaxation.tsx
│   │   │   ├── relaxation-library.tsx
│   │   │   ├── guided-breakthroughs.tsx
│   │   │   ├── thought-rewiring.tsx
│   │   │   ├── balanced-thought-generator.tsx
│   │   │   ├── journal-templates-hero.tsx
│   │   │   ├── lumina-interactive-list.tsx
│   │   │   ├── neural-insights.tsx
│   │   │   ├── emotional-hero.tsx
│   │   │   ├── full-screen-scroll-fx.tsx
│   │   │   ├── scroll-animated-video.tsx
│   │   │   ├── scroll-animation-landing.tsx
│   │   │   ├── reveal-wave-image.tsx
│   │   │   ├── background-paths.tsx
│   │   │   ├── fade-text.tsx
│   │   │   ├── glitch-text.tsx
│   │   │   ├── button.tsx
│   │   │   ├── lamp.tsx
│   │   │   └── ...
│   │   │
│   │   ├── CardNav.tsx            # Full-screen animated navigation
│   │   ├── ClinicalReportPDF.tsx  # Multi-page PDF report renderer
│   │   ├── EmotionWheel.tsx       # 951-emotion circular picker
│   │   ├── EmotionBloom.tsx       # 3D bloom effect for emotions
│   │   ├── EmotionTooltip.tsx     # Hover tooltip with emotion details
│   │   ├── EmotionHeatmap.tsx     # Emotion frequency heatmap
│   │   ├── EmotionRhythm.tsx      # Temporal emotion patterns
│   │   ├── FamilyDistribution.tsx # Emotion family pie chart
│   │   ├── MoodCompass.tsx        # Directional mood input
│   │   ├── MoodTimeline.tsx       # Historical mood visualization
│   │   ├── WellbeingScore.tsx     # Aggregated wellbeing metric
│   │   ├── TriggerCorrelation.tsx # Trigger-mood correlation analysis
│   │   ├── VocabularyTracker.tsx  # Emotional vocabulary growth
│   │   ├── InsightCard.tsx        # AI insight display card
│   │   ├── PostSaveReflection.tsx # Post-journal save animation
│   │   ├── CrisisCard.tsx         # Crisis helpline display
│   │   ├── FireOverlay.tsx        # Cathartic fire animation
│   │   ├── ContextPanel.tsx       # Contextual information panel
│   │   ├── ScrollytellingStory.tsx # Multi-scene scroll narrative
│   │   ├── PinRotateCards.tsx     # GSAP scroll-pinned rotating cards
│   │   ├── Prism.tsx              # Custom GLSL prism shader via OGL
│   │   ├── FallingText.tsx        # Matter.js physics-driven text
│   │   ├── MaskScrollReveal.tsx   # Mask-based scroll reveal
│   │   ├── Ballpit.tsx            # Interactive 3D ball pit
│   │   ├── Hyperspeed.jsx         # Warp-speed tunnel effect
│   │   ├── LaserFlow.jsx          # Laser flow animation
│   │   ├── BackgroundShader.tsx   # Generic shader wrapper
│   │   └── JournalStories.tsx     # Stories-style journal carousel
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # User authentication context
│   │
│   ├── data/
│   │   ├── emotions.ts           # 951 emotions (family, intensity, description)
│   │   ├── distortions.ts        # 16 cognitive distortion definitions
│   │   ├── helplines.ts          # Crisis helpline directory
│   │   └── reframePrompts.ts     # CBT reframing prompt templates
│   │
│   ├── hooks/
│   │   ├── useMoodData.ts        # Mood log aggregation & trends
│   │   ├── useMoodStore.ts       # Zustand-like mood state
│   │   ├── useReframerSession.ts # CBT session state + Supabase persist
│   │   ├── useReframerHistory.ts # Past CBT session retrieval
│   │   ├── useEmotionInsights.ts # AI emotion pattern analysis
│   │   ├── usePatternDetection.ts # Spiral detection & pattern alerts
│   │   └── useShaderColors.ts    # Dynamic shader color management
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client initialization
│   │   └── utils.ts              # Utility functions (cn, etc.)
│   │
│   ├── types/
│   │   ├── mood.ts               # Mood data type definitions
│   │   └── reframer.ts           # ThoughtReframerSession type
│   │
│   ├── utils/
│   │   ├── audio-utils.ts        # Audio processing utilities
│   │   └── trendCalculations.ts  # Statistical trend calculations
│   │
│   ├── pages/
│   │   ├── Auth.tsx              # Authentication (login/signup)
│   │   ├── SentienceLanding.tsx  # Cinematic landing page
│   │   ├── MoodTracker.tsx       # Multi-step mood logging
│   │   ├── SmartJournalling2.tsx # AI-powered journaling
│   │   ├── Diary.tsx             # Journal entry archive
│   │   ├── ThoughtReframer.tsx   # 8-step CBT protocol
│   │   ├── VoiceNotes.tsx        # AI motivational voice
│   │   ├── EmotionalUnloading.tsx # Cathartic expression
│   │   ├── EmotionalPatterns.tsx # Pattern recognition
│   │   ├── WeeklyReport.tsx      # Weekly mood summary
│   │   ├── UserAnalytics.tsx     # Comprehensive analytics dashboard
│   │   └── DataExport.tsx        # Clinical PDF export
│   │
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── .env                          # Environment variables
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

Sentience uses **Supabase** (PostgreSQL) with the following tables:

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (from Supabase auth) |
| `email` | text | User email |
| `full_name` | text | Display name |
| `username` | text | Unique username |
| `timezone` | text | User timezone |

### `mood_logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → profiles |
| `valence` | float | Emotional valence (-1 to 1) |
| `arousal` | float | Emotional arousal (1-5) |
| `emotions` | jsonb | Array of selected emotion labels |
| `dominant_family` | text | Primary emotion family |
| `triggers` | jsonb | Array of trigger tags |
| `notes` | text | Free-text notes |
| `created_at` | timestamp | Log timestamp |

### `journal_entries`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → profiles |
| `content` | text | Journal entry text |
| `sentiment` | text | AI-detected sentiment |
| `mood_score` | int | AI-assigned mood score (1-10) |
| `detected_emotions` | jsonb | Array of detected emotions |
| `detected_distortions` | jsonb | Array of cognitive distortions |
| `coping_strategies` | jsonb | Array of suggested strategies |
| `core_insight` | text | AI-generated core insight |
| `created_at` | timestamp | Entry timestamp |

### `journal_conversations`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `journal_id` | UUID | FK → journal_entries |
| `role` | text | 'user' or 'assistant' |
| `message` | text | Conversation message |
| `created_at` | timestamp | Message timestamp |

### `thought_reframing_sessions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → profiles |
| `situation_description` | text | Triggering situation |
| `situation_date` | timestamp | When the situation occurred |
| `context_tags` | jsonb | Contextual tags |
| `automatic_thought` | text | The negative automatic thought |
| `initial_belief` | int | Initial belief strength (0-100) |
| `initial_emotions` | jsonb | Emotions before reframing |
| `physical_sensations` | jsonb | Body map sensations |
| `cognitive_distortions` | jsonb | Identified distortions |
| `evidence_supporting` | text | Evidence for the thought |
| `evidence_against` | text | Evidence against the thought |
| `brainstormed_alternatives` | jsonb | AI-generated alternatives |
| `selected_reframe` | text | Chosen balanced thought |
| `final_belief` | int | Belief strength after reframing |
| `final_emotions` | jsonb | Emotions after reframing |
| `belief_shift` | int | Change in belief (initial - final) |
| `takeaway` | text | Personal takeaway |
| `coping_strategies` | jsonb | Suggested coping strategies |
| `duration_minutes` | int | Session duration |
| `created_at` | timestamp | Session timestamp |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** or **pnpm**
- **Groq API Key** — [Get one here](https://console.groq.com/)
- **Supabase Project** — [Create one here](https://supabase.com/dashboard)

### Installation

```bash
# Clone the repository
git clone https://github.com/NyX-K1/Sentience_v2.git
cd Sentience_v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys (see below)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Your Supabase anonymous/public key |
| `VITE_GROQ_API_KEY` | ✅ | Groq API key for Llama 3.3 70B access |

---

## 💡 Usage & User Flow

### 1. Authentication
Navigate to `/` — you'll be redirected to `/auth` to create an account or log in. Authentication is powered by Supabase with profile creation.

### 2. Landing Page
After login, you arrive at `/sentience` — the cinematic landing page. Use the **Menu** button (top right) to navigate, or scroll through the immersive experience first.

### 3. Mood Tracking
Navigate to **Mood Tracker** via the menu → CBT Studio. Follow the compass → wheel → bloom flow to log your mood, select emotions, tag triggers, and save.

### 4. Smart Journaling
Navigate to **Smart Journal** → Write freely or use prompts → Submit for AI analysis → Receive sentiment, emotions, distortions, coping strategies, and insights → Engage in follow-up conversation with AI.

### 5. Thought Reframer
Navigate to **Thought Reframer** → Walk through all 8 CBT steps → Identify distortions → Examine evidence → Get AI-generated reframes → Track belief shift.

### 6. View Your Data
- **Diary** → Chronological journal archive with conversation history
- **User Analytics** → 8 interactive charts + AI insight
- **Emotional Patterns** → Trigger maps + Chronotype analysis
- **Weekly Report** → 7-day mood summary

### 7. Export
Navigate to **Data Export** → Select time range → Download a comprehensive multi-page clinical PDF.

---

## 🗺️ Roadmap

- [x] Cinematic WebGL landing experience (Prism shader, particles, scroll triggers)
- [x] User authentication with Supabase
- [x] 951-emotion dataset with family classification
- [x] Multi-step mood tracking (compass → wheel → bloom)
- [x] AI-powered journal analysis (Groq Llama 3.3 70B)
- [x] Follow-up therapeutic conversations
- [x] 8-step CBT Thought Reframer with AI companion
- [x] 16 cognitive distortion definitions with custom icons
- [x] Comprehensive analytics dashboard (8 chart panels)
- [x] Clinical-grade multi-page PDF data export
- [x] Emotional pattern recognition (trigger maps, chronotype)
- [x] Weekly mood reports with AI summaries
- [x] Breathing exercises & relaxation library
- [x] Voice-based AI motivation
- [x] Emotional unloading with crisis detection
- [x] Draft auto-save for CBT sessions
- [ ] **PWA Support** — Offline access and installable app experience
- [ ] **Performance Optimization** — Lazy loading for 3D/shader components
- [ ] **Accessibility (a11y)** — Full keyboard navigation, screen reader support
- [ ] **Multi-language Support (i18n)**
- [ ] **Therapist Portal** — Clinicians can view patient-shared reports
- [ ] **Push Notifications** — Mood logging reminders

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and component patterns
- Use TypeScript — avoid `any` types where possible
- Test 3D/shader changes on lower-end devices for performance
- Keep bundle size in mind — lazy load heavy components
- Write meaningful commit messages ([Conventional Commits](https://www.conventionalcommits.org/))

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Declarative 3D for React
- [OGL](https://ogl.dev/) — Minimal WebGL framework (Prism shader)
- [GSAP](https://gsap.com/) — Professional-grade scroll animations
- [Framer Motion](https://www.framer.com/motion/) — Production-ready motion library
- [Groq](https://groq.com/) — Ultra-fast LLM inference (Llama 3.3 70B)
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Lenis](https://lenis.darkroom.engineering/) — Smooth scroll library
- [Recharts](https://recharts.org/) — Composable charting library
- [Matter.js](https://brm.io/matter-js/) — 2D physics engine
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide](https://lucide.dev/) — Beautiful open-source icons
- [`@react-pdf/renderer`](https://react-pdf.org/) — React PDF generation

---

<div align="center">

**Built with 💜 for the mind**

⭐ Star this repo if Sentience resonates with you ⭐

</div>
