# Sentience Landing Page Implementation Plan

## Goal
Design a high-fidelity, "sophisticated dark theme" landing page for Sentience, featuring an "antigravity" floating navigation, "frosted glassmorphism," and a minimalist hero section. This page will replace the current post-loader destination (`LuminaPage`), while preserving the existing `LuminaPage` code.

## Proposed Changes

### New Component: `SentienceLanding`
**Location**: `src/pages/SentienceLanding.tsx`
- **Aesthetics**:
    - Background: Deep obsidian (#0a0a0a or similar), matte charcoal textures.
    - Accents: Bioluminescent gradients (cyan, deep violet, electric blue).
    - Typography: Clean, modern sans-serif (likely using existing font stack or Inter).
- **Features**:
    - **Antigravity Nav Bar**:
        - Fixed/Floating at top.
        - Frosted glass effect (`backdrop-filter: blur`).
        - Glowing beveled edges (box-shadow/border gradients).
        - Items: Mood Trends, CBT Studio, Smart Journal, Private Diary, Data Export, Language/A11y, Telehealth Connect, Daily Focus.
        - Icons: `lucide-react` icons for each item.
    - **Hero Section**:
        - Headline: "Sentience: Map Your Inner Universe".
        - Visual: Abstract futuristic visualization (neural pathways/emotional waves).

### Routing Updates
- **File**: `src/App.tsx`
    - Add route for `/sentience` pointing to `SentienceLanding`.
    - Keep `/lumina` route for safety.
- **File**: `src/pages/Discover.tsx`
    - Update the 7-second `setTimeout` redirect to go to `/sentience` instead of `/lumina`.

### Hero Section Refinement: Glitch Text
**Goal**: Create a digital glitch transition for the hero headline.
- **Component**: `src/components/ui/GlitchText.tsx`
    - **Props**: `interval` (default 3000ms).
    - **State**: Cycles through: [Inner Universe, Emotional Landscape, Subconscious Blueprint, Neural Frequency, Uncharted Mind].
    - **Effect**:
        - "Digital Glitch" transition on text swap.
        - Text fragments into horizontal slices (clip-path).
        - Neon colors (Cyan #00f0ff, Violet #8b5cf6) flash during glitch.
        - Monospaced font (`font-mono`).
        - Pulsing text-shadow.
- **Integration**: `src/pages/SentienceLanding.tsx`
    - Replace static "Inner Universe" text with `<GlitchText />`.
    - Update "Map Your" to be static and separate.

    - Update "Map Your" to be static and separate.

### Mind Info Page Implementation
**Goal**: Create a new page "Mind Info" featuring a 3D/Spatial product showcase style interface, replacing "Thought Records".
- **Component**: `src/components/ui/spatial-product-showcase.tsx`
    - **Source**: User provided code (`EarbudShowcase`).
    - **Dependencies**: `lucide-react`, `framer-motion`.
    - **Modifications**:
        - Convert to `default export` if needed.
        - Ensure Tailwind classes match project config.
        - Replace ImageKit images with Unsplash placeholders if broken (User requested Unsplash).
- **Page**: `src/pages/MindInfo.tsx`
    - Wraps `EarbudShowcase`.
- **Navigation**:
    - Update `SentienceLanding.tsx`:
        - Change "Thought Records" to "Mind Info".
        - Add navigation logic (likely via `Link` or `useNavigate` if `CardNav` supports it, otherwise plain `href`).
    - Update `App.tsx`:
        - Add route `/mind-info` -> `MindInfo`.

    - Update `App.tsx`:
        - Add route `/mind-info` -> `MindInfo`.

### Scrollytelling Section
**Goal**: Add a scroll-triggered video/image reveal section to the landing page.
- **Component**: `src/components/ui/scroll-animated-video.tsx`
    - **Source**: User provided `HeroScrollVideo`.
    - **Dependencies**: `gsap`, `lenis` (needs install).
    - **Customization**:
        - **Media**: Use abstract/neurological video (Pexels/Unsplash).
        - **Theme**: Dark mode by default.
        - **Content**: "Decode Your Psyche" or similar Sentience-themed text.
- **Integration**: `src/pages/SentienceLanding.tsx`
    - Place below the Glitch Text Hero.
    - Ensure `Hyperspeed` background doesn't conflict (z-index check).

### Emotional Unloading Page (Replacing Trigger Map)
**Goal**: Create a serene, scrolling page for emotional release and history.
- **Component**: `src/components/ui/emotional-hero.tsx` *(Adapted from Modern Hero)*
    - **Tech**: `framer-motion` (scroll, transform), `lenis` (smooth scroll).
    - **Adaptations**:
        - **Theme**: Serene, calming, "Unloading", "Release".
        - **Icons**: `lucide-react` (Brain, ArrowRight, MapPin -> Heart/Cloud).
        - **Visuals**: Unsplash images (Water, Sky, Abstract Fluids).
        - **Content**: "Emotional History", "Recent Unloadings", "Pattern Recognition".
- **Page**: `src/pages/EmotionalUnloading.tsx`
    - Wraps `EmotionalHero`.
- **Navigation**:
    - Update `SentienceLanding` nav items: "Trigger Map" -> "Emotional Unloading".
    - Update `App.tsx` route: `/emotional-unloading`.

### Weekly Report Page
**Goal**: Visual scrolling presentation of weekly insights.
- **Component**: `src/components/ui/full-screen-scroll-fx.tsx`
    - **Adaptations**:
        - Force dark mode themes (`pageBg: #000`, `text: #fff`).
        - Remove sound effects or replace if needed (will remove for now).
        - Use Sentience typography.
- **Page**: `src/pages/WeeklyReport.tsx`
    - Sections:
        1. "Mood Velocity" (Speed/Darkness)
        2. "Clarity Index" (Focus/Light)
        3. "Social Resonance" (Connection/Warmth)
        4. "Cognitive Load" (Complexity/Abstract)
- **Navigation**:
    - Update `SentienceLanding`: Add href `/weekly-report` to "Weekly Report" card.
    - Update `App.tsx`: Add route.

- **Navigation**:
    - Update `SentienceLanding`: Add href `/weekly-report` to "Weekly Report" card.
    - Update `App.tsx`: Add route.

### Smart Journal Page (Templates)
**Goal**: Interactive 3D template selection for journaling.
- **Component**: `src/components/ui/journal-templates-hero.tsx` *(Adapted from ScrollMorphHero)*
    - **Adaptations**:
        - Dark theme (BG `#0a0a0a`).
        - Images: Journal/Abstract themes (Unsplash).
        - Animation Phase: "Scatter" -> "Line" -> "Circle" -> "Arch".
        - Interaction: Hover to see template details.
- **Page**: `src/pages/SmartJournal.tsx`
    - Wraps `JournalTemplatesHero`.
- **Navigation**:
    - Update `SentienceLanding`: Add/Update "Smart Journal" link if exists, or add to menu.
    - Update `App.tsx`: Add route `/smart-journal`.

### Cognitive Reframing Page
**Goal**: A focused, impactful page for cognitive reframing tools using a lamp/spotlight effect.
- **Component**: `src/components/ui/lamp.tsx`
    - **Adaptations**:
        - Use existing `cn` utility.
        - Ensure dark mode compatibility (slate-950/cyan-500 theme matches Sentience).
- **Page**: `src/pages/CognitiveReframing.tsx`
    - Wraps `LampContainer`.
    - Content: Title "Reframing Patterns", Subtitle "Shift your perspective".
    - Maybe add a "Start Session" button inside the lamp light.
- **Navigation**:
    - Update `SentienceLanding`: Update "Cognitive Reframing" link.
    - Update `App.tsx`: Add route `/cognitive-reframing`.

## Verification Plan
### Automated Tests
- None required for this visual change.

### Manual Verification
1.  Start the app (`npm run dev`).
2.  Navigate to `/` (BackgroundPaths).
3.  Click "Discover Yourself".
4.  Wait 7 seconds on `/discover` (Loading Experience).
5.  Verify redirection to `/sentience` (New Landing Page).
6.  Check UI against requirements (Dark theme, Floating Nav, Hero).
7.  Verify `/lumina` is still accessible if manually typed (preservation check).
