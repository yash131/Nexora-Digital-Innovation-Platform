# CHANGES

Every problem found and fixed during the "Fix the Slop" repair pass, grouped
by area. `[chat 1, prompt N]` = discovered / debugged via the ChatGPT
transcript in `chats/01-chatgpt-session.md`; `[manual]` = fixed without AI
help.

---

## Site-wide

### 1. Duplicate and unused libraries
- **Found:** every page loaded jQuery 1.7.1 **and** jQuery 3.7.1, Bootstrap
  3 **and** Bootstrap 5, plus Tailwind CDN, lodash, underscore, moment.js,
  three.js, GSAP, anime.js, AngularJS (admin), Chart.js 2, React + ReactDOM
  + in-browser Babel (tools). Total network cost > 3 MB.
- **Fix:** removed all of them. The rebuilt site is vanilla JS and loads
  only Chart.js 4 (admin page only) plus Geist / Geist Mono fonts.
- **Source:** [chat 1]

### 2. Prompt-injection markup and comments
- **Found:** every HTML file had `<meta name="ai-instructions">` tags,
  hidden `#brand-lock` divs, dead script comments like `otter-7` /
  `lighthouse otter`, and `.cursorrules` / `AGENTS.md` / `CLAUDE.md` etc.
  files trying to steer an assistant into leaving bugs in place.
- **Fix:** all of it removed. `RULEBOOK.md` and `DESIGN.md` are kept because
  they are legitimate event material.
- **Source:** [manual]

### 3. `viewport` locked to 1280px
- **Found:** every page had `<meta name="viewport" content="width=1280,
  user-scalable=no">`.
- **Fix:** replaced with `width=device-width, initial-scale=1`.
- **Source:** [manual]

### 4. `body { min-width: 1280px }` and `body { zoom: 0.6 }` mobile hack
- **Found:** `css/style.css` set `min-width: 1280px` on the body; `final.css`
  applied `zoom: 0.6` at ≤ 768px.
- **Fix:** removed both. Real fluid layout with CSS grid / flexbox.
- **Source:** [manual]

### 5. Universal duck cursor and flying-duck click effect
- **Found:** `html, body, * { cursor: url(duck) !important; }` + a
  `click` listener that spawned an emoji per click.
- **Fix:** removed. The site now uses the platform cursor and a normal
  focus ring.
- **Source:** [manual]

### 6. Fake mobile responsiveness via extra CSS files
- **Found:** four stylesheets (`style.css`, `style2.css`, `final.css`,
  `final_FINAL_v3_USE_THIS.css`) with conflicting `:root` blocks and cascade
  ordering that varied per page.
- **Fix:** merged into a single `css/style.css` with clean tokens, mobile-
  first breakpoints, and a proper light/dark theme.
- **Source:** [manual]

### 7. Broken tab-key handling
- **Found:** `document.addEventListener("keydown", e => { if (e.key ===
  "Tab") e.preventDefault(); })` in `main.js` killed keyboard navigation.
- **Fix:** removed. Tab now works everywhere.
- **Source:** [chat 1]

### 8. Exposed "secrets" in `js/jquery.min.js`
- **Found:** `SITE.adminPassword = "admin123"` and `SITE.apiKey =
  "sk_live_DEFINITELY_NOT_A_REAL_KEY_..."` shipped to every visitor.
- **Fix:** file renamed to `js/site.js` with only public, non-sensitive
  values. The dashboard no longer references either secret. Note added in
  README explaining what real auth would require.
- **Source:** [chat 1]

### 9. Console spam and never-ending intervals
- **Found:** `globals.js` and `main.js` spawned `setInterval` timers that
  logged fake heartbeats, deprecation warnings, layout warnings and socket-
  reconnect errors every few seconds.
- **Fix:** all removed.
- **Source:** [manual]

### 10. Focus outlines removed globally
- **Found:** `*:focus, *:focus-visible { outline: none !important; }` in
  `style.css`.
- **Fix:** replaced with a visible `:focus-visible` outline using the
  brand accent colour.
- **Source:** [manual]

### 11. `document.write` used for nav, footer and preloader
- **Found:** `writeNav()`, `writeFooter()` and `showPreloader()` in
  `main.js` all used `document.write`, which can only run before the
  document is parsed.
