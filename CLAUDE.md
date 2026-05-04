# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run lint      # ESLint (flat config, React hooks rules)
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

**React + Vite SPA** for a sports betting tipster tracking platform. UI is in Spanish/Catalan.

### Routing

Custom `useNavigation` hook (`src/hooks/useNavigation.js`) manages page state — not React Router. App.jsx holds the current page and passes `navigate()` down as props. Pages: `landing → login → register → dashboard`.

### Pages (`src/pages/`)

- **Landing.jsx** — Marketing page (hero, stats carousel, tipster ranking preview, CTA)
- **Login.jsx** — Three UI states: sign-in, password reset request, reset confirmation
- **Register.jsx** — Signup with age validation (18+), password rules, terms acceptance
- **Dashboard.jsx** — Main app with three tabs: *Mis Apuestas* (bet CRUD), *Ranking* (tipster ROI), *Ingresos* (revenue)

### Backend (Supabase)

Client initialized in `src/lib/supabase.js` with hardcoded public anon key — this is intentional for a client-side app. Methods used: `signInWithPassword`, `signUp`, `resetPasswordForEmail`. User metadata (name, surname, username, birthdate, nationality) is passed in `options.data` on sign-up.

**`bets` table schema:** `user_id`, `event`, `pick`, `odds`, `stake`, `date`, `sport`, `market`, `analysis`, `status`, `created_at`

A special dev user ID `"dev-skip"` bypasses Supabase queries for offline development.

### Styling

- Design tokens (CSS variables) defined in `src/styles/tokens.css` — primary green: `#0F6E56`
- Tailwind CSS v4 integrated via `@tailwindcss/vite` plugin; token file uses `@theme` directive
- Pages use inline style objects (JS) plus per-component CSS files (e.g. `Dashboard.css`)

### State Management

All pages use local `useState`. **Zustand is installed but not yet used** — available if global state is needed.

### Animations

Framer Motion is used throughout for page transitions, scroll stagger effects, and hover states. Reusable variants (e.g. `fadeUp`) are defined inline in each page component.

---

## Engineering & Design Standards

Act as a Senior Fullstack Developer and Creative Technologist. All work must meet the following standards to produce a product indistinguishable from high-end software (Stripe / Linear quality).

### 1. Design Token System (Aesthetic Scalability)

- **Semantic variables only:** No arbitrary color values. All colors, radii, shadows, and spacing must be defined as CSS variables on `:root` (e.g. `--primary`, `--background`, `--radius`).
- **Tailwind integration:** Extend the Tailwind theme via `tailwind.config.js` to consume these CSS variables so utility classes and raw CSS stay in sync.
- **Single source of truth:** A change to a color or radius variable in the global CSS must propagate to the entire app without touching individual components.
- **Theming:** Native Dark/Light mode support via CSS class toggling (`.dark` / `.light`).

### 2. File Structure (Feature-Based Architecture)

Organize code by feature, not by file type:

```
src/
├── components/ui/          # Atomic, pure UI components (buttons, inputs, modals) — Shadcn/UI based
├── features/[feature]/     # Self-contained feature modules (e.g. auth/, betting/)
│   ├── components/         # Feature-specific components
│   ├── hooks/              # Feature-specific hooks
│   └── services/           # Feature-specific API/service calls
├── hooks/                  # Global, reusable hooks
├── lib/                    # Third-party client configs (Supabase, Axios, etc.)
└── styles/                 # Global CSS with design variables
```

### 3. Code Style (Clean Code)

- **Strict TypeScript:** No `any`. Every prop and API response must have a typed interface.
- **Decoupled logic:** Business logic never lives inside visual components. Use custom hooks for state and side effects.
- **Clean patterns:** Apply early returns, optional chaining, and avoid prop drilling — use Context or Zustand instead.
- **Comments:** Never comment *what* the code does. Only comment *why* a technical decision was made.
## Projecte: FindYourBet (FYB)

Xarxa social d'apostes esportives. Tipsters creen canals i venen picks/subscripcions VIP als apostadors.

### Stack
- React + Vite (JavaScript, NO TypeScript)
- CSS per feature + variables CSS en src/styles/tokens.css
- Framer Motion per animacions
- Supabase (auth + PostgreSQL, RLS desactivat)
- React Router DOM
- Deploy: Vercel → fyourbet.com (Cloudflare)
- Repo: tulsaproyectoxbet/FindYourBet (branca master)

### Supabase
URL: https://slfgvgvguwavvbkpsngf.supabase.co
Taules: bets, channels, channel_members, channel_messages, profiles
- channels: id, owner_id, name, description, is_private, invite_code (lowercase), link_public, created_at
- channel_members: id, channel_id, user_id, joined_at
- channel_messages: id, channel_id, user_id, content, created_at
- profiles: id, username, name, created_at
- bets: id, user_id, event, pick, odds, stake, sport, market, analysis, status, date, created_at

### Decisions tècniques
- Polling cada 2s missatges, cada 10s ranking (no Realtime)
- invite_code sempre en lowercase
- App.jsx carrega sessió Supabase amb onAuthStateChange
- Dashboard detecta ?canal=CODE a la URL per obrir canal automàticament
- Git: git push upstream master → Sync fork FYBet/FindYourBet → Vercel redesplega

### Pendent
- Perfil públic del tipster
- Sistema ranking complet (score 0-100, tiers estrictes)
- Subscripcions VIP de pagament
