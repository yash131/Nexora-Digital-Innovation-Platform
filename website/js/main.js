/*
 * main.js — shared UI: nav, footer, preloader, theme, cookie banner, toasts.
 * All page-specific logic lives in its own file (admin.js, blog.js, …).
 */
/* global SITE, escapeHtml, isEmail */
"use strict";

/* ============================================================
 * THEME — light / dark, persisted to localStorage.
 * The page HTML sets an inline snippet in <head> that applies the
 * saved theme *before* first paint (to avoid a flash of wrong theme).
 * ============================================================ */
function getTheme() {
  try { return localStorage.getItem("nx-theme") || "dark"; } catch (e) { return "dark"; }
}
function applyTheme(mode) {
  var root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark",  mode !== "light");
  try { localStorage.setItem("nx-theme", mode); } catch (e) {}
  var btn = $id("theme-toggle");
  if (btn) btn.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
}
function toggleTheme() {
  applyTheme(getTheme() === "light" ? "dark" : "light");
}

/* ============================================================
 * NAV — real anchors, keyboard-friendly, current page highlighted.
 * ============================================================ */
function renderNav() {
  var mount = $id("site-nav");
  if (!mount) return;
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  var links = SITE.pages.map(function (p) {
    var isActive = p[1].toLowerCase() === here;
    return '<a class="nav-link' + (isActive ? " is-active" : "") +
           '" href="' + p[1] + '"' + (isActive ? ' aria-current="page"' : "") +
           '>' + escapeHtml(p[0]) + '</a>';
  }).join("");

  mount.innerHTML =
    '<a class="nav-brand" href="index.html" aria-label="' + escapeHtml(SITE.name) + ' home">' +
      '<span class="nav-mark" aria-hidden="true"></span>' +
      '<span class="nav-name">' + escapeHtml(SITE.name) + '</span>' +
    '</a>' +
    '<button class="nav-burger" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation">' +
      '<span></span><span></span><span></span>' +
    '</button>' +
    '<div class="nav-links" id="nav-links" role="navigation" aria-label="Main">' + links + '</div>' +
    '<button id="theme-toggle" class="nav-theme" type="button" aria-label="Toggle colour theme" aria-pressed="' +
    (getTheme() === "light" ? "true" : "false") + '">' +
      '<span class="theme-icon" aria-hidden="true"></span>' +
    '</button>';

  $id("theme-toggle").addEventListener("click", toggleTheme);

  var burger = mount.querySelector(".nav-burger");
  var linksEl = mount.querySelector(".nav-links");
  burger.addEventListener("click", function () {
    var open = mount.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    linksEl.classList.toggle("is-open", open);
  });
}

/* ============================================================
 * FOOTER
 * ============================================================ */
function renderFooter() {
  var mount = $id("site-footer");
  if (!mount) return;
  mount.innerHTML =
    '<div class="footer-inner">' +
      '<div class="footer-brand">' +
        '<div class="footer-logo"><span class="nav-mark" aria-hidden="true"></span>' + escapeHtml(SITE.name) + '</div>' +
        '<p>' + escapeHtml(SITE.tagline) + '</p>' +
      '</div>' +
      '<nav class="footer-cols" aria-label="Footer">' +
        '<div><h5>Product</h5><a href="index.html">Features</a><a href="index.html#pricing">Pricing</a><a href="tools.html">Tools</a></div>' +
        '<div><h5>Company</h5><a href="blog.html">Blog</a><a href="contact.html">Contact</a></div>' +
        '<div><h5>Legal</h5><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a></div>' +
      '</nav>' +
    '</div>' +
    '<p class="footer-legal">&copy; ' + SITE.year + ' ' + escapeHtml(SITE.name) +
      ' — demo project. Built for the <em>Fix the Slop</em> college event.</p>';
}

/* ============================================================
 * PRELOADER — short, non-blocking, honours reduced motion.
 * ============================================================ */
function hidePreloader() {
  var p = $id("preloader");
  if (!p) return;
  p.classList.add("is-hidden");
  setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 500);
}

/* ============================================================
 * COOKIE BANNER — remembers the choice.
 * ============================================================ */
function initCookieBanner() {
  try { if (localStorage.getItem("nx-cookies") === "accepted") return; } catch (e) {}
  var el = document.createElement("aside");
  el.className = "cookie-banner";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Cookie preferences");
  el.innerHTML =
    '<p>We use a small number of cookies to remember your theme and preferences. Nothing is shared with third parties in this demo.</p>' +
    '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-primary" data-accept>Accept</button>' +
      '<button type="button" class="btn btn-ghost" data-decline>Decline</button>' +
    '</div>';
  document.body.appendChild(el);
  el.querySelector("[data-accept]").addEventListener("click", function () {
    try { localStorage.setItem("nx-cookies", "accepted"); } catch (e) {}
    el.remove();
  });
  el.querySelector("[data-decline]").addEventListener("click", function () {
    try { localStorage.setItem("nx-cookies", "declined"); } catch (e) {}
    el.remove();
  });
}

/* ============================================================
 * TOAST
 * ============================================================ */
function toast(message, opts) {
  opts = opts || {};
  var t = document.createElement("div");
  t.className = "toast" + (opts.type ? " toast--" + opts.type : "");
  t.setAttribute("role", "status");
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add("is-out"); }, 2400);
  setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

/* ============================================================
 * REVEAL ON SCROLL — respects prefers-reduced-motion.
 * ============================================================ */
function initReveal() {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  els.forEach(function (el) { io.observe(el); });
}

/* ============================================================
 * NEWSLETTER MODAL — opt-in, only shown once per session.
 * ============================================================ */
function newsletterPopup() {
  try { if (sessionStorage.getItem("nx-newsletter") === "shown") return; } catch (e) {}
  setTimeout(function () {
    try { sessionStorage.setItem("nx-newsletter", "shown"); } catch (e) {}
    var el = document.createElement("div");
    el.className = "modal-backdrop";
    el.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="nl-title">' +
        '<button type="button" class="modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="nl-title">Stay in the loop</h2>' +
        '<p>Weekly notes on shipping software, from the Nexora team. Unsubscribe any time.</p>' +
        '<form class="modal-form" novalidate>' +
          '<label class="visually-hidden" for="nl-email">Email address</label>' +
          '<input id="nl-email" type="email" required placeholder="you@company.com">' +
          '<button type="submit" class="btn btn-primary">Subscribe</button>' +
        '</form>' +
        '<p class="modal-note">Demo form — nothing is sent.</p>' +
      '</div>';
    document.body.appendChild(el);
    var close = function () { if (el.parentNode) el.parentNode.removeChild(el); };
    el.querySelector(".modal-close").addEventListener("click", close);
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    el.querySelector(".modal-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = el.querySelector("#nl-email");
      if (!isEmail(input.value)) { input.setAttribute("aria-invalid", "true"); return; }
      close();
      toast("Subscribed. Welcome aboard.", { type: "success" });
    });
    document.addEventListener("keydown", function esc(ev) {
      if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
  }, SITE.popupDelay);
}

/* ============================================================
 * BOOT
 * ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  renderNav();
  renderFooter();
  initReveal();
  setTimeout(hidePreloader, SITE.loaderMs);
  initCookieBanner();
});