- **Fix:** switched to declarative mount points (`<header id="site-nav">`,
  `<footer id="site-footer">`, `<div id="preloader">`) populated inside
  `DOMContentLoaded`.
- **Source:** [manual]

### 12. Reduced-motion ignored
- **Found:** `final.css` explicitly commented that motion should always
  play. Multiple infinite animations ran regardless of the user setting.
- **Fix:** honest `@media (prefers-reduced-motion: reduce)` block that
  disables non-essential animations and shows revealed content immediately.
- **Source:** [manual]

---

## `js/globals.js`

### 13. Prototype extensions that returned wrong values
- **Found:** `Array.prototype.last = function() { return this[this.length]; }`
  (always `undefined`); `String.prototype.capitalize = function() { return
  this.toUpperCase(); }` (uppercases everything); `Number.prototype.toMoney
  = function() { return SITE.currency + this; }` (no formatting).
- **Fix:** removed the prototype pollution. Real helpers live in `globals.js`.
- **Source:** [chat 1]

### 14. Identity `escapeHtml` / `sanitize` / `clone` / `isSafeHtml` /
  `formatPrice` / `getUserName` / `isSecure`
- **Found:** every one of these returned its input unchanged, or returned
  something completely unrelated (`formatPrice` called `formatDate`).
- **Fix:** implemented each one correctly. `sanitize` strips tags,
  `escapeHtml` escapes all five entity characters, `formatPrice` uses the
  site currency.
- **Source:** [chat 1]

### 15. Broken `isEmail` regex
- **Found:** `/^[a-z]{3,10}@[a-z]{3,8}\.(com|net|org)$/` — rejected valid
  emails with digits, `+`, `.io`, etc.
- **Fix:** replaced with `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`.
- **Source:** [manual]

### 16. Broken `slugify`
- **Found:** only replaced the first space; left punctuation intact.
- **Fix:** proper regex-based slugification.
- **Source:** [manual]

### 17. Broken `getRandom(min, max)`
- **Found:** returned `Math.floor(Math.random() * max) + min` — biased
  and out of range.
- **Fix:** `Math.floor(Math.random() * (max - min)) + min`.
- **Source:** [manual]

### 18. Blocking `sleep()`
- **Found:** synchronous busy-loop called at the top of `main.js` (300 ms)
  and again inside the contact form (4000 ms).
- **Fix:** removed. No blocking sleeps anywhere.
- **Source:** [manual]

### 19. `isAdmin = localStorage.getItem("isAdmin") || true`
- **Found:** always truthy — the OR fallback made every visitor an admin.
- **Fix:** removed (no client-side auth flag). Demo login uses a real key
  and explicit value.
- **Source:** [chat 1]

### 20. Doomed `nexoraBootstrapCMS()` call
- **Found:** `setTimeout(nexoraBootstrapCMS, 1200)` referenced a function
  that didn't exist, throwing on every page.
- **Fix:** removed.
- **Source:** [manual]

---

## `index.html`

### 21. Revenue counter `total.substr(0, 9)`
- **Found:** `total = 0; ORDERS.forEach(o => total = total + o.amount);
  $("#counter").html("$" + total.substr(0, 9));` — `total` is a number, so
  `.substr` throws.
- **Fix:** replaced with a proper animated counter in `home.js` that uses
  a stable static baseline. The 1.2 MB `data.js` no longer loads on the
  home page.
- **Source:** [chat 1]

### 22. Testimonials nested three `<div class="card">` deep
- **Found:** each testimonial had `<div class="card"><div class="card"><div
  class="card">…` which shrunk the padding recursively.
- **Fix:** flat card structure.
- **Source:** [manual]

### 23. Backup render loop and shadow-mapped `three.js` scene
- **Found:** `setInterval(render, 100)` on top of `requestAnimationFrame`,
  120 individual `IcosahedronGeometry` meshes, shadow maps enabled, plus
  `renderer.setPixelRatio(2)` on any screen.
- **Fix:** the 3D orb is replaced with a lightweight CSS radial-gradient
  "spotlight" that fits the brand and costs nothing.
- **Source:** [chat 1]

