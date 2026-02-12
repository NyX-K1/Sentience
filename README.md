<div align="center">

# 🧠 Sentience

### *Where Introspection Meets Intelligence*

A modern, immersive web application for mental wellness — combining stunning 3D visuals, smooth animations, and AI-powered journaling to help users understand and reframe their emotional landscape.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Groq](https://img.shields.io/badge/Groq-Llama_AI-F55036?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

<img src="https://via.placeholder.com/800x400?text=Sentience+Preview" alt="Sentience Preview" width="80%" />

*Replace with actual screenshot or demo GIF*

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 About

**Sentience** is more than a journaling app — it's an experience. Built at the intersection of emotional intelligence and cutting-edge web technology, Sentience provides a safe, beautiful space for users to explore their inner world.

Users are greeted with immersive 3D environments (celestial spheres, aurora borealis), guided through a cinematic onboarding flow, and empowered with AI-driven tools rooted in Cognitive Behavioral Therapy (CBT) principles.

> *"The unexamined life is not worth living."* — Socrates

---

## ✨ Features

### 🎬 Immersive Onboarding
Cinematic scroll-driven animations set the tone before users even begin. Powered by GSAP scroll triggers, Framer Motion transitions, and Three.js 3D environments.

### 📝 Smart Journaling
Write freely — AI does the heavy lifting. Journal entries are analyzed in real-time using **Groq's Llama models** to extract:
- **Sentiment scores** (positive / negative / neutral)
- **Mood classification**
- **Emotional tags & themes**

### 📊 Mood Tracking & Weekly Reports
Visualize emotional trends over time with interactive charts built using **Recharts**. Spot patterns, celebrate progress, and identify areas for growth.

### 🧩 Cognitive Reframing (CBT Tools)
Dedicated tools help users challenge and restructure negative thought patterns:
- **Cognitive Reframing** — Identify cognitive distortions
- **Balanced Thought Generator** — Build healthier perspectives

### 🎙️ Voice Notes
Capture thoughts through audio when typing feels like too much. Express emotions naturally through voice.

### 💨 Emotional Unloading
A judgment-free space to vent, release, and let go of overwhelming emotions.

### 🫁 Breathing Timer
Guided breathing exercises with visual animations to ground and center the user.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | React 18, Vite |
| **Styling** | Tailwind CSS, clsx, tailwind-merge |
| **3D Graphics** | Three.js, React Three Fiber (`CelestialSphere`, `AuroraBorealis`) |
| **Animation** | GSAP (scroll-triggered), Framer Motion (UI transitions) |
| **Smooth Scroll** | Lenis |
| **AI / LLM** | Groq SDK (Llama models) |
| **Routing** | React Router DOM v6 |
| **Data Viz** | Recharts |
| **Language** | TypeScript |

---

## 🏗️ Architecture
```
sentience/
├── public/
├── src/
│ ├── components/
│ │ ├── ui/
│ │ │ ├── aurora-borealis-shader.tsx
│ │ │ ├── reveal-wave-image.tsx
│ │ │ ├── breathing-timer.tsx
│ │ │ └── ...
│ │ └── ...
│ │
│ ├── hooks/
│ │ ├── useMoodData.ts
│ │ └── ...
│ │
│ ├── pages/
│ │ ├── ScrollAnimationPage.tsx
│ │ ├── Discover.tsx
│ │ ├── SentienceLanding.tsx
│ │ ├── SmartJournalling.tsx
│ │ ├── WeeklyReport.tsx
│ │ ├── VoiceNotes.tsx
│ │ ├── EmotionalUnloading.tsx
│ │ ├── CognitiveReframing.tsx
│ │ ├── BalancedThoughtPage.tsx
│ │ └── ...
│ │
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
│
├── .env
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```


---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** or **pnpm**
- **Groq API Key** — [Get one here](https://console.groq.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sentience.git
cd sentience

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run dev
```
The app will be available at ```http://localhost:5173```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

Create a ```.env``` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```


---

## 💡 Usage

### 1. Onboarding
Navigate to the root URL to experience the immersive scroll-driven onboarding with 3D celestial visuals.

### 2. Journaling
Head to **Smart Journaling** — write your thoughts and watch as AI analyzes your entry in real-time, surfacing mood scores, sentiment, and emotional tags.

### 3. Weekly Reports
Check the **Weekly Report** page to visualize your mood trends over time with interactive charts.

### 4. CBT Tools
Use **Cognitive Reframing** and **Balanced Thought** pages to challenge unhelpful thinking patterns with structured, evidence-based exercises.

### 5. Voice Notes
Record audio notes when you prefer speaking over typing.

---
## 🗺️ Roadmap

- [x] Immersive 3D onboarding experience
- [x] AI-powered journal sentiment analysis (Groq + Llama)
- [x] Mood tracking with data visualization
- [x] CBT-based cognitive reframing tools
- [x] Voice notes capture
- [x] Breathing timer
- [ ] **Global State Management** — Migrate to Zustand or Context API for scalable state sharing
- [ ] **User Authentication** — Secure accounts with persistent cloud storage
- [ ] **Backend & Database** — Persist journal entries, mood data, and user preferences
- [ ] **PWA Support** — Offline access and installable app experience
- [ ] **Performance Optimization** — Lazy loading for 3D components, resource disposal on unmount
- [ ] **Accessibility (a11y)** — Full keyboard navigation, screen reader support, reduced motion preferences
- [ ] **Dark / Light Theme Toggle**
- [ ] **Export Data** — Download journal entries and reports as PDF
- [ ] **Multi-language Support (i18n)**


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
- Use TypeScript — avoid `any` types
- Test 3D/animation changes on lower-end devices
- Keep bundle size in mind — lazy load heavy components
- Write meaningful commit messages ([Conventional Commits](https://www.conventionalcommits.org/))

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Declarative 3D for React
- [GSAP](https://gsap.com/) — Professional-grade animations
- [Framer Motion](https://www.framer.com/motion/) — Production-ready motion library
- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [Lenis](https://lenis.darkroom.engineering/) — Smooth scroll library
- [Recharts](https://recharts.org/) — Composable charting library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework

---

<div align="center">

**Built with 💜 for the mind**

⭐ Star this repo if Sentience resonates with you ⭐

</div>
