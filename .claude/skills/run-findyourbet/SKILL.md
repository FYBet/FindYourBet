---
name: run-findyourbet
description: Build, run, screenshot and verify the FindYourBet web app (React + Vite SPA). Use when asked to run/start/serve/build/test/screenshot/verify FindYourBet, its frontend, landing, login or dashboard, or to check changes before touching code.
---

# Run FindYourBet

FindYourBet (FYB) is a **React 18 + Vite SPA** (JavaScript, no TypeScript). There
is **no local backend or database**: the client talks directly to a **hosted
Supabase** project whose URL + anon key are hardcoded in
[src/lib/supabase.js](src/lib/supabase.js). The `/api/*` endpoints are **Vercel
serverless functions** that do NOT run under the Vite dev server.

The agent handle on the running app is
[.claude/skills/run-findyourbet/driver.sh](.claude/skills/run-findyourbet/driver.sh)
— it screenshots any route via headless Chrome. All paths below are relative to
the repo root (`c:\Users\pauar\FindYourBet`). Commands are Git Bash (the Bash
tool), not PowerShell.

> ⚠️ **The hardcoded Supabase is PRODUCTION** (the live beta with real users).
> Rendering pages is read-only and safe. **Do NOT drive destructive flows**
> (register, publish, comment, follow, block, report, delete) against it — they
> write/delete real data and send real emails. There is no staging backend.

## Prerequisites

- Node `v24.15.0`, npm (verified this session).
- Google Chrome at `/c/Program Files/Google/Chrome/Application/chrome.exe`
  (the driver uses it headless).

```bash
cd /c/Users/pauar/FindYourBet
npm install          # first time only
```

## Build (fast sanity check — no tests exist)

There is **no test framework** in this project. The two checks before touching
code are the production build and the linter:

```bash
cd /c/Users/pauar/FindYourBet
npm run build        # → "✓ built in ~2.5s"  (a >500kB chunk warning is expected, harmless)
npm run lint         # ESLint (flat config); some pre-existing Ranking.jsx warnings are known
```

`npm run build` is the fastest way to confirm a code change compiles.

## Run (agent path — the one you want)

1. Start the dev server in the background and read the actual port (Vite prefers
   **1000** but falls back to 1001/1002 when taken — first run also re-optimizes
   deps, so give it ~12s):

```bash
cd /c/Users/pauar/FindYourBet
(npm run dev > /tmp/fyb_dev.log 2>&1 &)
sleep 12
sed 's/\x1b\[[0-9;]*m//g' /tmp/fyb_dev.log | grep -E 'Local:|ready in'
# → ➜  Local:   http://localhost:1002/
```

2. Screenshot any route with the driver (it auto-detects the port from the log):

```bash
cd /c/Users/pauar/FindYourBet/.claude/skills/run-findyourbet
bash driver.sh /login login.png     # → Wrote .../login.png (route=/login port=1002)
bash driver.sh /      landing.png    # landing renders the tipster-rain animation
```

Then **open the PNG** (Read tool) and confirm it's a real page, not blank/error.
Public routes reachable without auth: `/`, `/login`, `/register`,
`/canal/:code`, `/oferta/:id`. Everything under `/dashboard` needs a real login
against production — don't.

3. Stop the dev server cleanly when done (kill by the port it printed):

```bash
PID=$(netstat -ano | grep ':1002' | grep LISTENING | awk '{print $5}' | head -1)
[ -n "$PID" ] && powershell -Command "Stop-Process -Id $PID -Force"
```

## Run (human path)

`npm run dev` then open the printed `http://localhost:<port>/` in a browser.
Useless for an agent (no window), hence the driver above.

## Environment variables

- **Frontend runs with zero env config** — Supabase URL + anon key are hardcoded,
  so `npm run dev` works out of the box (it hits production Supabase).
- `.env` holds `VITE_ODDS_API_KEY` (odds verification only; app runs without it).
- `/api/*` (Vercel serverless, NOT run locally) needs, on Vercel:
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `RESEND_API_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`, `APP_URL`. Not exercised by this skill.

## Gotchas

- **Production Supabase.** See the warning up top. Read-only rendering is fine;
  do not register/publish/delete.
- **Headless Chrome needs an absolute Windows path** for `--screenshot`, or it
  fails with `Acceso denegado (0x5)`. The driver converts the path with
  `cygpath -m` — pass a plain filename and it handles it.
- **Port is not fixed.** Vite prefers 1000; 1000/1001 are often busy here → it
  lands on 1002. Always read the real port from `/tmp/fyb_dev.log` (the driver
  does this; strip ANSI with `sed` first if reading by hand — the port digits are
  wrapped in colour codes).
- **`/api/*` won't respond under `npm run dev`.** Vite doesn't serve the Vercel
  functions. Testing them locally needs `vercel dev` (not covered here).
- **Beta gate.** The dashboard is behind a beta gate code `FYBM67`
  (`localStorage.fyb_unlocked`). If a route shows a lock screen, set it in the
  browser; the driver's fresh Chrome profile won't have it.
- **Branches:** all code lives on `master`; `main` is docs only. Never build/push
  against `main`.
- **Loading rules:** new hooks/fetches must follow the strict loading rules in
  the repo `CLAUDE.md` (primitive `useEffect` deps, 10s safety timers, full
  try/catch/finally) — the recurring "Cargando datos" bug lives here.

## Troubleshooting

- **Screenshot: `Failed to write file … Acceso denegado`** → relative/MSYS path.
  Use the driver (it makes the path absolute via `cygpath`), or pass a full
  `C:/…` path.
- **`/tmp/fyb_dev.log` empty right after launch** → the dev server is still
  optimizing deps; `sleep` longer (12s+) and re-read.
- **Driver screenshots a blank/dark page** → increase `--virtual-time-budget`
  in `driver.sh` (currently 6000ms) so React + animations settle.