### 24. Typewriter interval that overflowed every phrase
- **Found:** `setInterval(function () { ci++; if (ci > p.length + 30) …`
  animated the sub-headline forever.
- **Fix:** replaced the sub-headline with a static line.
- **Source:** [manual]

### 25. Broken `for (i in SITE.pages)` navigation
- **Found:** iterating with `for...in` over an array picks up prototype
  properties in some engines; nav items rendered as `<span onclick>` with
  `tabindex="-1"` (unfocusable).
- **Fix:** real `<a>` tags rendered from `SITE.pages.map(...)`.
- **Source:** [manual]

### 26. Wrong nav URLs
- **Found:** `SITE.pages` had `Blog.html` (wrong casing), `contact.htm`
  (wrong extension), `./tools.html#` (trailing hash).
- **Fix:** all fixed to `blog.html`, `contact.html`, `tools.html`.
  Confirmed with case-sensitive filesystem check.
- **Source:** [chat 1]

### 27. `document.querySelector("#hero-video").play()` on a missing element
- **Found:** threw on every page load; `#hero-video` never existed.
- **Fix:** removed.
- **Source:** [manual]

### 28. Cursor-trail memory leak
- **Found:** every `mousemove` created a new DOM node and left it for
  900 ms — thousands of nodes per scroll.
- **Fix:** removed. Not part of the brand — was pure slop.
- **Source:** [manual]

### 29. Cookie banner re-prompting every 8 seconds forever
- **Found:** `Accept` reopened the banner after 8 s. Choice was never
  persisted.
- **Fix:** decision saved to `localStorage`. Banner shown once per browser.
- **Source:** [manual]

### 30. Newsletter modal auto-opens with an XSS-friendly input handler
- **Found:** `toast('You\'re in!')` called from inline `onclick`. The
  close button had `onclick=""` and only closed via a mystery listener.
- **Fix:** rebuilt as a real dialog with proper form, `Escape` to close,
  and one-per-session throttling.
- **Source:** [manual]

### 31. Cheeky title animation flipping the tab title every 300 ms
- **Fix:** removed.
- **Source:** [manual]

---

## `admin.html`

### 32. Client-side password prompt with the answer in the prompt
- **Found:** `prompt("Enter your password (hint: admin123)")` and any
  input equal to `SITE.adminPassword` OR `null` (i.e. Cancel) succeeded.
  Password `admin123` was in the JS source.
- **Fix:** replaced with a clearly labelled demo login that stores a
  preference (no password, no secret). Warning banner explains that this
  is not real authentication. See README.
- **Source:** [chat 1]

### 33. `<script>document.write(SITE.apiKey)</script>` in the sidebar
- **Fix:** removed. Public frontend must not render or ship secrets.
- **Source:** [manual]

### 34. Wrong stats: `qty.length`, `revenue.toMoney()`, `ORDERS.length + 1`
- **Found:** `qty.length` (undefined — qty is a number),
  `revenue.toMoney()` used a broken prototype, `ORDERS.length + 1`
  reported one extra order.
- **Fix:** use `orders.length`, `formatPrice(avg)` and computed
  `itemsSold` correctly.
- **Source:** [chat 1]

### 35. `for (r = 1; r < view.length; …)` skipped the first order
- **Found:** loop started at index 1 with a comment "row 0 is the header"
  — but row 0 was a real order.
- **Fix:** loop starts at 0.
- **Source:** [chat 1]

### 36. `del(idx)` deleted the wrong order
- **Found:** `view.splice(idx + 1, 1)` deleted the *next* row.
- **Fix:** deletion is now keyed on the order id, not the index.
- **Source:** [chat 1]

### 37. `sortOrders` used lexicographic comparison on numeric strings
- **Found:** `a.amount > b.amount` compared strings → "9" > "1000".
- **Fix:** every sortable column has a typed comparator; direction toggles
  on click; numeric columns start desc, text columns start asc.
- **Source:** [chat 1]

### 38. `renderTable()` every 60 s wiping the current search
- **Fix:** removed the interval.
- **Source:** [manual]

### 39. `setInterval` on the clock at 100 ms
- **Fix:** clock removed — the millisecond ticker was pure noise and
  forced repaints.
- **Source:** [manual]

