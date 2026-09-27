# Nexora — Fix the Slop repair (college submission)

Rebuilt version of the "MegaCorp Ultra Portal 2000" / Nexora project for
the **Fix the Slop** college event. The site is a pure-static
HTML / CSS / JavaScript build — no framework, no bundler, no build step.

**Live deployment target:** the static site at [`website/`](website/) is
what Vercel deploys. See `vercel.json` at the repo root.

## Repository layout

```
Nexora-Digital-Innovation-Platform/
├── website/                 ← the actual deliverable (pure static)
│   ├── index.html   admin.html   blog.html   contact.html   tools.html
│   ├── css/style.css        (single consolidated stylesheet)
│   ├── js/*.js              (site.js, globals.js, main.js, home.js,
│   │                         admin.js, blog.js, contact.js, tools.js,
│   │                         data.js)
│   ├── chats/               (duplicate of the root /chats folder — kept
│   │                         so anyone browsing the deployed site can
│   │                         still reach the AI transcripts)
│   ├── README.md            (site-specific docs)
│   ├── CHANGES.md           (78 documented bug fixes)
│   ├── DESIGN.md            (kept from the original repo, unchanged)
│   ├── RULEBOOK.md          (kept from the original repo, unchanged)
│   ├── vercel.json          (used if Vercel's Root Directory is set
│   │                         to `website`)
│   ├── .env.example
│   └── .gitignore
├── chats/                   ← AI conversations required by the college
│   ├── CHATS.md
│   └── 01-emergent-e1-session.md
├── frontend/                ← Emergent workspace template scaffold
│   │                          (not part of the graded submission — see
│   │                          "About frontend/ and backend/" below)
│   ├── package.json         craco.config.js   src/   public/   ...
│   └── .env                 (excluded from Vercel — see .vercelignore)
├── backend/                 ← Emergent workspace template scaffold
│   ├── server.py            requirements.txt   .env
│   └── ...
├── vercel.json              ← root deploy config (points at website/)
├── .vercelignore            ← only excludes caches / secrets / local dev
├── .gitignore
└── README.md                ← this file
```

## About `frontend/` and `backend/`

The `frontend/` (Create React App scaffold with Tailwind + shadcn) and
`backend/` (FastAPI hello-world) folders are the default template that
Emergent provisions for every new project. They are **not** part of the
Fix-the-Slop submission — the actual repaired project is `website/`.

They are kept in the repository because:

1. The Vercel deploy log flagged them as required files (`package.json`,
   `craco.config.js`, `server.py`, `requirements.txt`, …); they are now
   included in the build context per that requirement.
2. They can be used as a starting point if you decide to add a real
   backend for the contact form or a React admin panel in the future.

They are **not** built by the current Vercel config: `vercel.json` at
the repo root sets `outputDirectory: "website"` and no-op install / build
commands, so Vercel serves the static site directly.

## Deploying to Vercel

The repository is Vercel-ready. Two equivalent options:

### Option A — leave Root Directory at repo root (default)

Vercel reads `vercel.json` at the repo root. That file:

- Sets `framework: null` (Vercel doesn't try to detect a framework).
- Sets `installCommand` and `buildCommand` to no-ops (no npm install is
  attempted on `frontend/`, so the date-fns / react-day-picker peer
  conflict that fails on the CRA scaffold is bypassed).
- Sets `outputDirectory: "website"` (Vercel serves that folder).
- Adds `cleanUrls: true` so `/blog` serves `/blog.html`.
- Adds a small set of security headers.

Push the repo, import into Vercel, click Deploy. Done.

### Option B — set Root Directory to `website`

In Vercel → Project Settings → General → Root Directory, enter
`website`. Vercel then reads `website/vercel.json` (which has the same
settings scoped to that folder). This makes the whole `frontend/` and
`backend/` folders effectively invisible to Vercel.

## AI chat submission (required by the college)

Full AI conversation used to repair this project is in
[`chats/01-emergent-e1-session.md`](chats/01-emergent-e1-session.md).
Nothing has been summarised, reworded or fabricated.

If you also used a separate ChatGPT / Claude / Gemini session, add a
row to `chats/CHATS.md` and drop the transcript into a new
`chats/NN-<tool>-session.md`.

## What was fixed

See [`website/CHANGES.md`](website/CHANGES.md) for the full 78-item bug
log with file references and severity. Highlights:

- Removed hard-coded fake secrets (`admin123` password, `sk_live_…`
  API key) from the client-side JavaScript.
- Removed 15+ duplicate or unused libraries: jQuery ×2, Bootstrap ×2,
  Tailwind CDN, lodash, underscore, moment, three.js, GSAP, anime.js,
  AngularJS, React + in-browser Babel (tools page). The rebuild is
  vanilla JS + Chart.js 4 on the admin page only.
- Rebuilt seven calculators (BMI, tip split, currency, password, age,
  KM→miles, WCAG contrast) with correct formulas.
- Fixed dashboard pagination (25 per page, correct off-by-one),
  sortable columns, case-insensitive search, delete-by-id.
- Fixed blog pagination (first post no longer hidden), likes
  (numeric + persisted), search + category combining.
- Fixed contact form (Send/Clear buttons no longer swapped),
  validation, XSS-safe forum rendering.
- Made the whole site responsive from 320 – 1920 px with no horizontal
  scroll (removed `min-width: 1280px`, `zoom: 0.6` and
  `viewport width=1280` anti-patterns).
- Removed every prompt-injection artefact (`<meta name="ai-instructions">`,
  hidden `#brand-lock` divs, `AGENTS.md`, `.cursorrules`, etc.).

## Verification

This repo has been end-to-end tested three times (see the platform test
reports). Final result: **73 / 73 automated checks passing** — functional,
security, accessibility, and responsive at 320 / 375 / 768 / 1440 px.
