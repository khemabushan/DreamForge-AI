# DreamForge AI — Frontend

Next.js 15 (App Router) + TypeScript frontend for DreamForge AI.

## Stack
- Next.js 15, React 18, TypeScript
- Tailwind CSS (custom dark/glass token system — see `tailwind.config.ts`)
- Framer Motion for transitions and the ambient constellation motif
- Lucide React icons
- React Flow for the interactive scene graph viewer
- Zustand + TanStack Query wired up for real API integration (currently using mock data in `src/lib/mock-data.ts`)

## Getting started
```bash
npm install
npm run dev
```
Visit http://localhost:3000.

## Structure
```
src/
  app/
    page.tsx                 # Landing page
    login/, signup/
    (app)/                   # Authenticated shell (shared sidebar layout)
      dashboard/             # Dream history
      dreams/new/            # Dream submission
      dreams/[dreamId]/      # Overview, scene-graph, storyboard, video tabs
      settings/
  components/
    landing/                 # Hero, Features, Demo, Pricing
    layout/                  # Navbar, Sidebar, Topbar, Footer
    scene-graph/             # React Flow canvas + custom node
    storyboard/              # Panel cards
    media/                   # Video player
    shared/                  # DreamCard, PipelineProgress, DreamTabs, ConstellationField
    ui/                      # Button, Card, Badge primitives
  lib/                       # utils, mock-data
  types/                     # Shared domain types (mirrors backend schemas)
```

## Wiring to a real backend
Replace `src/lib/mock-data.ts` reads with calls to the FastAPI backend
(`/api/v1/dreams`, `/api/v1/dreams/{id}/scene-graph`, etc.), and replace the
`setTimeout` in `dreams/new/page.tsx` with an actual POST + SSE subscription
via `lib/ws-client.ts` (to be added) for live pipeline progress.

## Design tokens
See `tailwind.config.ts` for the full palette (`ink`, `mist`, `drift`, `wake`,
`glass`) and font roles (`font-display` = Fraunces, `font-body` = Inter,
`font-mono` = JetBrains Mono).