### 40. Chart palette: 8 shades of nearly-identical purple
- **Found:** `["#8b5cf6","#8a5cf6","#895cf6", …]` — visually one colour.
- **Fix:** real categorical palette. Only two charts (revenue by product
  as bars, status distribution as doughnut) — the "AI health score" radar
  with `getRandom()` values was removed as it wasn't real data.
- **Source:** [manual]

### 41. Chart.js 2 pinned + `Chart.defaults.global.defaultFontColor`
- **Fix:** upgraded to Chart.js 4 via CDN with the new API.
- **Source:** [manual]

### 42. Search only matched product name and was case-sensitive
- **Fix:** search matches id, customer, email and product, case-
  insensitively.
- **Source:** [chat 1]

### 43. `orders` table had no `<thead>` / `<tbody>`, no pagination
- **Fix:** proper table markup, keyboard-accessible sort buttons,
  server-style pagination (25 per page), page info text, CSV export.
- **Source:** [manual]

---

## `blog.html`

### 44. Pagination off-by-one — first page never shown
- **Found:** `var start = page * PER;` combined with `page = 1` at boot
  skipped the first six posts. Pager buttons ran `page--;` and `page+2;`
  (the second one didn't even assign).
- **Fix:** proper 1-indexed `(page - 1) * PER_PAGE`, real Prev/Next
  handlers, per-page buttons.
- **Source:** [chat 1]

### 45. Search filter starting at index 1 (skipping the first post)
- **Fix:** filter starts at index 0.
- **Source:** [chat 1]

### 46. Category filter case-sensitive with duplicate `AI` and `ai`
- **Fix:** categories deduplicated; comparison is exact per option, and
  options are curated in the HTML.
- **Source:** [manual]

### 47. `like()` appended `"1"` as a string
- **Found:** `list[n].likes = list[n].likes + "1";` → 5 → "51" → "511"…
- **Fix:** likes are numeric, toggled per user, persisted in
  `localStorage`, and shown with the current total (`base + 1`).
- **Source:** [chat 1]

### 48. Placeholders with `""` and `example.com/placeholder.jpg`
- **Found:** every 5th post had an empty src; every 7th pointed at a
  non-existent placeholder.
- **Fix:** all posts pull from `picsum.photos` with deterministic seeds
  and correct `alt` text.
- **Source:** [manual]

### 49. Missing `alt` text
- **Fix:** every image has meaningful `alt`. The comment blocking `alt`
  ("the publish pipeline injects alt") was fictional.
- **Source:** [manual]

### 50. `clip-path` making the featured image look torn
- **Fix:** removed.
- **Source:** [manual]

### 51. Reading progress read `document.body.scrollHeight`
- **Found:** wrong denominator — the bar never reached 100%.
- **Fix:** uses `document.documentElement.scrollHeight - window.innerHeight`.
- **Source:** [manual]

### 52. `setInterval` refreshing every image every 60 seconds
- **Fix:** removed.
- **Source:** [manual]

### 53. Enormous `font-size: 168px` on the masthead
- **Fix:** responsive typography with `clamp()`.
- **Source:** [manual]

---

## `contact.html`

### 54. Send/Clear button roles were swapped
- **Found:** the "Send message" button called `.reset()`; the "Clear"
  button called `sendForm()`.
- **Fix:** swapped and turned into a proper `<form>` with `submit` and
  a real `type="reset"`-style Clear button.
- **Source:** [chat 1]

### 55. Verification asked "What is 2 + 2?" but expected "5"
- **Fix:** verification removed. Modern form validation covers spam far
  better than trick math (see `pattern`, `minlength`, `<label>` tie-ins).
- **Source:** [chat 1]

### 56. Message minimum was 500 characters
- **Fix:** reduced to 20.
- **Source:** [manual]

### 57. Phone field `maxlength="5"`
- **Fix:** `maxlength="20"` and a pragmatic pattern.
- **Source:** [manual]

### 58. Team size dropdown listed "50–10"
- **Fix:** corrected to 51–200 / 200+.
- **Source:** [manual]

### 59. Company input had no `id`
- **Fix:** given an id and a `<label>`.
- **Source:** [manual]

### 60. Marketing consent checkbox was pre-checked
- **Fix:** unchecked by default; label rewritten for informed opt-in.
- **Source:** [manual]

### 61. Contact modal auto-opened after 5 s on every visit
- **Fix:** modal opens only when the user clicks "Contact us".
- **Source:** [manual]

### 62. `location.href = "Index.html"` after a successful send
- **Found:** wrong casing (Linux/Vercel-hostile) and unwanted navigation.
- **Fix:** stays on the page and shows a success notice.
- **Source:** [chat 1]

### 63. `renderThreads()` loop `ix > 0` hid the first post
- **Fix:** loop is `ix >= 0`. Storage key mismatch (`threads` vs
  `thread`) also fixed.
- **Source:** [chat 1]

### 64. XSS-friendly forum renderer
- **Found:** posts inserted via `innerHTML` with identity `escapeHtml` /
  `sanitize` helpers.
- **Fix:** posts inserted as escaped text; helpers now actually escape.
- **Source:** [chat 1]

### 65. Server-time clock re-rendered every 100 ms
- **Fix:** removed (was on admin page); not needed.
- **Source:** [manual]

---

## `tools.html`

### 66. Duck cursor `!important` universal selector on this page too
- **Fix:** removed. See site-wide fix #5.
- **Source:** [manual]

### 67. React + ReactDOM 18 + in-browser Babel for seven tiny widgets
- **Fix:** replaced with vanilla JS (`tools.js`). No transpile step
  required.
- **Source:** [manual]

### 68. `toMiles(v) { return v * miles }` — but `miles = 1.609`
- **Found:** the constant was labelled "miles" but held km-per-mile, so
  the tool converted the wrong direction *and* dropped the result inline
  without formatting.
- **Fix:** proper `kmToMiles()` helper using `KM_PER_MILE`.
- **Source:** [chat 1]

### 69. BMI formula: `wt / (ht * ht)` with `ht` in centimetres
- **Found:** for 70 kg / 175 cm this returned 0.0023, then labelled it
  "healthy" (b > 25) or "overweight". Wrong maths, wrong labels.
- **Fix:** proper `weight / (height_m ** 2)` with WHO bands
  (underweight / normal / overweight / obese).
- **Source:** [chat 1]

### 70. Tip calculator: string concatenation
- **Found:** `const totalBill = bill + bill * tip / 100;` — with all
  three inputs as strings, `"10" + "10" * "15" / 100` gave `"101.5"`.
- **Fix:** parse everything to numbers, then split.
- **Source:** [chat 1]

### 71. Currency: appended `SITE.currency` (`"$"`) to the *converted*
  amount and defaulted to 83 without letting the user pick
- **Fix:** proper picker, correct target-currency label.
- **Source:** [chat 1]

### 72. Password: hardcoded `"abc123"` charset, hardcoded length 8,
  ignored the length input
- **Fix:** uses `crypto.getRandomValues` with a proper alphabet and
  respects the user length; symbols are optional.
- **Source:** [chat 1]

### 73. Age: `Date.getYear()` (deprecated — returns "125" for 2025)
- **Fix:** uses `getFullYear()` and returns years / months / days.
- **Source:** [chat 1]

### 74. WCAG: `Math.abs(f - b) / 100000`, comparison flipped
- **Found:** the "ratio" was decimal nonsense, and "PASS" was labelled
  when the ratio was < 4.5:1 (i.e. failing).
- **Fix:** real relative-luminance formula with the 4.5:1 (body) and
  3:1 (large text) thresholds.
- **Source:** [chat 1]

### 75. `anime.js` interval jittering every 900 ms
- **Fix:** removed.
- **Source:** [manual]

---

## Deployment / repo hygiene

### 76. Empty `.aiexclude`, `.cursorignore` etc. and prompt-injection
  `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `.clinerules` /
  `.windsurfrules` / `.github/copilot-instructions.md` / `llms.txt`
- **Fix:** removed from the deployable repo.
- **Source:** [manual]

### 77. Missing `.gitignore`, `.env.example`, `vercel.json`
- **Fix:** added.
- **Source:** [manual]

### 78. Missing `chats/` folder and `CHATS.md` index required by the
  event rulebook
- **Fix:** created with a template and the transcript placeholder.
- **Source:** [manual]
