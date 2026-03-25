# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is sarit.tech — a premium personal portfolio website for Sarit Sethi, an AI Product Leader with a background in construction technology. It features an AI "Digital Twin" chat experience powered by Gemini.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, shadcn/ui)
- **AI**: Gemini 2.5 Flash via Replit AI Integrations (`@workspace/integrations-gemini-ai`)
- **Analytics**: PostHog (placeholder key — swap VITE_POSTHOG_KEY env var)
- **CMS**: Sanity.io — project `z0ibsj2d`, dataset `production`; credentials in `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` env vars (editor-level token); all 15 documents seeded

## Routes (Multi-Page)

| Path | Page | Content |
|------|------|---------|
| `/` | Home / Landing | Hero + "What I Do" preview cards |
| `/about` | My Story | Personal journey (Delhi → Toronto → Chicago) + career timeline |
| `/aidad` | The AI Dad | Leadership brand, 4 strategy pillars, key metrics, philosophy |
| `/projects` | The Builder | Cricket Coach AI, Sarth(A)i, Enterprise RAG + stealth teaser |

- **Global Layout**: `Layout.tsx` wraps every page with Navbar + Contact section
- **Global ChatWidget**: Floating Brain icon (bottom-right) opens full-screen overlay on all routes
- **Stealth Mode**: `StealthOverlay` shows "Under Construction" by default; bypass via `?preview=true`
- **Navbar active states**: Teal highlight on current route using wouter `useLocation`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── sarit-tech/         # React + Vite frontend (sarit.tech)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/  # Gemini AI integration package
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/sarit-tech` (`@workspace/sarit-tech`)

React + Vite frontend for sarit.tech. Serves at `/` (root preview path).

Key files:
- `src/App.tsx` — Root router and providers (TanStack Query, Tooltip)
- `src/pages/Home.tsx` — Main page composing all sections
- `src/components/sections/` — Hero, About, Intrapreneur, Builder, Contact sections
- `src/components/chat/ChatWidget.tsx` — AI Digital Twin floating chat widget
- `src/components/layout/Navbar.tsx` — Sticky responsive navigation
- `src/hooks/use-content.ts` — Content fetching (Sanity CMS with static fallback + Substack RSS)
- `src/hooks/use-analytics.ts` — PostHog analytics hook (mock mode when key is placeholder)
- `src/hooks/use-gemini-chat.ts` — Gemini SSE chat streaming hook

Environment variables (frontend — prefix with `VITE_`):
- `VITE_POSTHOG_KEY` — PostHog API key (default: `phc_PLACEHOLDER` = analytics mocked)
- `VITE_SANITY_PROJECT_ID` — Sanity project ID (default: `placeholder` = static fallback)
- `VITE_SANITY_DATASET` — Sanity dataset (default: `production`)
- `VITE_SANITY_API_TOKEN` — Sanity read token (optional)

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Serves at `/api`.

Routes:
- `GET /api/healthz` — health check
- `GET/POST /api/gemini/conversations` — list/create AI chat conversations
- `GET/DELETE /api/gemini/conversations/:id` — get/delete a conversation
- `GET /api/gemini/conversations/:id/messages` — list messages
- `POST /api/gemini/conversations/:id/messages` — send message (SSE streaming response from Gemini)
- `GET /api/rss/substack` — proxy Sarit's Substack RSS feed (parsed to JSON)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

Tables:
- `conversations` — AI chat conversation sessions
- `messages` — individual chat messages (role: user | assistant)

### `lib/integrations-gemini-ai` (`@workspace/integrations-gemini-ai`)

Gemini AI SDK wrapper using Replit AI Integrations proxy. Auto-configured via:
- `AI_INTEGRATIONS_GEMINI_BASE_URL`
- `AI_INTEGRATIONS_GEMINI_API_KEY`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config. Run codegen:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## AI Digital Twin — System Prompt

The Gemini system prompt (in `artifacts/api-server/src/routes/gemini/index.ts`) seeds the AI with Sarit's background as an AI Product Leader with construction tech expertise. To enhance it, edit `SARIT_SYSTEM_PROMPT` in that file or upload documents via the Gemini Files API.

## CMS Activation (Sanity)

1. Create a Sanity project at sanity.io
2. Set `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, and optionally `VITE_SANITY_API_TOKEN` in environment variables
3. Deploy Sanity schemas (defined in the content types used by `use-content.ts`)
4. Content will automatically load from Sanity; static fallback remains for any missing content

## Analytics Activation (PostHog)

1. Create a PostHog project at posthog.com
2. Set `VITE_POSTHOG_KEY` to your project API key in environment variables
3. Events tracked: `page_view`, `chatbot_opened`, `chatbot_closed`, `cta_clicked`

## User Preferences

- **GitHub pushes**: Always ask the user for confirmation before pushing to GitHub. Never push automatically.
