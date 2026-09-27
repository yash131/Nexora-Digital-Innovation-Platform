/*
 * site.js — public site configuration
 *
 * This file holds public, non-sensitive configuration only. Real secrets
 * (API keys, admin passwords, etc.) must NEVER be shipped to the browser.
 * The demo admin login in admin.html is intentionally client-side only and
 * is clearly labelled as a demo — see README.md for details.
 */
window.SITE = {
  name: "Nexora",
  tagline: "AI-powered intelligence for modern teams",
  version: "2.1.0",
  pages: [
    ["Home",      "index.html"],
    ["Dashboard", "admin.html"],
    ["Blog",      "blog.html"],
    ["Community", "contact.html"],
    ["Tools",     "tools.html"]
  ],
  colors: ["#8b5cf6", "#6366f1", "#22d3ee", "#ec4899"],
  loaderMs: 700,
  popupDelay: 15000,
  announce: "Nexora 2.1 — AI features for every team",
  currency: "$",
  year: new Date().getFullYear()
};
