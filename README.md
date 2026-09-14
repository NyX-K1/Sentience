<div align="center">

# 🧠 Sentience

### *Where Introspection Meets Intelligence*

A cinematic, AI-powered emotional intelligence platform — combining immersive WebGL visuals, real-time AI journaling, CBT Thought Reframing, comprehensive mood analytics, and clinical-grade data exports to help users understand, track, and transform their emotional landscape.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=for-the-badge)](https://groq.com/)

---

</div>

---

## 🌟 About

**Sentience** is a full-stack emotional intelligence platform that goes far beyond traditional journaling apps. Built at the intersection of clinical psychology, cutting-edge web technology, and AI, Sentience provides a safe, immersive, and deeply personalized space for users to explore, understand, and transform their inner world.

> *"Between stimulus and response there is a space. In that space is our power to choose our response."* — Viktor Frankl

---

## ✨ Features

### 1. 📊 Mood Tracker
A visually rich, multi-step mood logging system:
- **Emotion Wheel** — A granular emotion picker powered by a 951-emotion dataset.
- **Valence/Arousal Mapping** — Captures emotional valence and arousal.
- **Trigger Tagging** — Users tag triggers associated with their mood.
- **Mood Timeline** — Historical view of past mood logs with trend visualization.

### 2. 📝 Smart Journaling & Diary
An AI-powered journaling experience with real-time analysis:
- **AI Analysis** — Each entry is analyzed via Groq models, extracting Sentiment, Mood Score, Detected Emotions, Cognitive Distortions, and Coping Strategies.
- **Conversations** — Engage in a multi-turn therapeutic conversation with the AI after writing.
- **Diary** — A chronological archive of all past journal entries, conversation history, and insights.

### 3. 🧩 Thought Reframer (CBT)
A comprehensive Cognitive Behavioral Therapy tool:
- **8-Step Protocol** — Walk through triggering situations, identify negative thoughts, and reframe them.
- **Distortion Detective** — Identify cognitive distortions from a visual grid of 16 distortion types.
- **AI Companion** — AI-generated alternative perspectives and reframed thoughts.
- **Belief Shift** — Track the change in belief strength before and after reframing.

### 4. 📈 User Analytics & Clinical Data Export
A comprehensive analytics dashboard and export system:
- **Interactive Dashboards** — Visualize Core Affect Trends, Reframing Efficacy, and Emotion Distribution.
- **AI Insights** — Personalized summaries based on aggregated data patterns.
- **Clinical PDF Export** — Generate a comprehensive, multi-page clinical-grade PDF report containing chronological timelines, reframing sessions, and sentiment breakdowns.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5, TypeScript 5
- **Styling:** Tailwind CSS, Framer Motion, GSAP
- **3D Graphics:** Three.js, React Three Fiber, OGL (GLSL Shaders)
- **AI Integration:** Groq SDK
- **Backend / Database:** Supabase (PostgreSQL)
- **Data Visualization:** Recharts
- **PDF Generation:** `@react-pdf/renderer`

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- Groq API Key
- Supabase Project

### Installation
```bash
git clone https://github.com/NyX-K1/Sentience.git
cd Sentience
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### Run
```bash
npm run dev
```

---

<div align="center">
**Built with 💜 for the mind**
</div>
