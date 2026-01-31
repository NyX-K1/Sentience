# Discover Page Implementation Plan

## Goal Description
Implement a new "Discover Yourself" page featuring the `RevealWaveImage` 3D component. Navigate to this page when the user clicks the CTA button on the landing page.

## User Review Required
- **Navigation**: Adding `react-router-dom` to handle page navigation.
- **Dependencies**: Adding `three`, `@react-three/fiber`, `@react-three/drei` for 3D webgl effects.

## Proposed Changes

### Dependencies
- Install `three`, `@react-three/fiber`, `@react-three/drei`, `react-router-dom`.

### Components
#### [NEW] [src/components/ui/reveal-wave-image.tsx](file:///c:/College/hackathons/Innovit/Sentience/src/components/ui/reveal-wave-image.tsx)
- Implementation of the wave reveal shader effect using Three.js fibers.

#### [NEW] [src/pages/Discover.tsx](file:///c:/College/hackathons/Innovit/Sentience/src/pages/Discover.tsx)
- Page component identifying as the "Demo" provided.
- Full screen layout with `RevealWaveImage`.

### Routing
#### [MODIFY] [src/App.tsx](file:///c:/College/hackathons/Innovit/Sentience/src/App.tsx)
- Import `BrowserRouter`, `Routes`, `Route`.
- Define routes for `/` (BackgroundPaths) and `/discover` (DiscoverPage).

#### [MODIFY] [src/components/ui/background-paths.tsx](file:///c:/College/hackathons/Innovit/Sentience/src/components/ui/background-paths.tsx)
- Use `useNavigate` to redirect to `/discover` on button click.

## Verification Plan
### Manual Verification
- **Install**: Verify dependencies install without error.
- **Navigate**: Click "Discover Yourself" -> should change URL to `/discover`.
- **Render**: Verify the 3D wave image appears and responds to mouse interaction as described (flashlight reveal, ripples).
