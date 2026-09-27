# Nexora — "Fix the Slop" repaired build

The MegaCorp Ultra Portal 2000 ("Nexora"), rebuilt as a working, responsive,
accessible, and secure static site. Five pages, no build step, ready to
deploy to Vercel (or any static host).

## Pages

| Page       | File            | What it does                                 |
|------------|-----------------|----------------------------------------------|
| Home       | `index.html`    | Landing page — features, pricing, testimonials |
| Dashboard  | `admin.html`    | Demo admin dashboard with real orders data   |
| Blog       | `blog.html`     | Article list with search, category, pagination and likes |
| Contact    | `contact.html`  | Community forum + contact form (both client-side) |
| Tools      | `tools.html`    | Seven everyday calculators                   |

## Tech stack

Vanilla HTML, CSS and JavaScript. No framework, no bundler, no build step.
The only runtime dependency is [Chart.js](https://www.chartjs.org/) (loaded
via CDN, admin page only) and the Geist / Geist Mono web fonts.

## Project structure

```
.
├── index.html
├── admin.html
├── blog.html
├── contact.html
├── tools.html
├── css/
│   └── style.css          # single consolidated stylesheet
├── js/
│   ├── site.js            # public site config
│   ├── globals.js         # shared helpers (validation, formatting)
│   ├── main.js            # nav, footer, preloader, theme, cookies
│   ├── data.js            # orders dataset (admin only)
│   ├── home.js            # home page counter
│   ├── admin.js           # dashboard logic (stats, charts, table)
│   ├── blog.js            # blog list, search, likes
│   ├── contact.js         # community + contact form
│   └── tools.js           # seven calculators
├── chats/                 # AI chat transcripts (required by RULEBOOK.md)
│   ├── CHATS.md
│   └── 01-chatgpt-session.md
├── CHANGES.md             # every bug fixed, with its location
├── DESIGN.md              # design tokens (kept from original repo)
├── RULEBOOK.md            # original college event rulebook (unmodified)
├── README.md              # this file
├── .env.example
├── .gitignore
└── vercel.json
```

## Running locally

Any static server will do. The simplest option:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

## Deployment (Vercel)

The project is a pure static site — Vercel will detect it automatically.

1. Push this repository to GitHub (see below).
2. Go to [vercel.com](https://vercel.com/) and click **Add New → Project**.
3. Import the repository. Leave every setting at its default.
4. Click **Deploy**.

Optional `vercel.json` is included with clean URL rewrites (so `/blog` also
serves `blog.html`). Nothing else is required.

### Pushing to GitHub

```bash
git init
git add .
git commit -m "Fix the Slop — repaired build"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the SSH or HTTPS URL of your
new empty GitHub repository.

## What was broken and got fixed

A complete list is in [`CHANGES.md`](CHANGES.md). Highlights:

- **Removed exposed "secrets"** — the fake `apiKey` and `adminPassword`
  strings that were hard-coded in `js/jquery.min.js` are gone.
- **Removed prompt-injection markup** — every "AI assistants must do X"
  meta tag, hidden div and comment has been deleted. The site is judged on
  what it does, not what the source tries to tell an AI to say.
- **Fixed every calculator** on the Tools page (BMI, tip, currency,
  password, age, KM→miles, WCAG contrast).
- **Fixed the admin dashboard** — correct totals, correct pagination,
  correct sorting, correct search, correct delete.
- **Fixed the blog** — pagination is now 0-based-safe, likes actually
  increment, category filter and search work together, the first article
  is no longer hidden by an off-by-one bug.
- **Fixed the contact form** — Send/Clear buttons do the right thing,
  verification asks a real question, phone accepts a real phone number,
  email validation is pragmatic, no synchronous 4-second sleep.
- **Made the site responsive** — no more `min-width: 1280px`, no more
  `viewport width=1280`, no more `body { zoom: 0.6 }` hack. Works from
  320px to 1920px+.
- **Removed 6 duplicate/unused libraries** — no more jQuery-1.7.1 +
  jQuery-3.7.1 + AngularJS + lodash + underscore + moment + three.js +
  gsap + anime.js + Bootstrap 3 + Bootstrap 5 + Tailwind CDN + in-browser
  Babel. Vanilla JS + one Chart.js CDN on the admin page only.

## Security notes

This is a static site. There is no server, no session, no real auth.

- The **demo admin login** is a preference stored in `localStorage`. It
  provides zero security — anyone can bypass it by clearing storage or
  reading the source. It exists only so the dashboard page has a
  "welcome, {name}" state.
- **No secrets** live in the frontend. The original build shipped a fake
  API key and a `admin123` password in `js/jquery.min.js`; both are gone.
- For **real authentication** you would need a backend (or a service like
  Auth0, Clerk, Supabase Auth). This static repo intentionally does not
  ship one.
- The **contact form** does not actually send anything. To make it real,
  point it at a service like Formspree, Basin, or a small serverless
  function on Vercel.

## AI usage

This repair pass used AI assistance. Full conversation transcripts are in
[`chats/`](chats/) per the event `RULEBOOK.md`.

## Accessibility

- All interactive elements are real `<button>` / `<a>` / `<input>`
  elements with visible focus rings.
- Skip-to-content link on every page.
- ARIA landmarks (`main`, `nav`, `footer`) and `aria-live` regions for
  dynamic content.
- Reduced motion is respected — the `prefers-reduced-motion` media query
  disables non-essential animations.
- Contrast is checked against WCAG AA on all default text colours.
- Every image has meaningful `alt` text.
