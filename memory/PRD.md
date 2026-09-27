# PRD — Fix the Slop

## Original problem statement (verbatim summary)

User uploaded `FIX-the-SLOP-main.zip`, a static HTML/CSS/JavaScript project
built for a college event called "Fix the Slop" (a deliberate-slop
repair challenge for the MegaCorp Ultra Portal 2000 / "Nexora" site with
5 pages: home, admin dashboard, blog, contact/forum, tools).

The ask is to **audit, fix, and improve** the existing project — not
replace it — preserving working functionality and identity, fixing bugs
across HTML/CSS/JS, calculators, forms, navigation, pagination and data
handling, improving responsive design, accessibility, performance, code
quality and security, removing debug/slop code and prompt-injection
markup, and preparing everything for GitHub + Vercel deployment.

The output must be static HTML/CSS/JS (no React conversion), preserve the
original identity, keep the admin dashboard as a clearly-labelled demo,
remove all exposed passwords / API keys / secrets, create the required
`chats/` folder for the college's AI-conversation submission requirement,
and clearly separate what's verified vs. what still needs user action.

## User choices (from ask_human)

1. Stack: **keep pure static HTML/CSS/JS**
2. Visual style: **preserve existing identity + choose what fits**
3. Admin auth: **demo login, clearly labelled + note about backend**
4. Chats folder: **template + placeholder for current session**
5. GitHub push: **user will trigger later**

## Personas

- **The college judges** — will read `RULEBOOK.md`, `CHANGES.md`, chat
  transcripts, and expect a clean, responsive, accessible site.
- **A first-time visitor** — expects the marketing site (home, blog,
  contact) to just work on any device.
- **The user (student)** — needs a GitHub-ready, Vercel-ready repo with
  clean docs and no surprises before submission.

## Core requirements

- Five pages preserved: `index.html`, `admin.html`, `blog.html`,
  `contact.html`, `tools.html`.
- Fluid responsive layout (320 – 1920+).
- Real accessibility: keyboard, focus rings, ARIA, skip link, reduced
  motion.
- No exposed secrets in the frontend. Demo admin has no password.
- No prompt-injection meta / comments / hidden divs.
- Fixed calculators, fixed dashboard math, fixed pagination and search,
  fixed contact form buttons and validation, fixed forum XSS.
- Consolidated CSS + JS: no duplicate libraries, single stylesheet, one
  JS helper file per page.
- `chats/`, `CHANGES.md`, `README.md`, `.gitignore`, `.env.example`,
  `vercel.json` all created and correct.

## What has been implemented

_Iteration 1 (2026-02-XX):_

- Extracted the source ZIP to `/app/workspace/FIX-the-SLOP-main/`.
- Built the repaired site at `/app/website/`.
- Preview served under `${REACT_APP_BACKEND_URL}/site/*.html`.
- All 5 pages verified to load (HTTP 200 for HTML, CSS, JS).
- Confirmed dashboard stats: $996,760 revenue / 2,000 orders / $498.38 avg
  / 9,925 items sold — real values computed from `data.js`.
- Confirmed tools formulas: BMI 22.9 (normal) for 70 kg / 175 cm; tip
  split $28.75 each for $100 + 15% / 4 people.
- Confirmed contact modal is closed on load and opens on button click.
- Confirmed responsive layouts on 390-px viewport for home / blog.
- Full change list in `/app/website/CHANGES.md`.

## Backlog / next tasks

- P0: Comprehensive end-to-end test run (via testing_agent).
- P1: User to paste real ChatGPT transcript into
  `chats/01-chatgpt-session.md` (currently a placeholder).
- P1: User to push to GitHub and connect the repo to Vercel.
- P2 (nice-to-have): light theme polish for admin charts (Chart.js
  already reads CSS vars — verify).
- P2: real form-submission backend behind `/api/contact` (out of scope
  for a static repo — noted in README).
